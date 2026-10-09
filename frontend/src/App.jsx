import React, { useEffect, useState } from 'react';
import Login from './components/Login.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import MemberPanel from './components/MemberPanel.jsx';

export default function App() {
  const [session, setSession] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('gym_session');
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch {
        localStorage.removeItem('gym_session');
      }
    }
    setLoaded(true);
  }, []);

  function handleLogin(sessionData) {
    localStorage.setItem('gym_session', JSON.stringify(sessionData));
    setSession(sessionData);
  }

  function handleLogout() {
    localStorage.removeItem('gym_session');
    setSession(null);
  }

  if (!loaded) return null;

  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  if (session.role === 'admin') {
    return <AdminDashboard admin={session.user} onLogout={handleLogout} />;
  }

  return <MemberPanel initialUser={session.user} onLogout={handleLogout} />;
}
