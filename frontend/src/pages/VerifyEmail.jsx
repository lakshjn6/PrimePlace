import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function VerifyEmail() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const { loadUser }    = useAuth();
  const { fetchCart }   = useCart();
  const [status, setStatus]   = useState('verifying');
  const [message, setMessage] = useState('');

  // useEffect(() => {
  //   const token = searchParams.get('token');
  //   if (!token) { setStatus('error'); setMessage('No token found in the link.'); return; }

  //   authAPI.verifyEmail(token)
  //     .then(({ data }) => {
  //       localStorage.setItem('access_token',  data.tokens.access);
  //       localStorage.setItem('refresh_token', data.tokens.refresh);
  //       setStatus('success');
  //       setMessage(data.message);
  //       loadUser();
  //       fetchCart();
  //       setTimeout(() => navigate('/products'), 3000);
  //     })
  //     .catch((err) => {
  //       setStatus('error');
  //       setMessage(err.response?.data?.error || 'Verification failed. The link may have expired.');
  //     });
  // }, []); // eslint-disable-line
const hasRun = React.useRef(false);

useEffect(() => {
    if (hasRun.current) return;  // ← double call rokta hai
    hasRun.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No token found in the link.');
      return;
    }

    authAPI.verifyEmail(token)
      .then(({ data }) => {
        localStorage.setItem('access_token',  data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        setStatus('success');
        setMessage(data.message);
        loadUser();
        fetchCart();
        setTimeout(() => navigate('/products'), 3000);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed.');
      });
}, []); // eslint-disable-line

  return (
    <div style={s.page}>
      <div style={s.card}>
        {status === 'verifying' && (
          <>
            <div style={s.spinner} />
            <h2 style={s.title}>Verifying your email...</h2>
            <p style={s.sub}>Please wait a moment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={s.successIcon}>✓</div>
            <h2 style={s.title}>Email Verified!</h2>
            <p style={s.sub}>{message}</p>
            <p style={s.redirect}>Redirecting in 3 seconds...</p>
            <Link to="/products" style={s.btn}>Go to Plans →</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={s.errorIcon}>✕</div>
            <h2 style={s.title}>Verification Failed</h2>
            <p style={s.sub}>{message}</p>
            <Link to="/register" style={s.btn}>Register Again</Link>
            <p style={s.footer}>
              Already have an account? <Link to="/login" style={s.link}>Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page:        { minHeight:'100vh', background:'#060608', display:'flex', alignItems:'center', justifyContent:'center', padding:24 },
  card:        { width:'100%', maxWidth:440, background:'#0e0e12', border:'1px solid #1e1e2e', borderRadius:24, padding:48, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:16 },
  spinner:     { width:56, height:56, border:'3px solid #1e1e2e', borderTop:'3px solid #7c5cfc', borderRadius:'50%', animation:'spin 0.8s linear infinite' },
  successIcon: { width:72, height:72, background:'rgba(76,175,80,0.1)', border:'2px solid #4caf50', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, color:'#4caf50' },
  errorIcon:   { width:72, height:72, background:'rgba(255,77,77,0.1)', border:'2px solid #ff4d4d', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, color:'#ff4d4d' },
  title:       { color:'#fff', fontSize:24, fontWeight:800, margin:0, fontFamily:'Georgia,serif' },
  sub:         { color:'#888', fontSize:15, margin:0, lineHeight:1.6 },
  redirect:    { color:'#555', fontSize:13, margin:0 },
  btn:         { background:'#7c5cfc', color:'#fff', textDecoration:'none', padding:'13px 32px', borderRadius:10, fontWeight:700, fontSize:15, marginTop:8 },
  footer:      { color:'#555', fontSize:14, marginTop:8 },
  link:        { color:'#7c5cfc', textDecoration:'none', fontWeight:600 },
};