// src/pages/Login.js
import { useState } from 'react';
import { supabase, PRACTICE_SLUG } from '../lib/supabase';
import { FONT_IMPORT, GLOBAL_STYLES } from '../lib/styles';

export default function Login({ practiceName }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, practice_slug: PRACTICE_SLUG } },
    });
    if (error) { setError(error.message); } 
    else { setSuccess('Account created! You can now sign in.'); setMode('login'); }
    setLoading(false);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) { setError(error.message); }
    else { setSuccess('Password reset email sent. Check your inbox.'); }
    setLoading(false);
  };

  const reset = () => { setError(''); setSuccess(''); };

  return (
    <>
      <style>{FONT_IMPORT}{GLOBAL_STYLES}{PAGE_STYLES}</style>
      <div className="login-bg">
        <div className="login-card">
          <div className="login-brand">
            <span className="nav-brand-dot" />
            {practiceName || 'Loyalty Rewards'}
          </div>

          {success && <div className="success-msg">{success}</div>}
          {error && <div className="error-msg">{error}</div>}

          {mode === 'login' && (
            <>
              <h2 className="login-heading">Welcome back</h2>
              <p className="text-muted mt-8 mb-24">Sign in to your account.</p>
              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input className="input" type="email" placeholder="you@email.com"
                    value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                </div>
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <input className="input" type="password" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
              <hr className="divider" />
              <div className="text-center">
                <button className="link-btn" onClick={() => { setMode('forgot'); reset(); }}>Forgot password?</button>
                <span style={{ color: '#ddd', margin: '0 10px' }}>|</span>
                <button className="link-btn" onClick={() => { setMode('signup'); reset(); }}>Create account</button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <>
              <h2 className="login-heading">Join rewards</h2>
              <p className="text-muted mt-8 mb-24">Create your account to start earning points.</p>
              <form onSubmit={handleSignup}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input className="input" type="text" placeholder="Jane Smith"
                    value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input className="input" type="email" placeholder="you@email.com"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <input className="input" type="password" placeholder="Min. 6 characters"
                    value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
              <hr className="divider" />
              <p className="text-center text-muted">
                Already have an account?{' '}
                <button className="link-btn" onClick={() => { setMode('login'); reset(); }}>Sign in</button>
              </p>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <h2 className="login-heading">Reset password</h2>
              <p className="text-muted mt-8 mb-24">We'll send you a reset link.</p>
              <form onSubmit={handleForgot}>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input className="input" type="email" placeholder="you@email.com"
                    value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
              <hr className="divider" />
              <p className="text-center text-muted">
                <button className="link-btn" onClick={() => { setMode('login'); reset(); }}>Back to sign in</button>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const PAGE_STYLES = `
  .login-bg { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8f8f6; padding: 24px; }
  .login-card { background: #fff; border: 1px solid #e8e8e4; border-radius: 24px; padding: 48px 40px; width: 100%; max-width: 420px; }
  .login-brand { font-family: 'DM Serif Display', serif; font-size: 20px; letter-spacing: 0.02em; color: #1a1a1a; display: flex; align-items: center; gap: 8px; margin-bottom: 32px; }
  .login-heading { font-family: 'DM Serif Display', serif; font-size: 26px; color: #1a1a1a; font-weight: 400; }
  .link-btn { background: none; border: none; color: #c8a97e; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: underline; padding: 0; }
`;
