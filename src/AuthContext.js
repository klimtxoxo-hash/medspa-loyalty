// src/lib/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, PRACTICE_SLUG } from './supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'superadmin' | 'staff' | 'patient'
  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(true);

  const resolveSession = async (userId) => {
    // Check if staff or superadmin
    const { data: staffData } = await supabase
      .from('staff')
      .select('role, practice_id, practices(id, name, slug)')
      .eq('id', userId)
      .maybeSingle();

    if (staffData) {
      setRole(staffData.role);
      setPractice(staffData.practices || null);
      return;
    }

    // Otherwise patient — get their practice
    const { data: patientData } = await supabase
      .from('patients')
      .select('practice_id, practices(id, name, slug)')
      .eq('id', userId)
      .maybeSingle();

    setRole('patient');
    setPractice(patientData?.practices || null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        await resolveSession(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await resolveSession(session.user.id);
        } else {
          setUser(null);
          setRole(null);
          setPractice(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, role, practice, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
