import React, { useEffect, useState, useCallback } from 'react';
import {
  Dumbbell,
  LogOut,
  Flame,
  Beef,
  Activity,
  CalendarClock,
  Droplet,
  Target,
  Plus,
} from 'lucide-react';
import { api } from '../api.js';
import AddCalorieModal from './AddCalorieModal.jsx';
import CheckinCalendar from './CheckinCalendar.jsx';

function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Zayıf', color: 'text-sky-400' };
  if (bmi < 25) return { label: 'Normal', color: 'text-neon' };
  if (bmi < 30) return { label: 'Fazla Kilolu', color: 'text-yellow-400' };
  return { label: 'Obez', color: 'text-red-400' };
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function localToday() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

const WATER_QUICK_ADD = [250, 500];

export default function MemberPanel({ initialUser, onLogout }) {
  const [user, setUser] = useState(initialUser);
  const [showCalorieModal, setShowCalorieModal] = useState(false);
  const [targetInput, setTargetInput] = useState(initialUser.targetWeightKg ?? '');
  const [savingTarget, setSavingTarget] = useState(false);
  const [waterLoading, setWaterLoading] = useState(false);

  const today = new Date();
  const [viewedYear, setViewedYear] = useState(today.getFullYear());
  const [viewedMonth, setViewedMonth] = useState(today.getMonth()); // 0-11
  const [checkinDates, setCheckinDates] = useState(new Set());
  const [checkinCount, setCheckinCount] = useState(0);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinError, setCheckinError] = useState('');

  const refreshUser = useCallback(async () => {
    const list = await api.getMembers();
    const fresh = list.find((m) => m.id === initialUser.id);
    if (fresh) setUser(fresh);
  }, [initialUser.id]);

  const loadCheckins = useCallback(
    async (year, monthIndex) => {
      const monthStr = `${year}-${pad(monthIndex + 1)}`;
      const res = await api.getCheckins(user.id, monthStr);
      setCheckinDates(new Set(res.dates));
      setCheckinCount(res.count);
    },
    [user.id]
  );

  useEffect(() => {
    refreshUser().catch(() => {});
  }, [refreshUser]);

  useEffect(() => {
    loadCheckins(viewedYear, viewedMonth).catch(() => {});
  }, [viewedYear, viewedMonth, loadCheckins]);

  const progressPct = Math.max(0, Math.min(100, (user.daysRemaining / user.totalDays) * 100));
  const bmiInfo = bmiCategory(user.bmi);

  const calorieTarget = user.dailyCalorieTarget;
  const calorieEaten = user.caloriesToday ?? 0;
  const calorieRemaining = user.caloriesRemaining ?? calorieTarget;
  const caloriePct = Math.max(0, Math.min(100, (calorieEaten / calorieTarget) * 100));

  const waterTarget = user.waterTargetMl ?? 2500;
  const waterDrank = user.waterTodayMl ?? 0;
  const waterPct = Math.max(0, Math.min(100, (waterDrank / waterTarget) * 100));

  const weightDiff =
    user.targetWeightKg != null ? Math.round((user.weightKg - user.targetWeightKg) * 10) / 10 : null;

  const todayStr = localToday();
  const isViewingCurrentMonth = viewedYear === today.getFullYear() && viewedMonth === today.getMonth();
  const canCheckinToday = isViewingCurrentMonth ? !checkinDates.has(todayStr) : true;

  async function handleAddCalorie(kcal, note) {
    const updated = await api.addCalorieLog(user.id, kcal, note);
    setUser(updated);
  }

  async function handleAddWater(ml) {
    setWaterLoading(true);
    try {
      const updated = await api.addWaterLog(user.id, ml);
      setUser(updated);
    } finally {
      setWaterLoading(false);
    }
  }

  async function handleSaveTarget(e) {
    e.preventDefault();
    const value = Number(targetInput);
    if (!value || value <= 0) return;
    setSavingTarget(true);
    try {
      const updated = await api.setTargetWeight(user.id, value);
      setUser(updated);
    } finally {
      setSavingTarget(false);
    }
  }

  async function handleClearTarget() {
    setSavingTarget(true);
    try {
      const updated = await api.setTargetWeight(user.id, null);
      setUser(updated);
      setTargetInput('');
    } finally {
      setSavingTarget(false);
    }
  }

  async function handleCheckin() {
    setCheckinError('');
    setCheckinLoading(true);
    try {
      await api.checkin(user.id);
      await loadCheckins(viewedYear, viewedMonth);
      if (!isViewingCurrentMonth) {
        setViewedYear(today.getFullYear());
        setViewedMonth(today.getMonth());
      }
    } catch (err) {
      setCheckinError(err.message);
    } finally {
      setCheckinLoading(false);
    }
  }

  function goPrevMonth() {
    setViewedMonth((m) => {
      if (m === 0) {
        setViewedYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function goNextMonth() {
    setViewedMonth((m) => {
      if (m === 11) {
        setViewedYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 sticky top-0 bg-gray-950/90 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Dumbbell size={20} className="text-neon" strokeWidth={2.5} />
            <div>
              <div className="font-display font-semibold text-white leading-none">PROTOKOL</div>
              <div className="text-[11px] text-gray-500 font-mono mt-0.5">Üye Paneli</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-neon transition-colors"
          >
            <LogOut size={15} />
            Çıkış
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl font-semibold text-white">Merhaba, {user.firstName}.</h1>
        <p className="text-gray-500 mt-1 mb-8">Kişisel profil ve gelişim özetin.</p>

        {/* Uyelik durumu */}
        <div className="bg-gray-900 border border-gray-800 rounded-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
              <CalendarClock size={16} className="text-neon" />
              Üyelik Durumu — {user.package}
            </div>
            <span
              className={
                'text-xs px-2.5 py-1 rounded-sm font-medium border ' +
                (user.status === 'Aktif'
                  ? 'bg-neon/10 text-neon border-neon/30'
                  : 'bg-gray-800 text-gray-500 border-gray-700')
              }
            >
              {user.status}
            </span>
          </div>

          <div className="flex items-end justify-between mb-2">
            <span className="font-display text-4xl font-semibold text-neon">
              {user.daysRemaining > 0 ? user.daysRemaining : 0}
              <span className="text-base text-gray-500 font-body ml-1.5">gün kaldı</span>
            </span>
            <span className="text-xs text-gray-600 font-mono">{user.endDate} bitiş</span>
          </div>

          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-neon-dim to-neon rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Fiziksel durum */}
        <div className="bg-gray-900 border border-gray-800 rounded-sm p-6 mb-6">
          <div className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-4">
            <Activity size={16} className="text-neon" />
            Fiziksel Durum
            <span className="text-[10px] text-gray-600 font-normal ml-1">(admin tarafından güncellenir)</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Boy</div>
              <div className="font-display text-xl font-semibold text-white">
                {user.heightCm} <span className="text-sm text-gray-500 font-body">cm</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Kilo</div>
              <div className="font-display text-xl font-semibold text-white">
                {user.weightKg} <span className="text-sm text-gray-500 font-body">kg</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Vücut Kitle İndeksi</div>
              <div className={`font-display text-xl font-semibold ${bmiInfo.color}`}>
                {user.bmi} <span className="text-sm text-gray-500 font-body">({bmiInfo.label})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hedef kilo */}
        <div className="bg-gray-900 border border-gray-800 rounded-sm p-6 mb-6">
          <div className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-4">
            <Target size={16} className="text-neon" />
            Hedef Kilom
          </div>
          <div className="flex items-end gap-4 flex-wrap">
            <form onSubmit={handleSaveTarget} className="flex items-end gap-2">
              <label className="block">
                <span className="block text-xs text-gray-500 mb-1.5">Hedef (kg)</span>
                <input
                  type="number"
                  min={1}
                  step="0.1"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="ör. 75"
                  className="input w-28"
                />
              </label>
              <button
                type="submit"
                disabled={savingTarget}
                className="bg-neon hover:bg-neon-glow text-gray-950 font-semibold text-sm rounded-sm px-4 py-2 transition-colors disabled:opacity-60"
              >
                Kaydet
              </button>
              {user.targetWeightKg != null && (
                <button
                  type="button"
                  onClick={handleClearTarget}
                  disabled={savingTarget}
                  className="text-gray-500 hover:text-gray-300 text-sm px-2 py-2 transition-colors"
                >
                  Temizle
                </button>
              )}
            </form>

            {weightDiff !== null && (
              <div className="text-sm text-gray-400">
                {weightDiff === 0 ? (
                  <span className="text-neon font-semibold">Hedefine ulaştın! 🎯</span>
                ) : weightDiff > 0 ? (
                  <>
                    Hedefe <span className="text-neon font-semibold">{weightDiff} kg</span> kaldı (vermen gereken)
                  </>
                ) : (
                  <>
                    Hedefini <span className="text-neon font-semibold">{Math.abs(weightDiff)} kg</span> geçtin
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Beslenme hedefi */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-4">
            <Flame size={16} className="text-neon" />
            Beslenme Hedefi
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <Flame size={18} className="text-gray-600" />
                <button
                  onClick={() => setShowCalorieModal(true)}
                  className="flex items-center gap-1 text-xs bg-neon/10 text-neon border border-neon/30 rounded-sm px-2.5 py-1.5 hover:bg-neon/20 transition-colors"
                >
                  <Plus size={13} />
                  Yemek Ekle
                </button>
              </div>
              <div className="font-display text-3xl font-semibold text-neon">
                {calorieRemaining > 0 ? calorieRemaining : 0}{' '}
                <span className="text-sm text-gray-500 font-body">kcal kaldı</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 mb-3">
                Hedef {calorieTarget} kcal · Alınan {calorieEaten} kcal
              </div>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={
                    'h-full rounded-full transition-all ' + (caloriePct > 100 ? 'bg-red-400' : 'bg-neon')
                  }
                  style={{ width: `${Math.min(100, caloriePct)}%` }}
                />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-sm p-6">
              <Beef size={18} className="text-gray-600 mb-4" />
              <div className="font-display text-3xl font-semibold text-neon">
                {user.dailyProteinTarget} <span className="text-sm text-gray-500 font-body">g</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Günlük Protein Hedefi</div>
            </div>
          </div>
        </div>

        {/* Su takibi */}
        <div className="bg-gray-900 border border-gray-800 rounded-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
              <Droplet size={16} className="text-neon" />
              Su Takibi
            </div>
            <div className="flex gap-2">
              {WATER_QUICK_ADD.map((ml) => (
                <button
                  key={ml}
                  onClick={() => handleAddWater(ml)}
                  disabled={waterLoading}
                  className="flex items-center gap-1 text-xs bg-neon/10 text-neon border border-neon/30 rounded-sm px-2.5 py-1.5 hover:bg-neon/20 transition-colors disabled:opacity-50"
                >
                  <Plus size={13} />
                  {ml >= 1000 ? `${ml / 1000}L` : `${ml}ml`}
                </button>
              ))}
            </div>
          </div>
          <div className="font-display text-3xl font-semibold text-neon">
            {(waterDrank / 1000).toFixed(2)}{' '}
            <span className="text-sm text-gray-500 font-body">/ {(waterTarget / 1000).toFixed(1)} L</span>
          </div>
          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-sky-400 rounded-full transition-all" style={{ width: `${waterPct}%` }} />
          </div>
        </div>

        {/* Salona gelis takvimi */}
        <div className="mb-6">
          {checkinError && (
            <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-sm px-3 py-2 mb-3">
              {checkinError}
            </div>
          )}
          <CheckinCalendar
            year={viewedYear}
            monthIndex={viewedMonth}
            checkedDates={checkinDates}
            todayDateStr={todayStr}
            count={checkinCount}
            canCheckinToday={canCheckinToday}
            onPrevMonth={goPrevMonth}
            onNextMonth={goNextMonth}
            onCheckin={handleCheckin}
            checkinLoading={checkinLoading}
          />
        </div>
      </main>

      {showCalorieModal && (
        <AddCalorieModal onClose={() => setShowCalorieModal(false)} onSubmit={handleAddCalorie} />
      )}
    </div>
  );
}
