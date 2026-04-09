// src/pages/StaffDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { FONT_IMPORT, GLOBAL_STYLES, tierBadgeClass } from '../lib/styles';

export default function StaffDashboard() {
  const { user, role, practice, signOut } = useAuth();
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({ total: 0, pointsIssued: 0, gold: 0, silver: 0 });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [awardPts, setAwardPts] = useState('');
  const [awardReason, setAwardReason] = useState('');
  const [awarding, setAwarding] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [addingPatient, setAddingPatient] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const loadPatients = useCallback(async () => {
    let query = supabase.from('patients').select('*, practices(name, slug)').order('points', { ascending: false });
    // Staff see only their practice; superadmin sees all
    if (role === 'staff' && practice) {
      query = query.eq('practice_id', practice.id);
    }
    const { data } = await query;
    const all = data || [];
    setPatients(all);
    setStats({
      total: all.length,
      pointsIssued: all.reduce((s, p) => s + (p.points || 0), 0),
      gold: all.filter(p => p.tier === 'Gold').length,
      silver: all.filter(p => p.tier === 'Silver').length,
    });
    setLoading(false);
  }, [role, practice]);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  const openPatient = async (p) => {
    setSelected(p);
    const { data } = await supabase.from('point_transactions').select('*')
      .eq('patient_id', p.id).order('created_at', { ascending: false }).limit(10);
    setHistory(data || []);
  };

  const handleAward = async () => {
    if (!awardPts || isNaN(Number(awardPts)) || Number(awardPts) <= 0) return;
    setAwarding(true);
    const pts = Number(awardPts);
    const newPoints = (selected.points || 0) + pts;
    await Promise.all([
      supabase.from('patients').update({ points: newPoints }).eq('id', selected.id),
      supabase.from('point_transactions').insert({
        patient_id: selected.id,
        practice_id: selected.practice_id,
        type: 'earn',
        amount: pts,
        reason: awardReason || 'Manual award by staff',
        created_by: user.email,
      }),
    ]);
    const updated = { ...selected, points: newPoints };
    setSelected(updated);
    setPatients(prev => prev.map(p => p.id === selected.id ? updated : p));
    setAwardPts(''); setAwardReason('');
    const { data } = await supabase.from('point_transactions').select('*')
      .eq('patient_id', selected.id).order('created_at', { ascending: false }).limit(10);
    setHistory(data || []);
    setAwarding(false);
    showToast(`${pts} pts added to ${selected.full_name?.split(' ')[0] || 'patient'}`);
  };

  const handleAddPatient = async () => {
    if (!newName || !newEmail) return;
    setAddingPatient(true);
    const practiceId = practice?.id || selected?.practice_id;
    const { data: authData, error } = await supabase.auth.admin?.createUser?.({
      email: newEmail,
      password: 'TempPass123!',
      user_metadata: { full_name: newName, practice_slug: practice?.slug },
    });
    if (error || !authData) {
      // Fallback: insert directly if admin API not available
      showToast(`To add patients, have them sign up at your loyalty URL.`);
    } else {
      showToast(`Patient ${newName} added successfully`);
      setTimeout(loadPatients, 1000);
    }
    setShowAddPatient(false);
    setNewName(''); setNewEmail(''); setNewPhone('');
    setAddingPatient(false);
  };

  const filtered = patients.filter(p =>
    (p.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <><style>{FONT_IMPORT}{GLOBAL_STYLES}</style><div className="loading-screen"><div className="loading-dot" /></div></>
  );

  return (
    <>
      <style>{FONT_IMPORT}{GLOBAL_STYLES}{PAGE_STYLES}</style>
      <div className="app-shell">
        <nav className="nav">
          <div className="nav-brand">
            <span className="nav-brand-dot" />
            {practice?.name || 'All Practices'}
            {role === 'superadmin' && <span className="role-pill admin">Super Admin</span>}
            {role === 'staff' && <span className="role-pill">Staff</span>}
          </div>
          <div className="nav-right">
            <span className="nav-user">{user.email}</span>
            <button className="btn-signout" onClick={signOut}>Sign out</button>
          </div>
        </nav>

        <div className="page">
          <div className="grid-4 mb-32">
            {[
              { n: stats.total.toLocaleString(), label: 'Total Members' },
              { n: stats.pointsIssued.toLocaleString(), label: 'Points Issued' },
              { n: stats.gold, label: 'Gold Members' },
              { n: stats.silver, label: 'Silver Members' },
            ].map((s, i) => (
              <div className="card" key={i}>
                <div className="stat-number">{s.n}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="toolbar mb-24">
            <input className="input" style={{ flex: 1, borderRadius: 100 }}
              placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
            <button className="btn-sm" onClick={() => setShowAddPatient(true)}>+ Add Patient</button>
          </div>

          <div className="table-wrap">
            <div className="table-head" style={{ gridTemplateColumns: role === 'superadmin' ? '2fr 1fr 1fr 1fr 1fr' : '2fr 1fr 1fr 1fr' }}>
              <div className="table-head-cell">Patient</div>
              {role === 'superadmin' && <div className="table-head-cell">Practice</div>}
              <div className="table-head-cell">Points</div>
              <div className="table-head-cell">Tier</div>
              <div className="table-head-cell">Visits</div>
            </div>
            {filtered.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: 14 }}>No patients found.</div>
            )}
            {filtered.map(p => (
              <div className="table-row" key={p.id}
                style={{ gridTemplateColumns: role === 'superadmin' ? '2fr 1fr 1fr 1fr 1fr' : '2fr 1fr 1fr 1fr' }}
                onClick={() => openPatient(p)}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{p.full_name || '—'}</div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{p.email}</div>
                </div>
                {role === 'superadmin' && (
                  <div className="table-cell" style={{ fontSize: 12 }}>{p.practices?.name || '—'}</div>
                )}
                <div className="table-cell">{(p.points || 0).toLocaleString()}</div>
                <div className="table-cell"><span className={tierBadgeClass(p.tier)}>{p.tier}</span></div>
                <div className="table-cell">{p.total_visits || 0}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{selected.full_name || selected.email}</div>
            <div className="modal-sub">{selected.email}{selected.practices?.name ? ` · ${selected.practices.name}` : ''}</div>
            <div className="modal-row"><span className="modal-row-label">Points</span><strong>{(selected.points || 0).toLocaleString()}</strong></div>
            <div className="modal-row"><span className="modal-row-label">Tier</span><span className={tierBadgeClass(selected.tier)}>{selected.tier}</span></div>
            <div className="modal-row"><span className="modal-row-label">Total Visits</span><span>{selected.total_visits || 0}</span></div>
            <div className="modal-row"><span className="modal-row-label">Member Since</span><span>{new Date(selected.joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span></div>

            <div style={{ marginTop: 24 }}>
              <div className="section-title" style={{ marginBottom: 10 }}>Award Points</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input className="input" type="number" min="1" placeholder="Points" value={awardPts}
                  onChange={e => setAwardPts(e.target.value)} style={{ width: '30%' }} />
                <input className="input" placeholder="Reason (e.g. Botox treatment)" value={awardReason}
                  onChange={e => setAwardReason(e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>

            {history.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div className="section-title" style={{ marginBottom: 8 }}>Recent Activity</div>
                <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                  {history.map(h => (
                    <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f2f2ef', fontSize: 13 }}>
                      <span style={{ color: '#666' }}>{h.reason}</span>
                      <span style={{ fontWeight: 500, color: h.type === 'earn' ? '#4caf7d' : '#c8a97e' }}>
                        {h.amount > 0 ? `+${h.amount}` : h.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
              <button className="btn-primary" onClick={handleAward} disabled={awarding || !awardPts}>
                {awarding ? 'Awarding…' : 'Award Points'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddPatient && (
        <div className="modal-overlay" onClick={() => setShowAddPatient(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add New Patient</div>
            <div className="modal-sub">Share your loyalty URL so patients can sign up themselves, or add them manually here.</div>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input className="input" placeholder="Jane Smith" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input className="input" type="email" placeholder="jane@email.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Phone (optional)</label>
              <input className="input" type="tel" placeholder="(555) 000-0000" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAddPatient(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddPatient} disabled={addingPatient || !newName || !newEmail}>
                {addingPatient ? 'Adding…' : 'Add Patient'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

const PAGE_STYLES = `
  .role-pill { background: #f2f2ef; color: #888; font-family: 'DM Sans', sans-serif; font-size: 11px; padding: 3px 10px; border-radius: 100px; letter-spacing: 0.06em; text-transform: uppercase; }
  .role-pill.admin { background: #1a1a1a; color: #fff; }
  .stat-number { font-family: 'DM Serif Display', serif; font-size: 36px; color: #1a1a1a; }
  .stat-label { font-size: 12px; color: #888; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.06em; }
  .toolbar { display: flex; gap: 12px; align-items: center; }
`;
