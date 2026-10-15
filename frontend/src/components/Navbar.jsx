import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { user, logout }        = useAuth();
  const { cart }                = useCart();
  const navigate                = useNavigate();
  const location                = useLocation();
  const [menuOpen, setMenu]     = useState(false);
  const [mobileOpen, setMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Close menus on route change
  useEffect(() => { setMobile(false); setMenu(false); }, [location]);

  // Track screen width
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nb-search-desktop:focus-within .nb-search-input-wrap {
          border-color: #7c5cfc !important;
          box-shadow: 0 0 0 3px rgba(124,92,252,0.15);
        }
        .nb-viewall-row:hover { background: rgba(124,92,252,0.1) !important; }
      `}</style>

      <nav style={s.nav}>
        <div style={s.inner}>

          {/* Logo */}
          <Link to="/" style={s.logo}>
            <img
              src={require('../images/logo.png')}
              alt="PrimeMarket Logo"
              style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {/* ── Desktop center: nav links + search bar ── */}
          {!isMobile && (
            <div style={s.centerDesktop}>
              <Link to="/"         style={s.link}>Home</Link>
              <Link to="/products" style={s.link}>Plans</Link>
              {/* Inline search */}
              <div className="nb-search-desktop" style={s.searchDesktop}>
                <SearchBar />
              </div>
            </div>
          )}

          {/* Desktop right */}
          {!isMobile && (
            <div style={s.right}>
              {user ? (
                <>
                  <Link to="/cart" style={s.cartBtn}>
                    🛒
                    {cart.count > 0 && <span style={s.badge}>{cart.count}</span>}
                  </Link>
                  <Link to="/orders" style={s.link}>Orders</Link>
                  <div style={s.userMenu} onClick={() => setMenu(!menuOpen)}>
                    <div style={s.avatar}>{user.first_name[0]}</div>
                    {menuOpen && (
                      <div style={s.dropdown}>
                        <p style={s.dropName}>{user.first_name} {user.last_name}</p>
                        <p style={s.dropEmail}>{user.email}</p>
                        <hr style={{ margin:'8px 0', borderColor:'#333' }} />
                        <Link to="/profile" style={s.dropItem} onClick={() => setMenu(false)}>Profile</Link>
                        <button style={s.dropLogout} onClick={handleLogout}>Logout</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login"    style={s.link}>Login</Link>
                  <Link to="/register" style={s.cta}>Get Started</Link>
                </>
              )}
            </div>
          )}

          {/* Mobile right — cart + hamburger (no search icon, search is always below) */}
          {isMobile && (
            <div style={s.mobileRight}>
              {user && (
                <Link to="/cart" style={s.cartBtn}>
                  🛒
                  {cart.count > 0 && <span style={s.badge}>{cart.count}</span>}
                </Link>
              )}
              {/* Hamburger */}
              <button style={s.hamburger} onClick={() => setMobile(!mobileOpen)}>
                <span style={{ ...s.bar, ...(mobileOpen ? s.bar1Open : {}) }} />
                <span style={{ ...s.bar, ...(mobileOpen ? s.bar2Open : {}) }} />
                <span style={{ ...s.bar, ...(mobileOpen ? s.bar3Open : {}) }} />
              </button>
            </div>
          )}

        </div>

        {/* ── Mobile Search Row — always visible, like Amazon ── */}
        {isMobile && (
          <div style={s.mobileSearchRow}>
            <SearchBar />
          </div>
        )}

        {isMobile && mobileOpen && (
          <div style={s.mobileMenu}>

            <Link to="/" style={s.mobileLink}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </Link>

            <Link to="/products" style={s.mobileLink}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              Plans
            </Link>

            {user ? (
              <>
                <Link to="/orders" style={s.mobileLink}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  Orders
                </Link>
                <Link to="/profile" style={s.mobileLink}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Profile
                </Link>
                {user.is_admin && (
                  <Link to="/admin-dashboard" style={s.mobileLink}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                    Admin
                  </Link>
                )}
                <div style={s.mobileDivider} />
                <div style={s.mobileUser}>
                  <div style={s.mobileAvatar}>{user.first_name[0]}</div>
                  <div>
                    <div style={s.mobileUserName}>{user.first_name} {user.last_name}</div>
                    <div style={s.mobileUserEmail}>{user.email}</div>
                  </div>
                </div>
                <button style={s.mobileLogout} onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <div style={s.mobileDivider} />
                <Link to="/login" style={s.mobileLink}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  Login
                </Link>
                <Link to="/register" style={s.mobileCta}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Overlay — close menu when clicking outside */}
      {isMobile && mobileOpen && (
        <div style={s.overlay} onClick={() => setMobile(false)} />
      )}
    </>
  );
}

const s = {
  // ── Desktop nav ─────────────────────────────────────
  nav:       { background:'#0a0a0a', borderBottom:'1px solid #1e1e1e', position:'sticky', top:0, zIndex:100 },
  inner:     { maxWidth:1200, margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 },
  logo:      { display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0 },

  centerDesktop: { display:'flex', alignItems:'center', gap:28, flex:1, justifyContent:'center', minWidth:0 },
  searchDesktop: { flex:1, maxWidth:420, minWidth:0 },

  link:      { color:'#aaa', textDecoration:'none', fontSize:14, fontWeight:500, whiteSpace:'nowrap' },
  right:     { display:'flex', alignItems:'center', gap:20, flexShrink:0 },
  cartBtn:   { position:'relative', color:'#aaa', textDecoration:'none', fontSize:20, flexShrink:0 },
  badge:     { position:'absolute', top:-8, right:-8, background:'#7c5cfc', color:'#fff', fontSize:10, fontWeight:700, width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' },
  cta:       { background:'#7c5cfc', color:'#fff', textDecoration:'none', padding:'8px 18px', borderRadius:8, fontSize:14, fontWeight:600, whiteSpace:'nowrap' },
  userMenu:  { position:'relative', cursor:'pointer' },
  avatar:    { width:36, height:36, borderRadius:'50%', background:'#7c5cfc', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:15 },
  dropdown:  { position:'absolute', right:0, top:44, background:'#111', border:'1px solid #2a2a2a', borderRadius:12, padding:16, minWidth:200, boxShadow:'0 20px 60px rgba(0,0,0,0.5)', zIndex:200 },
  dropName:  { color:'#fff', fontWeight:600, margin:'0 0 4px', fontSize:14 },
  dropEmail: { color:'#666', fontSize:12, margin:'0 0 8px' },
  dropItem:  { display:'block', color:'#aaa', textDecoration:'none', padding:'6px 0', fontSize:14 },
  dropLogout:{ display:'block', width:'100%', textAlign:'left', background:'none', border:'none', color:'#ff4d4d', fontSize:14, cursor:'pointer', padding:'6px 0' },

  // ── Mobile ───────────────────────────────────────────
  mobileRight:{ display:'flex', alignItems:'center', gap:12 },
  hamburger: { background:'none', border:'none', cursor:'pointer', padding:8, display:'flex', flexDirection:'column', gap:5, zIndex:101 },
  bar:       { display:'block', width:24, height:2, background:'#fff', borderRadius:2, transition:'all 0.3s ease' },
  bar1Open:  { transform:'translateY(7px) rotate(45deg)' },
  bar2Open:  { opacity:0 },
  bar3Open:  { transform:'translateY(-7px) rotate(-45deg)' },

  // Permanent search row below the logo bar (Amazon-style)
  mobileSearchRow: {
    padding: '8px 14px 10px',
    borderTop: '1px solid #1a1a1a',
    background: '#0a0a0a',
  },

  mobileMenu:   { background:'#0e0e12', borderTop:'1px solid #1e1e2e', padding:'16px 24px 24px', display:'flex', flexDirection:'column', gap:4 },
  mobileLink: {
    color:'#ccc', textDecoration:'none', fontSize:15, fontWeight:500,
    padding:'11px 16px', borderRadius:10, display:'flex', alignItems:'center', gap:12,
  },
  mobileDivider:{ borderTop:'1px solid #1e1e2e', margin:'8px 0' },
  mobileUser:   { display:'flex', alignItems:'center', gap:12, padding:'12px 16px' },
  mobileAvatar: { width:44, height:44, borderRadius:'50%', background:'#7c5cfc', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:18, flexShrink:0 },
  mobileUserName: { color:'#fff', fontWeight:600, fontSize:15 },
  mobileUserEmail:{ color:'#555', fontSize:13, marginTop:2 },
  mobileLogout: {
    background:'rgba(255,77,77,0.1)', border:'1px solid rgba(255,77,77,0.2)',
    color:'#ff4d4d', borderRadius:10, padding:'11px 16px', fontSize:15, fontWeight:600,
    cursor:'pointer', textAlign:'left', marginTop:8, display:'flex', alignItems:'center', gap:12, width:'100%',
  },
  mobileCta: {
    background:'#7c5cfc', color:'#fff', textDecoration:'none',
    padding:'12px 16px', borderRadius:10, fontSize:15, fontWeight:700,
    textAlign:'center', marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', gap:10,
  },

  // top: 64 (logo row) + 50 (search row) = 114
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99, top:114 },
};