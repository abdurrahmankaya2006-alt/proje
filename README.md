# PROTOKOL — Spor Salonu Üyelik ve Takip Sistemi

Full-stack Gym Management System: **React + Tailwind CSS (Lucide ikonlar)** frontend,
**Node.js + Express + SQLite (`node:sqlite` yerleşik modülü)** backend. Kurulum gerektiren
ayrı bir veritabanı sunucusu yok ve derleme (native build) gerektiren hiçbir paket yok —
SQLite verisi `backend/gym.db` dosyasında tutulur ve backend ilk çalıştığında otomatik
oluşturulur.

> **Node.js sürümü:** `node:sqlite` için en az Node 22.5 gerekir; Node 24+ önerilir
> (flag gerektirmeden ve kararlı şekilde çalışır). `node -v` ile sürümünü kontrol edebilirsin.

## Klasör Yapısı

```
gym-management-system/
├── backend/          # Express API + SQLite
│   ├── server.js
│   ├── database.js
│   └── package.json
└── frontend/         # React + Vite + Tailwind
    ├── src/
    └── package.json
```

## Kurulum ve Çalıştırma

Node.js 18+ kurulu olmalı. İki ayrı terminal açman gerekiyor (biri backend, biri frontend için).

### 1) Backend'i başlat

```bash
cd backend
npm install
npm start
```

API `http://localhost:5000` adresinde çalışmaya başlar ve `gym.db` dosyasını otomatik oluşturur.
Konsolda `✅ Gym API çalışıyor` mesajını görmelisin.

### 2) Frontend'i başlat

Yeni bir terminalde:

```bash
cd frontend
npm install
npm run dev
```

Terminalde verilen adresi (genelde `http://localhost:5173`) tarayıcıda aç.

## Giriş Bilgileri

**Admin hesabı (sisteme gömülü, veritabanına ihtiyaç duymaz):**

- E-posta: `admin@gym.com`
- Şifre: `admin123`

**Üye hesapları:** Admin panelinden "Yeni Üye Ekle" ile oluşturulur. Üye, admin'in
girdiği e-posta/şifre ile giriş yapabilir.

## Özellikler

- **Admin Paneli:** Toplam üye, aktif üye, süresi dolan üye ve tahmini aylık gelir
  kartları; üye listesi tablosu; yeni üye ekleme modalı (paket seçimine göre bitiş
  tarihi otomatik hesaplanır); **üye düzenleme modalı** (paket, bitiş tarihi/kalan gün,
  boy, kilo güncellenebilir — durum her zaman kalan güne göre otomatik hesaplanır).
- **Üye Paneli:** Üyeliğin bitmesine kalan gün için ilerleme çubuğu; boy/kilo
  verisinden otomatik hesaplanan BMI (bu veriler sadece admin tarafından değiştirilebilir);
  kiloya göre günlük kalori (kilo × 30) ve protein (kilo × 1.6) hedefleri;
  **günlük kalori günlüğü** ("+ Yemek Ekle" ile giriş, gece yarısı sıfırlanır);
  **su takibi** (hızlı ekleme butonları, günlük 2.5L hedef); **hedef kilo belirleme**
  (üyenin kendi girdiği hedef, gerçek kilodan bağımsız); **salona geliş takvimi**
  ("Bugün Geldim" butonu, aylık görünüm, günde bir kez işaretlenebilir).
- **Paketler:** 1 Aylık (₺900), 6 Aylık (₺4.800), Yıllık (₺8.400) — `backend/database.js`
  içindeki `PACKAGES` sabitinden değiştirilebilir.

## Veritabanı Tabloları

- `members` — üye bilgileri (ad, soyad, e-posta, şifre hash'i, paket, boy, kilo,
  hedef kilo, başlangıç/bitiş tarihi)
- `calorie_logs` — günlük kalori girişleri (üye id, tarih, kcal, not)
- `water_logs` — günlük su girişleri (üye id, tarih, ml)
- `checkins` — salona geliş kayıtları (üye id, tarih — bir üye bir günde yalnızca
  bir kez işaretlenebilir)

## Notlar

- Şifreler backend'de `bcryptjs` ile hashlenerek saklanır.
- Frontend, backend'in `http://localhost:5000` üzerinde çalıştığını varsayar
  (`frontend/src/api.js` içindeki `API_BASE`).
- Bu bir staj/demo projesi olduğu için oturum yönetimi basit tutulmuştur (JWT yerine
  giriş sonrası kullanıcı bilgisi tarayıcıda saklanır).
