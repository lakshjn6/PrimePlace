import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await authAPI.forgotPassword(email);
      setSent(true);
      setMessage(res.data?.message || 'Password reset link sent! Check your inbox.');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <span style={s.logo}>PrimeMarket</span>
          <h1 style={s.title}>Forgot Password</h1>
          <p style={s.sub}>
            {sent
              ? 'Check your email for the reset instructions'
              : 'Enter your account email and we will send you a password reset link.'}
          </p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={s.successBox}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
              <h3 style={{ color: '#4caf50', margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Email Sent!</h3>
              <p style={{ color: '#ccc', fontSize: 14, margin: '0 0 16px', lineHeight: 1.6 }}>
                We've sent a password reset link to <strong style={{ color: '#fff' }}>{email}</strong>.
                Click the link in the email to set a new password.
              </p>
              <p style={{ color: '#777', fontSize: 12, margin: 0 }}>
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>

            <button
              style={{ ...s.btn, marginTop: 20, background: '#1c1b2b', border: '1px solid #332d56' }}
              onClick={() => { setSent(false); setError(''); }}
            >
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>Email Address</label>
              <input
                style={s.input}
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && <div style={s.alertErr}>{error}</div>}
            {message && !sent && <div style={s.alertSuccess}>{message}</div>}

            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p style={s.footer}>
          Remember your password?{' '}
          <Link to="/login" style={s.link}>Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#060608', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 430, background: '#0e0e12', border: '1px solid #1e1e2e', borderRadius: 24, padding: 40, boxSizing: 'border-box' },
  header: { textAlign: 'center', marginBottom: 28 },
  logo: { color: '#7c5cfc', fontWeight: 800, fontSize: 20, fontFamily: 'Georgia,serif' },
  title: { color: '#fff', fontSize: 28, fontWeight: 800, margin: '12px 0 6px', fontFamily: 'Georgia,serif' },
  sub: { color: '#777', fontSize: 14, lineHeight: 1.5, margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { color: '#888', fontSize: 12, fontWeight: 600, letterSpacing: 0.5 },
  input: { background: '#111', border: '1px solid #2a2a2a', borderRadius: 10, padding: '13px 14px', color: '#fff', fontSize: 15, outline: 'none' },
  alertErr: { background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: 8, padding: '12px 16px', color: '#ff4d4d', fontSize: 13 },
  alertSuccess: { background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 8, padding: '12px 16px', color: '#4caf50', fontSize: 13 },
  successBox: { background: 'rgba(76,175,80,0.06)', border: '1px solid rgba(76,175,80,0.25)', borderRadius: 16, padding: '24px 20px', textAlign: 'center' },
  btn: { background: '#7c5cfc', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', width: '100%' },
  footer: { textAlign: 'center', color: '#555', fontSize: 14, marginTop: 24 },
  link: { color: '#7c5cfc', textDecoration: 'none', fontWeight: 600 },
};
