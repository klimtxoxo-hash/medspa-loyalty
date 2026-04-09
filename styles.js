// src/lib/styles.js
export const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Serif+Display:ital@0;1&display=swap');`;

export const GLOBAL_STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'DM Sans', sans-serif; background: #f8f8f6; color: #1a1a1a; -webkit-font-smoothing: antialiased; }
  .app-shell { min-height: 100vh; display: flex; flex-direction: column; }
  .page { flex: 1; max-width: 1100px; margin: 0 auto; padding: 40px 24px; width: 100%; }

  .nav { background: #fff; border-bottom: 1px solid #e8e8e4; padding: 0 32px; display: flex; align-items: center; justify-content: space-between; height: 64px; position: sticky; top: 0; z-index: 100; }
  .nav-brand { font-family: 'DM Serif Display', serif; font-size: 18px; letter-spacing: 0.02em; color: #1a1a1a; display: flex; align-items: center; gap: 8px; }
  .nav-brand-dot { width: 8px; height: 8px; border-radius: 50%; background: #c8a97e; display: inline-block; }
  .nav-right { display: flex; align-items: center; gap: 16px; }
  .nav-user { font-size: 13px; color: #888; }

  .section-title { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #aaa; margin-bottom: 16px; font-weight: 500; }
  .card { background: #fff; border: 1px solid #e8e8e4; border-radius: 16px; padding: 24px; }
  .card-dark { background: #1a1a1a; color: #fff; border-radius: 20px; padding: 36px; position: relative; overflow: hidden; }
  .card-dark::before { content: ''; position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; border-radius: 50%; background: rgba(200,169,126,0.15); }

  .btn-primary { background: #1a1a1a; color: #fff; border: none; border-radius: 100px; padding: 13px 28px; font-size: 14px; font-family: 'DM Sans', sans-serif; cursor: pointer; font-weight: 500; letter-spacing: 0.03em; transition: background 0.2s; width: 100%; }
  .btn-primary:hover { background: #333; }
  .btn-primary:disabled { background: #e8e8e4; color: #aaa; cursor: not-allowed; }
  .btn-secondary { background: #f2f2ef; color: #1a1a1a; border: none; border-radius: 100px; padding: 13px 28px; font-size: 14px; font-family: 'DM Sans', sans-serif; cursor: pointer; font-weight: 500; transition: background 0.2s; width: 100%; }
  .btn-secondary:hover { background: #e8e8e4; }
  .btn-sm { background: #1a1a1a; color: #fff; border: none; border-radius: 100px; padding: 8px 18px; font-size: 12px; font-family: 'DM Sans', sans-serif; cursor: pointer; font-weight: 500; transition: background 0.2s; }
  .btn-sm:hover { background: #333; }
  .btn-sm:disabled { background: #e8e8e4; color: #aaa; cursor: not-allowed; }
  .btn-signout { background: none; border: 1px solid #e8e8e4; border-radius: 100px; padding: 6px 14px; font-size: 12px; font-family: 'DM Sans', sans-serif; color: #888; cursor: pointer; transition: all 0.2s; }
  .btn-signout:hover { border-color: #1a1a1a; color: #1a1a1a; }

  .input-group { margin-bottom: 16px; }
  .input-label { font-size: 12px; color: #888; margin-bottom: 6px; display: block; letter-spacing: 0.04em; }
  .input { background: #f8f8f6; border: 1px solid #e8e8e4; border-radius: 12px; padding: 12px 16px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1a1a1a; outline: none; width: 100%; transition: border 0.2s; }
  .input:focus { border-color: #c8a97e; background: #fff; }
  .input::placeholder { color: #bbb; }

  .badge { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 500; letter-spacing: 0.04em; }
  .badge-gold { background: #fdf4e7; color: #c8a97e; }
  .badge-silver { background: #f2f2ef; color: #888; }
  .badge-pearl { background: #eef5fb; color: #6ea8c8; }
  .badge-admin { background: #1a1a1a; color: #fff; }

  .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: #1a1a1a; color: #fff; padding: 12px 24px; border-radius: 100px; font-size: 13px; z-index: 400; white-space: nowrap; animation: toastIn 0.3s ease; }
  @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; backdrop-filter: blur(4px); }
  .modal { background: #fff; border-radius: 24px; padding: 36px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
  .modal-title { font-family: 'DM Serif Display', serif; font-size: 24px; margin-bottom: 4px; }
  .modal-sub { font-size: 13px; color: #888; margin-bottom: 24px; }
  .modal-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f2f2ef; font-size: 14px; }
  .modal-row:last-of-type { border-bottom: none; }
  .modal-row-label { color: #888; }
  .modal-actions { display: flex; gap: 12px; margin-top: 24px; }

  .loading-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8f8f6; }
  .loading-dot { width: 8px; height: 8px; border-radius: 50%; background: #c8a97e; animation: pulse 1.2s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

  .table-wrap { background: #fff; border: 1px solid #e8e8e4; border-radius: 16px; overflow: hidden; }
  .table-head { display: grid; padding: 12px 20px; background: #f8f8f6; border-bottom: 1px solid #e8e8e4; }
  .table-head-cell { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #aaa; font-weight: 500; }
  .table-row { display: grid; padding: 16px 20px; border-bottom: 1px solid #f2f2ef; align-items: center; cursor: pointer; transition: background 0.15s; }
  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: #fafaf8; }
  .table-cell { font-size: 14px; color: #444; }

  .error-msg { font-size: 13px; color: #d04040; background: #fdf0f0; border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; }
  .success-msg { font-size: 13px; color: #2d7d4f; background: #f0fdf4; border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; }
  .divider { border: none; border-top: 1px solid #e8e8e4; margin: 20px 0; }
  .text-center { text-align: center; }
  .text-muted { color: #888; font-size: 13px; }
  .mt-8 { margin-top: 8px; } .mt-16 { margin-top: 16px; } .mt-24 { margin-top: 24px; }
  .mb-16 { margin-bottom: 16px; } .mb-24 { margin-bottom: 24px; } .mb-32 { margin-bottom: 32px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
`;

export const tierBadgeClass = (tier) => {
  if (tier === 'Gold') return 'badge badge-gold';
  if (tier === 'Silver') return 'badge badge-silver';
  return 'badge badge-pearl';
};

export const TIER_THRESHOLDS = { Pearl: 0, Silver: 1000, Gold: 2500 };

// ── CUSTOMIZE THESE PER CLIENT ──────────────────────────────────
// These are the default values. You can override per practice
// by storing them in the practices table in Supabase.

export const EARN_RATES = [
  { icon: '✦', label: 'Treatments & Services', pts: '2× per $1' },
  { icon: '◇', label: 'Retail Products', pts: '1× per $1' },
  { icon: '→', label: 'Refer a Friend', pts: '500 pts' },
  { icon: '○', label: 'Review or Share', pts: '150 pts' },
];

export const REWARDS_CATALOG = [
  { title: '$25 Treatment Credit', desc: 'Apply toward any service', pts: 500 },
  { title: '$50 Treatment Credit', desc: 'Apply toward any service', pts: 900 },
  { title: 'Complimentary Add-On', desc: 'LED, dermaplaning, or peel', pts: 750 },
  { title: 'Free Retail Product', desc: 'Up to $40 value', pts: 600 },
  { title: 'VIP Priority Booking', desc: 'First access to new appointments', pts: 300 },
];
