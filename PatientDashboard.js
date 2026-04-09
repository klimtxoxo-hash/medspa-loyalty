// src/pages/PatientDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { FONT_IMPORT, GLOBAL_STYLES, tierBadgeClass, EARN_RATES, REWARDS_CATALOG, TIER_THRESHOLDS } from '../lib/styles';

export default function PatientDashboard() {
  const { user, practice, signOut } = useAuth();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const loadData = useCallback(async () => {
    const [{ data: p }, { data: tx }] = await Promise.all([
      supabase.from('patients').select('*').eq('id', user.id).single(),
      supabase.from('point_transactions').select('*').eq('patient_id', user.id)
        .order('created_at', { ascending: false }).limit(20),
    ]);
    setPatient(p);
    setHistory(tx || []);
    setLoading(false);
  }, [user.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRedeem = async (reward) => {
    if (!patient || patient.points < reward.pts) return;
    setRedeeming(reward.title);
    const newPoints = patient.points - reward.pts;
    await supabase.from('patients').update({ points: newPoints }).eq('id', user.id);
    await supabase.from('point_transactions').insert({
      patient_id: user.id,
      practice_id: patient.practice_id,
      type: 'redeem',
      amount: -reward.pts,
      reason: `Redeemed: ${reward.title}`,
      created_by: 'patient',
    });
    await loadData();
    setRedeeming(null);
    showToast(`"${reward.title}" redeemed! Show this to your provider.`);
  };

  const tierProgress = () => {
    if (!patient) return { pct: 0, next: 1000, nextName: 'Silver' };
    const pts = patient.points || 0;
    if (pts >= TIER_THRESHOLDS.Gold) return { pct: 100, next: TIER_THRESHOLDS.Gold, nextName: null };
    if (pts >= TIER_THRESHOLDS.Silver) {
      return { pct: ((pts - TIER_THRESHOLDS.Silver) / (TIER_THRESHOLDS.Gold - TIER_THRESHOLDS.Silver)) * 100, next: TIER_THRESHOLDS.Gold, nextName: 'Gold' };
    }
    return { pct: (pts / TIER_THRESHOLDS.Silver) * 100, next: TIER_THRESHOLDS.Silver, nextName: 'Silver' };
  };

  const { pct, next, nextName } = tierProgress();

  if (loading) return (
    <><style>{FONT_IMPORT}{GLOBAL_STYLES}</style><div className="loading-screen"><div className="loading-dot" /></div></>
  );

  return (
    <>
      <style>{FONT_IMPORT}{GLOBAL_STYLES}{PAGE_STYLES}</style>
      <div className="app-shell">
        <nav className="nav">
          <div className="nav-brand"><span className="nav-brand-dot" />{practice?.name || 'Loyalty Rewards'}</div>
          <div className="nav-right">
            <span className="nav-user">{patient?.full_name || user.email}</span>
            <button className="btn-signout" onClick={signOut}>Sign out</button>
          </div>
        </nav>

        <div className="page">
          <div className="grid-2 mb-32">
            <div className="card-dark">
              <div className="section-title" style={{ color: 'rgba(255,255,255,0.4)' }}>Points Balance</div>
              <div className="points-big">{(patient?.points || 0).toLocaleString()}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{patient?.full_name || user.email}</div>
              {nextName && patient && (
                <div style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ color: '#c8a97e' }}>{(next - (patient.points || 0)).toLocaleString()} pts</span> to {nextName}
                </div>
              )}
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="section-title">Current Tier</div>
                <div className="tier-name">{patient?.tier || 'Pearl'} Member</div>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
                  {patient?.tier === 'Gold' ? "You've reached our highest tier. Thank you!" : `Unlock ${nextName} at ${next?.toLocaleString()} pts`}
                </div>
              </div>
              <div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, pct)}%` }} /></div>
                <div className="progress-labels"><span>{(patient?.points || 0).toLocaleString()} pts</span><span>{next?.toLocaleString()} pts</span></div>
              </div>
            </div>
          </div>

          <div className="section-title">How to Earn Points</div>
          <div className="grid-4 mb-32">
            {EARN_RATES.map((e, i) => (
              <div className="earn-card" key={i}>
                <div className="earn-icon">{e.icon}</div>
                <div className="earn-pts">{e.pts}</div>
                <div className="earn-label">{e.label}</div>
              </div>
            ))}
          </div>

          <div className="section-title">Redeem Rewards</div>
          <div className="grid-3 mb-32">
            {REWARDS_CATALOG.map((r, i) => (
              <div className="card" key={i}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>{r.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20 }}>{r.pts} pts</div>
                  <button className="btn-sm" disabled={!patient || patient.points < r.pts || redeeming === r.title} onClick={() => handleRedeem(r)}>
                    {redeeming === r.title ? '…' : patient && patient.points >= r.pts ? 'Redeem' : 'Locked'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="section-title">Point History</div>
          <div className="history-list">
            {history.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: 14 }}>
                No transactions yet. Points will appear here after your first visit.
              </div>
            )}
            {history.map(h => (
              <div className="history-item" key={h.id}>
                <div className={`history-dot ${h.type}`} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{h.reason}</div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                    {new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div className={`history-pts-val ${h.type}`}>{h.amount > 0 ? `+${h.amount}` : h.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

const PAGE_STYLES = `
  .points-big { font-family: 'DM Serif Display', serif; font-size: 64px; line-height: 1; color: #fff; position: relative; z-index: 1; }
  .tier-name { font-family: 'DM Serif Display', serif; font-size: 28px; margin-bottom: 4px; }
  .progress-track { background: #f2f2ef; border-radius: 100px; height: 6px; width: 100%; margin-bottom: 8px; }
  .progress-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, #c8a97e, #e0c99a); transition: width 0.8s ease; }
  .progress-labels { display: flex; justify-content: space-between; font-size: 11px; color: #aaa; }
  .earn-card { background: #fff; border: 1px solid #e8e8e4; border-radius: 16px; padding: 20px; text-align: center; transition: all 0.2s; }
  .earn-card:hover { border-color: #c8a97e; transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
  .earn-icon { font-size: 22px; margin-bottom: 10px; }
  .earn-pts { font-family: 'DM Serif Display', serif; font-size: 18px; color: #1a1a1a; }
  .earn-label { font-size: 11px; color: #888; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.06em; }
  .history-list { background: #fff; border: 1px solid #e8e8e4; border-radius: 16px; overflow: hidden; }
  .history-item { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #f2f2ef; }
  .history-item:last-child { border-bottom: none; }
  .history-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .history-dot.earn { background: #4caf7d; }
  .history-dot.redeem { background: #c8a97e; }
  .history-pts-val { font-size: 15px; font-weight: 500; }
  .history-pts-val.earn { color: #4caf7d; }
  .history-pts-val.redeem { color: #c8a97e; }
`;
