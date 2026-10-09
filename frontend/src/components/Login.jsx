import React, { useState } from 'react';
import { Dumbbell, Lock, Mail, ArrowRight, Zap } from 'lucide-react';
import { api } from '../api.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email.trim(), password);
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_0.9fr]">
      {/* Sol taraf: marka alani */}
      <div className="relative hidden lg:flex flex-col justify-between p-14 border-r border-gray-800 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#9AFF3D 1px, transparent 1px), linear-gradient(90deg, #9AFF3D 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative flex items-center gap-2 text-gray-400 font-mono text-sm">
          <Dumbbell size={18} className="text-neon" strokeWidth={2.5} />
          PROTOKOL SİSTEMİ
        </div>

        <div className="relative">
          <h1 className="font-display text-7xl leading-[0.95] font-semibold text-white">
            Disiplin
            <br />
            <span className="text-neon">ölçülebilir.</span>
          </h1>
          <p className="mt-6 max-w-md text-gray-400 text-lg leading-relaxed">
            Üyelik takibi, gelişim verisi ve salon yönetimi tek panelde.
            Girmeden önce kim olduğunu söyle.
          </p>
        </div>

        <div className="relative flex gap-8 text-gray-500 text-sm font-mono">
          <div>
            <div className="text-neon text-2xl font-display font-semibold">7/24</div>
            erişim
          </div>
          <div>
            <div className="text-neon text-2xl font-display font-semibold">SQLite</div>
            veri katmanı
          </div>
          <div>
            <div className="text-neon text-2xl font-display font-semibold">Full-Stack</div>
            mimari
          </div>
        </div>
      </div>

      {/* Sağ taraf: giriş formu */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-gray-950">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 text-gray-400 font-mono text-sm mb-10">
            <Dumbbell size={18} className="text-neon" strokeWidth={2.5} />
            PROTOKOL SİSTEMİ
          </div>

          <h2 className="font-display text-3xl font-semibold text-white mb-1">Giriş yap</h2>
          <p className="text-gray-500 text-sm mb-8">
            Yönetici veya üye hesabınla devam et.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1.5">E-posta</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@gym.com"
                  className="w-full bg-gray-900 border border-gray-800 rounded-sm py-2.5 pl-10 pr-3 text-sm text-gray-100 placeholder-gray-600 focus:border-neon focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1.5">Şifre</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-900 border border-gray-800 rounded-sm py-2.5 pl-10 pr-3 text-sm text-gray-100 placeholder-gray-600 focus:border-neon focus:outline-none transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-sm px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-neon hover:bg-neon-glow text-gray-950 font-semibold text-sm rounded-sm py-2.5 mt-2 transition-colors disabled:opacity-60 shadow-neon-sm"
            >
              {loading ? 'Kontrol ediliyor…' : 'Giriş yap'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-8 flex items-start gap-2.5 text-xs text-gray-500 bg-gray-900/60 border border-gray-800 rounded-sm px-3.5 py-3">
            <Zap size={14} className="text-neon mt-0.5 shrink-0" />
            <div>
              Demo admin girişi: <span className="text-gray-300 font-mono">admin@gym.com</span> /{' '}
              <span className="text-gray-300 font-mono">admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
