import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Login() {
  const { login }    = useAuth();
  const { fetchCart }= useCart();
  const navigate     = useNavigate();
  const location     = useLocation();
  const from         = location.state?.from?.pathname || '/products';

  const [form, setForm]       = useState({ email:'', password:'' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      await fetchCart();
      navigate(from, { replace: true });
    } catch (err) {
      const errs = err.response?.data;
      setError(errs?.non_field_errors?.[0] || errs?.detail || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <span style={s.logo}>PrimeMarket</span>
          <h1 style={s.title}>Welcome back</h1>
          <p style={s.sub}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email Address</label>
            <input
              style={s.input} type="email" name="email"
              placeholder="john@example.com"
              value={form.email} onChange={handleChange} required
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={s.input} type="password" name="password"
              placeholder="Your password"
              value={form.password} onChange={handleChange} required
            />
          </div>

          {error && <div style={s.alertErr}>{error}</div>}

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={s.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={s.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:'100vh', background:'#060608', display:'flex', alignItems:'center', justifyContent:'center', padding:24 },
  card: { width:'100%', maxWidth:420, background:'#0e0e12', border:'1px solid #1e1e2e', borderRadius:24, padding:40 },
  header: { textAlign:'center', marginBottom:32 },
  logo: { color:'#7c5cfc', fontWeight:800, fontSize:20, fontFamily:'Georgia,serif' },
  title: { color:'#fff', fontSize:28, fontWeight:800, margin:'12px 0 6px', fontFamily:'Georgia,serif' },
  sub: { color:'#555', fontSize:14 },
  form: { display:'flex', flexDirection:'column', gap:20 },
  field: { display:'flex', flexDirection:'column', gap:6 },
  label: { color:'#888', fontSize:12, fontWeight:600, letterSpacing:0.5 },
  input: { background:'#111', border:'1px solid #2a2a2a', borderRadius:10, padding:'13px 14px', color:'#fff', fontSize:15, outline:'none' },
  alertErr: { background:'rgba(255,77,77,0.1)', border:'1px solid rgba(255,77,77,0.3)', borderRadius:8, padding:'12px 16px', color:'#ff4d4d', fontSize:13 },
  btn: { background:'#7c5cfc', color:'#fff', border:'none', borderRadius:10, padding:'14px', fontSize:16, fontWeight:700, cursor:'pointer' },
  footer: { textAlign:'center', color:'#555', fontSize:14, marginTop:24 },
  link: { color:'#7c5cfc', textDecoration:'none', fontWeight:600 },
};
