import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/client';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const token          = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [tokenError, setTokenError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setTokenError('No reset token provided. Please use the link sent to your email.');
      return;
    }

    authAPI.verifyResetToken(token)
      .then((res) => {
        setTokenValid(true);
        setUserEmail(res.data?.email || '');
      })
      .catch((err) => {
        setTokenValid(false);
        setTokenError(err.response?.data?.error || 'This password reset link is invalid or has expired.');
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({
        token,
        password,
        confirm_password: confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <span style={s.logo}>PrimeMarket</span>
          <h1 style={s.title}>Set New Password</h1>
          <p style={s.sub}>
            {userEmail ? `Resetting password for ${userEmail}` : 'Enter your new account password'}
          </p>
        </div>

        {verifying ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: '#888' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <p style={{ margin: 0 }}>Verifying your reset link...</p>
          </div>
        ) : !tokenValid ? (
          <div style={{ textAlign: 'center' }}>
            <div style={s.errorBox}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
              <h3 style={{ color: '#ff4d4d', margin: '0 0 8px', fontSize: 17, fontWeight: 700 }}>Invalid Link</h3>
              <p style={{ color: '#bbb', fontSize: 14, margin: '0 0 16px', lineHeight: 1.5 }}>
                {tokenError}
              </p>
              <Link to="/forgot-password" style={s.btnLink}>
                Request New Reset Link
              </Link>
            </div>
            <p style={s.footer}>
              <Link to="/login" style={s.link}>Back to Sign In</Link>
            </p>
          </div>
        ) : success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={s.successBox}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
              <h3 style={{ color: '#4caf50', margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>Password Reset!</h3>
              <p style={{ color: '#ccc', fontSize: 14, margin: '0 0 16px', lineHeight: 1.6 }}>
                Your password has been changed successfully. You will be redirected to the sign in page shortly.
              </p>
              <Link to="/login" style={s.btnLink}>
                Sign In Now
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={s.label}>New Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#7c5cfc', fontSize: 12, cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                style={s.input}
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoFocus
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Confirm New Password</label>
              <input
                style={s.input}
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <div style={s.alertErr}>{error}</div>}

            <button style={s.btn} type="submit" disabled={loading}>
              {loading ? 'Updating password...' : 'Update Password'}
            </button>

            <p style={s.footer}>
              <Link to="/login" style={s.link}>Back to Sign In</Link>
            </p>
          </form>
        )}
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
  errorBox: { background: 'rgba(255,77,77,0.06)', border: '1px solid rgba(255,77,77,0.25)', borderRadius: 16, padding: '24px 20px', textAlign: 'center', marginBottom: 20 },
  successBox: { background: 'rgba(76,175,80,0.06)', border: '1px solid rgba(76,175,80,0.25)', borderRadius: 16, padding: '24px 20px', textAlign: 'center' },
  btn: { background: '#7c5cfc', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', width: '100%' },
  btnLink: { display: 'inline-block', background: '#7c5cfc', color: '#fff', textDecoration: 'none', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, marginTop: 8 },
  footer: { textAlign: 'center', color: '#555', fontSize: 14, marginTop: 20 },
  link: { color: '#7c5cfc', textDecoration: 'none', fontWeight: 600 },
};
