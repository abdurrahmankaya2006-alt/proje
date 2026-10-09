import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import db, { PACKAGES, DAILY_WATER_TARGET_ML } from './database.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const ADMIN = {
  email: 'admin@gym.com',
  password: 'admin123',
  firstName: 'Yönetici',
};

// --- Yardimci fonksiyonlar ---
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysRemaining(endDate) {
  const today = new Date().setHours(0, 0, 0, 0);
  const end = new Date(endDate).setHours(0, 0, 0, 0);
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
}

// Sunucunun yerel saatine gore bugunun tarihi (YYYY-MM-DD)
function todayStr() {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

function getMemberOr404(id, res) {
  const row = db.prepare('SELECT * FROM members WHERE id = ?').get(Number(id));
  if (!row) {
    res.status(404).json({ error: 'Üye bulunamadı.' });
    return null;
  }
  return row;
}

function toPublicMember(row) {
  const remaining = daysRemaining(row.end_date);
  const pkg = PACKAGES[row.package] || { days: 30 };
  const bmi = row.weight_kg / Math.pow(row.height_cm / 100, 2);
  const dailyCalorieTarget = Math.round(row.weight_kg * 30);

  const today = todayStr();
  const calorieRow = db
    .prepare('SELECT COALESCE(SUM(kcal), 0) AS total FROM calorie_logs WHERE member_id = ? AND log_date = ?')
    .get(row.id, today);
  const waterRow = db
    .prepare('SELECT COALESCE(SUM(ml), 0) AS total FROM water_logs WHERE member_id = ? AND log_date = ?')
    .get(row.id, today);

  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    package: row.package,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    targetWeightKg: row.target_weight_kg ?? null,
    startDate: row.start_date,
    endDate: row.end_date,
    daysRemaining: remaining,
    totalDays: pkg.days,
    status: remaining > 0 ? 'Aktif' : 'Pasif',
    bmi: Math.round(bmi * 10) / 10,
    dailyCalorieTarget,
    dailyProteinTarget: Math.round(row.weight_kg * 1.6),
    caloriesToday: calorieRow.total,
    caloriesRemaining: Math.round(dailyCalorieTarget - calorieRow.total),
    waterTodayMl: waterRow.total,
    waterTargetMl: DAILY_WATER_TARGET_ML,
  };
}

// --- AUTH ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-posta ve şifre gerekli.' });
  }

  if (email.toLowerCase() === ADMIN.email) {
    if (password === ADMIN.password) {
      return res.json({
        role: 'admin',
        user: { email: ADMIN.email, firstName: ADMIN.firstName },
      });
    }
    return res.status(401).json({ error: 'Şifre hatalı.' });
  }

  const row = db.prepare('SELECT * FROM members WHERE email = ?').get(email.toLowerCase());
  if (!row) {
    return res.status(401).json({ error: 'Bu e-posta ile kayıtlı üye bulunamadı.' });
  }
  const match = bcrypt.compareSync(password, row.password);
  if (!match) {
    return res.status(401).json({ error: 'Şifre hatalı.' });
  }
  return res.json({ role: 'member', user: toPublicMember(row) });
});

// --- ÜYE LISTESI (Admin) ---
app.get('/api/members', (req, res) => {
  const rows = db.prepare('SELECT * FROM members ORDER BY created_at DESC').all();
  res.json(rows.map(toPublicMember));
});

// --- DASHBOARD OZETI (Admin) ---
app.get('/api/dashboard', (req, res) => {
  const rows = db.prepare('SELECT * FROM members').all();
  const members = rows.map(toPublicMember);

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'Aktif').length;
  const expiredMembers = totalMembers - activeMembers;

  const monthlyRevenue = members.reduce((sum, m) => {
    if (m.status !== 'Aktif') return sum;
    const pkg = PACKAGES[m.package];
    if (!pkg) return sum;
    const monthlyEquivalent = pkg.price / (pkg.days / 30);
    return sum + monthlyEquivalent;
  }, 0);

  res.json({
    totalMembers,
    activeMembers,
    expiredMembers,
    monthlyRevenue: Math.round(monthlyRevenue),
  });
});

// --- YENI UYE EKLE (Admin) ---
app.post('/api/members', (req, res) => {
  const { firstName, lastName, email, password, packageName, heightCm, weightKg } = req.body;

  if (!firstName || !lastName || !email || !password || !packageName || !heightCm || !weightKg) {
    return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
  }
  if (!PACKAGES[packageName]) {
    return res.status(400).json({ error: 'Geçersiz paket seçimi.' });
  }
  if (email.toLowerCase() === ADMIN.email) {
    return res.status(400).json({ error: 'Bu e-posta adresi kullanılamaz.' });
  }

  const existing = db.prepare('SELECT id FROM members WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Bu e-posta ile kayıtlı bir üye zaten var.' });
  }

  const startDate = new Date().toISOString().slice(0, 10);
  const endDate = addDays(startDate, PACKAGES[packageName].days);
  const hashed = bcrypt.hashSync(password, 8);

  const stmt = db.prepare(`
    INSERT INTO members (first_name, last_name, email, password, package, height_cm, weight_kg, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    firstName,
    lastName,
    email.toLowerCase(),
    hashed,
    packageName,
    heightCm,
    weightKg,
    startDate,
    endDate
  );

  const row = db.prepare('SELECT * FROM members WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(toPublicMember(row));
});

// --- UYE DUZENLE (Admin) ---
app.patch('/api/members/:id', (req, res) => {
  const row = getMemberOr404(req.params.id, res);
  if (!row) return;

  const {
    firstName = row.first_name,
    lastName = row.last_name,
    email = row.email,
    packageName = row.package,
    heightCm = row.height_cm,
    weightKg = row.weight_kg,
    endDate,
  } = req.body;

  if (!PACKAGES[packageName]) {
    return res.status(400).json({ error: 'Geçersiz paket seçimi.' });
  }

  const normalizedEmail = email.toLowerCase();
  if (normalizedEmail === ADMIN.email) {
    return res.status(400).json({ error: 'Bu e-posta adresi kullanılamaz.' });
  }
  const emailOwner = db.prepare('SELECT id FROM members WHERE email = ?').get(normalizedEmail);
  if (emailOwner && emailOwner.id !== row.id) {
    return res.status(400).json({ error: 'Bu e-posta başka bir üyede kayıtlı.' });
  }

  // Bitis tarihi verilmemisse ve paket degismisse, bugunden itibaren yeniden hesapla.
  // Paket degismediyse ve tarih verilmediyse mevcut bitis tarihini koru.
  let finalEndDate = endDate;
  if (!finalEndDate) {
    finalEndDate = packageName !== row.package ? addDays(todayStr(), PACKAGES[packageName].days) : row.end_date;
  }

  db.prepare(
    `UPDATE members SET first_name = ?, last_name = ?, email = ?, package = ?, height_cm = ?, weight_kg = ?, end_date = ? WHERE id = ?`
  ).run(firstName, lastName, normalizedEmail, packageName, heightCm, weightKg, finalEndDate, row.id);

  const updated = db.prepare('SELECT * FROM members WHERE id = ?').get(row.id);
  res.json(toPublicMember(updated));
});

// --- HEDEF KILO GUNCELLE (Uye kendisi) ---
app.patch('/api/members/:id/target-weight', (req, res) => {
  const row = getMemberOr404(req.params.id, res);
  if (!row) return;
  const { targetWeightKg } = req.body;
  if (targetWeightKg === null) {
    db.prepare('UPDATE members SET target_weight_kg = NULL WHERE id = ?').run(row.id);
  } else {
    const value = Number(targetWeightKg);
    if (!value || value <= 0) {
      return res.status(400).json({ error: 'Geçerli bir hedef kilo girin.' });
    }
    db.prepare('UPDATE members SET target_weight_kg = ? WHERE id = ?').run(value, row.id);
  }
  const updated = db.prepare('SELECT * FROM members WHERE id = ?').get(row.id);
  res.json(toPublicMember(updated));
});

// --- KALORI GUNLUGU (Uye) ---
app.post('/api/calorie-logs', (req, res) => {
  const { memberId, kcal, note } = req.body;
  const row = getMemberOr404(memberId, res);
  if (!row) return;
  const value = Number(kcal);
  if (!value || value <= 0) {
    return res.status(400).json({ error: 'Geçerli bir kalori değeri girin.' });
  }
  db.prepare('INSERT INTO calorie_logs (member_id, log_date, kcal, note) VALUES (?, ?, ?, ?)').run(
    row.id,
    todayStr(),
    value,
    note || null
  );
  const updated = db.prepare('SELECT * FROM members WHERE id = ?').get(row.id);
  res.status(201).json(toPublicMember(updated));
});

// --- SU GUNLUGU (Uye) ---
app.post('/api/water-logs', (req, res) => {
  const { memberId, ml } = req.body;
  const row = getMemberOr404(memberId, res);
  if (!row) return;
  const value = Number(ml);
  if (!value || value <= 0) {
    return res.status(400).json({ error: 'Geçerli bir su miktarı girin.' });
  }
  db.prepare('INSERT INTO water_logs (member_id, log_date, ml) VALUES (?, ?, ?)').run(row.id, todayStr(), value);
  const updated = db.prepare('SELECT * FROM members WHERE id = ?').get(row.id);
  res.status(201).json(toPublicMember(updated));
});

// --- SALONA GELIS (CHECK-IN) TAKVIMI (Uye) ---
app.post('/api/checkins', (req, res) => {
  const { memberId } = req.body;
  const row = getMemberOr404(memberId, res);
  if (!row) return;
  try {
    db.prepare('INSERT INTO checkins (member_id, checkin_date) VALUES (?, ?)').run(row.id, todayStr());
  } catch {
    return res.status(400).json({ error: 'Bugün için zaten giriş kaydettin.' });
  }
  res.status(201).json({ date: todayStr() });
});

app.get('/api/checkins/:memberId', (req, res) => {
  const row = getMemberOr404(req.params.memberId, res);
  if (!row) return;
  // month formatı: YYYY-MM. Verilmezse bu ay kullanilir.
  const month = req.query.month || todayStr().slice(0, 7);
  const rows = db
    .prepare('SELECT checkin_date FROM checkins WHERE member_id = ? AND checkin_date LIKE ? ORDER BY checkin_date')
    .all(row.id, `${month}-%`);
  res.json({
    month,
    dates: rows.map((r) => r.checkin_date),
    count: rows.length,
  });
});

// --- UYE SIL (Admin) ---
app.delete('/api/members/:id', (req, res) => {
  db.prepare('DELETE FROM members WHERE id = ?').run(Number(req.params.id));
  res.status(204).send();
});

// --- PAKET LISTESI ---
app.get('/api/packages', (req, res) => {
  res.json(PACKAGES);
});

app.listen(PORT, () => {
  console.log(`✅ Gym API çalışıyor: http://localhost:${PORT}`);
  console.log(`   Admin giriş: admin@gym.com / admin123`);
});
