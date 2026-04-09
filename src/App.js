// src/App.js
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { supabase, PRACTICE_SLUG } from './lib/supabase';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import StaffDashboard from './pages/StaffDashboard';
import { FONT_IMPORT, GLOBAL_STYLES } from './lib/styles';

function Router() {
  const { user, role, loading } = useAuth();
  const [practiceName, setPracticeName] = useState('');

  useEffect(() => {
    supabase.from('practices').select('name').eq('slug', PRACTICE_SLUG).maybeSingle()
      .then(({ data }) => { if (data) setPracticeName(data.name); });
  }, []);

  if (loading) return (
    <><style>{FONT_IMPORT}{GLOBAL_STYLES}</style>
    <div className="loading-screen"><div className="loading-dot" /></div></>
  );

  if (!user) return <Login practiceName={practiceName} />;
  if (role === 'staff' || role === 'superadmin') return <StaffDashboard />;
  return <PatientDashboard />;
}

export default function App() {
  return <AuthProvider><Router /></AuthProvider>;
}
