import React, { useState } from 'react';
import { X, UtensilsCrossed } from 'lucide-react';

export default function AddCalorieModal({ onClose, onSubmit }) {
  const [kcal, setKcal] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const value = Number(kcal);
    if (!value || value <= 0) {
      setError('Geçerli bir kalori değeri gir.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(value, note.trim());
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-sm shadow-neon">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h3 className="font-display font-semibold text-white text-base flex items-center gap-2">
            <UtensilsCrossed size={16} className="text-neon" />
            Yemek Ekle
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <label className="block">
            <span className="block text-xs font-mono text-gray-500 mb-1.5">Kaç kcal aldın?</span>
            <input
              type="number"
              autoFocus
              required
              min={1}
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              placeholder="ör. 450"
              className="input"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-mono text-gray-500 mb-1.5">Not (opsiyonel)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ör. tavuklu salata"
              className="input"
            />
          </label>

          {error && (
            <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-sm px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-800 text-gray-300 rounded-sm py-2 text-sm hover:bg-gray-800/50 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-neon hover:bg-neon-glow text-gray-950 font-semibold rounded-sm py-2 text-sm transition-colors disabled:opacity-60"
            >
              {loading ? 'Ekleniyor…' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
