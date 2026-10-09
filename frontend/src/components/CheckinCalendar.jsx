import React from 'react';
import { ChevronLeft, ChevronRight, Check, CalendarCheck } from 'lucide-react';

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];
const WEEKDAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function CheckinCalendar({
  year,
  monthIndex, // 0-11
  checkedDates, // Set<'YYYY-MM-DD'>
  todayDateStr,
  count,
  canCheckinToday,
  onPrevMonth,
  onNextMonth,
  onCheckin,
  checkinLoading,
}) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7; // Pazartesi = 0

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
          <CalendarCheck size={16} className="text-neon" />
          Salona Geliş Takvimi
        </div>
        <span className="text-xs text-gray-500 font-mono">Bu ay {count} gün</span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onPrevMonth}
          className="text-gray-500 hover:text-neon transition-colors p-1"
          aria-label="Önceki ay"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-display text-sm font-semibold text-white">
          {MONTH_NAMES[monthIndex]} {year}
        </span>
        <button
          onClick={onNextMonth}
          className="text-gray-500 hover:text-neon transition-colors p-1"
          aria-label="Sonraki ay"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="text-center text-[10px] text-gray-600 font-mono py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;
          const dateStr = `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
          const isChecked = checkedDates.has(dateStr);
          const isToday = dateStr === todayDateStr;
          return (
            <div
              key={dateStr}
              className={
                'aspect-square flex items-center justify-center rounded-sm text-xs font-medium relative ' +
                (isChecked
                  ? 'bg-neon text-gray-950'
                  : isToday
                  ? 'border border-neon/50 text-gray-200'
                  : 'text-gray-500')
              }
            >
              {isChecked ? <Check size={13} strokeWidth={3} /> : day}
            </div>
          );
        })}
      </div>

      <button
        onClick={onCheckin}
        disabled={!canCheckinToday || checkinLoading}
        className="w-full mt-5 flex items-center justify-center gap-2 bg-neon hover:bg-neon-glow text-gray-950 font-semibold text-sm rounded-sm py-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {checkinLoading ? 'Kaydediliyor…' : canCheckinToday ? 'Bugün Geldim' : 'Bugün İçin Kaydedildi ✓'}
      </button>
    </div>
  );
}
