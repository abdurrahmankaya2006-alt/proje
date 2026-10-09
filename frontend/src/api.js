const API_BASE = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    throw new Error(data?.error || 'Bir hata oluştu.');
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMembers: () => request('/members'),
  getDashboard: () => request('/dashboard'),
  addMember: (payload) =>
    request('/members', { method: 'POST', body: JSON.stringify(payload) }),
  updateMember: (id, payload) =>
    request(`/members/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteMember: (id) => request(`/members/${id}`, { method: 'DELETE' }),
  getPackages: () => request('/packages'),
  setTargetWeight: (id, targetWeightKg) =>
    request(`/members/${id}/target-weight`, {
      method: 'PATCH',
      body: JSON.stringify({ targetWeightKg }),
    }),
  addCalorieLog: (memberId, kcal, note) =>
    request('/calorie-logs', { method: 'POST', body: JSON.stringify({ memberId, kcal, note }) }),
  addWaterLog: (memberId, ml) =>
    request('/water-logs', { method: 'POST', body: JSON.stringify({ memberId, ml }) }),
  checkin: (memberId) =>
    request('/checkins', { method: 'POST', body: JSON.stringify({ memberId }) }),
  getCheckins: (memberId, month) =>
    request(`/checkins/${memberId}${month ? `?month=${month}` : ''}`),
};
