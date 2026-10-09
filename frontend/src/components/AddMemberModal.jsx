import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../api.js';

const PACKAGE_OPTIONS = [
  { name: '1 Aylık', hint: '₺900' },
  { name: '6 Aylık', hint: '₺4.800' },
  { name: 'Yıllık', hint: '₺8.400' },
];

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  packageName: '1 Aylık',
  heightCm: '',
  weightKg: '',
};

export default function AddMemberModal({ onClose, onAdded }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.addMember({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        packageName: form.packageName,
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
      });
      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-sm shadow-neon max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h3 className="font-display font-semibold text-white text-lg">Yeni Üye Ekle</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ad">
              <input
                required
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Soyad">
              <input
                required
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <Field label="E-posta">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Şifre">
            <input
              type="password"
              required
              minLength={4}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Paket Seçimi">
            <div className="grid grid-cols-3 gap-2">
              {PACKAGE_OPTIONS.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => update('packageName', p.name)}
                  className={
                    'rounded-sm border px-2 py-2 text-center transition-colors ' +
                    (form.packageName === p.name
                      ? 'border-neon bg-neon/10 text-neon'
                      : 'border-gray-800 text-gray-400 hover:border-gray-700')
                  }
                >
                  <div className="text-xs font-semibold">{p.name}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{p.hint}</div>
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Boy (cm)">
              <input
                type="number"
                required
                min={100}
                max={250}
                value={form.heightCm}
                onChange={(e) => update('heightCm', e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Kilo (kg)">
              <input
                type="number"
                required
                min={30}
                max={300}
                value={form.weightKg}
                onChange={(e) => update('weightKg', e.target.value)}
                className="input"
              />
            </Field>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-sm px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-800 text-gray-300 rounded-sm py-2.5 text-sm hover:bg-gray-800/50 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-neon hover:bg-neon-glow text-gray-950 font-semibold rounded-sm py-2.5 text-sm transition-colors disabled:opacity-60"
            >
              {loading ? 'Kaydediliyor…' : 'Üyeyi Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-mono text-gray-500 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
