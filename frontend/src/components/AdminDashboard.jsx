import React, { useEffect, useState, useCallback } from 'react';
import { Dumbbell, Users, UserCheck, UserX, Wallet, LogOut, Plus, Trash2, Pencil } from 'lucide-react';
import { api } from '../api.js';
import AddMemberModal from './AddMemberModal.jsx';
import EditMemberModal from './EditMemberModal.jsx';

export default function AdminDashboard({ admin, onLogout }) {
  const [summary, setSummary] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [dashboard, memberList] = await Promise.all([api.getDashboard(), api.getMembers()]);
    setSummary(dashboard);
    setMembers(memberList);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!confirm('Bu üyeyi silmek istediğine emin misin?')) return;
    await api.deleteMember(id);
    load();
  }

  const cards = summary
    ? [
        { label: 'Toplam Üye', value: summary.totalMembers, icon: Users },
        { label: 'Aktif Üye', value: summary.activeMembers, icon: UserCheck },
        { label: 'Süresi Dolan', value: summary.expiredMembers, icon: UserX },
        {
          label: 'Tahmini Aylık Gelir',
          value: `₺${summary.monthlyRevenue.toLocaleString('tr-TR')}`,
          icon: Wallet,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 sticky top-0 bg-gray-950/90 backdrop-blur z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Dumbbell size={20} className="text-neon" strokeWidth={2.5} />
            <div>
              <div className="font-display font-semibold text-white leading-none">PROTOKOL</div>
              <div className="text-[11px] text-gray-500 font-mono mt-0.5">Yönetici Paneli</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:inline">{admin.email}</span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-neon transition-colors"
            >
              <LogOut size={15} />
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {(loading ? Array.from({ length: 4 }) : cards).map((card, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-sm p-5 hover:border-gray-700 transition-colors"
            >
              {card ? (
                <>
                  <card.icon size={18} className="text-gray-600 mb-4" />
                  <div className="font-display text-3xl font-semibold text-neon tracking-tight">
                    {card.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{card.label}</div>
                </>
              ) : (
                <div className="h-16 animate-pulse bg-gray-800/40 rounded-sm" />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-white">Üye Yönetimi</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 bg-neon hover:bg-neon-glow text-gray-950 font-semibold text-sm rounded-sm px-4 py-2 transition-colors shadow-neon-sm"
          >
            <Plus size={16} />
            Yeni Üye Ekle
          </button>
        </div>

        <div className="border border-gray-800 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-500 text-xs font-mono">
                  <th className="px-4 py-3 font-medium">Ad Soyad</th>
                  <th className="px-4 py-3 font-medium">E-posta</th>
                  <th className="px-4 py-3 font-medium">Paket</th>
                  <th className="px-4 py-3 font-medium">Kalan Gün</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {!loading && members.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-600">
                      Henüz kayıtlı üye yok. "Yeni Üye Ekle" ile başla.
                    </td>
                  </tr>
                )}
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-gray-800/70 last:border-0 hover:bg-gray-900/60 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-200 font-medium">
                      {m.firstName} {m.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{m.email}</td>
                    <td className="px-4 py-3 text-gray-400">{m.package}</td>
                    <td className="px-4 py-3 text-gray-300 font-mono">
                      {m.daysRemaining > 0 ? `${m.daysRemaining} gün` : 'Doldu'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          'inline-block px-2.5 py-1 rounded-sm text-xs font-medium ' +
                          (m.status === 'Aktif'
                            ? 'bg-neon/10 text-neon border border-neon/30'
                            : 'bg-gray-800 text-gray-500 border border-gray-700')
                        }
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setEditingMember(m)}
                          className="text-gray-600 hover:text-neon transition-colors"
                          title="Üyeyi düzenle"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors"
                          title="Üyeyi sil"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {modalOpen && (
        <AddMemberModal
          onClose={() => setModalOpen(false)}
          onAdded={() => {
            setModalOpen(false);
            load();
          }}
        />
      )}

      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSaved={() => {
            setEditingMember(null);
            load();
          }}
        />
      )}
    </div>
  );
}
