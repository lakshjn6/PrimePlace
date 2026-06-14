import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout }        = useAuth();
  const { cart }                = useCart();
  const navigate                = useNavigate();
  const location                = useLocation();
  const [menuOpen, setMenu]     = useState(false);
  const [mobileOpen, setMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Close mobile menu on route change
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
      <nav style={s.nav}>
        <div style={s.inner}>

          {/* Logo */}
          
          <Link to="/" style={s.logo}>
  <img
    src={require('../images/logo.png')}
    alt="PrimeMarket Logo"
    style={{
      height: "60px",
      width: "auto",
      objectFit: "contain",
    }}
  />
 
</Link>

          {/* Desktop center links */}
          {!isMobile && (
            <div style={s.links}>
              <Link to="/"         style={s.link}>Home</Link>
              <Link to="/products" style={s.link}>Plans</Link>
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

          {/* Mobile right — cart + hamburger */}
          {isMobile && (
            <div style={s.mobileRight}>
              {user && (
                <Link to="/cart" style={s.cartBtn}>
                  🛒
                  {cart.count > 0 && <span style={s.badge}>{cart.count}</span>}
                </Link>
              )}
              {/* Hamburger button */}
              <button style={s.hamburger} onClick={() => setMobile(!mobileOpen)}>
                <span style={{ ...s.bar, ...(mobileOpen ? s.bar1Open : {}) }} />
                <span style={{ ...s.bar, ...(mobileOpen ? s.bar2Open : {}) }} />
                <span style={{ ...s.bar, ...(mobileOpen ? s.bar3Open : {}) }} />
              </button>
            </div>
          )}

        </div>

        {/* Mobile dropdown menu */}
        {isMobile && mobileOpen && (
          <div style={s.mobileMenu}>
            <Link to="/"         style={s.mobileLink}>🏠 Home</Link>
            <Link to="/products" style={s.mobileLink}>📦 Plans</Link>

            {user ? (
              <>
                <Link to="/orders"  style={s.mobileLink}>📋 Orders</Link>
                <Link to="/profile" style={s.mobileLink}>👤 Profile</Link>
                {user.is_admin && (
                  <Link to="/admin-dashboard" style={s.mobileLink}>⚙️ Admin</Link>
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
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <div style={s.mobileDivider} />
                <Link to="/login"    style={s.mobileLink}>🔑 Login</Link>
                <Link to="/register" style={s.mobileCta}>✨ Get Started</Link>
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
  inner:     { maxWidth:1200, margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' },
  logo:      { display:'flex', alignItems:'center', gap:10, textDecoration:'none' },
  logoIcon:  { fontSize:24, color:'#7c5cfc' },
  logoText:  { fontSize:22, fontWeight:800, color:'#fff', fontFamily:'Georgia, serif', letterSpacing:'-0.5px' },
  links:     { display:'flex', gap:32 },
  link:      { color:'#aaa', textDecoration:'none', fontSize:14, fontWeight:500 },
  right:     { display:'flex', alignItems:'center', gap:20 },
  cartBtn:   { position:'relative', color:'#aaa', textDecoration:'none', fontSize:20 },
  badge:     { position:'absolute', top:-8, right:-8, background:'#7c5cfc', color:'#fff', fontSize:10, fontWeight:700, width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' },
  cta:       { background:'#7c5cfc', color:'#fff', textDecoration:'none', padding:'8px 18px', borderRadius:8, fontSize:14, fontWeight:600 },
  userMenu:  { position:'relative', cursor:'pointer' },
  avatar:    { width:36, height:36, borderRadius:'50%', background:'#7c5cfc', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:15 },
  dropdown:  { position:'absolute', right:0, top:44, background:'#111', border:'1px solid #2a2a2a', borderRadius:12, padding:16, minWidth:200, boxShadow:'0 20px 60px rgba(0,0,0,0.5)', zIndex:200 },
  dropName:  { color:'#fff', fontWeight:600, margin:'0 0 4px', fontSize:14 },
  dropEmail: { color:'#666', fontSize:12, margin:'0 0 8px' },
  dropItem:  { display:'block', color:'#aaa', textDecoration:'none', padding:'6px 0', fontSize:14 },
  dropLogout:{ display:'block', width:'100%', textAlign:'left', background:'none', border:'none', color:'#ff4d4d', fontSize:14, cursor:'pointer', padding:'6px 0' },

  // ── Hamburger button ────────────────────────────────
  mobileRight:{ display:'flex', alignItems:'center', gap:16 },
  hamburger: { background:'none', border:'none', cursor:'pointer', padding:8, display:'flex', flexDirection:'column', gap:5, zIndex:101 },
  bar:       { display:'block', width:24, height:2, background:'#fff', borderRadius:2, transition:'all 0.3s ease' },
  bar1Open:  { transform:'translateY(7px) rotate(45deg)' },
  bar2Open:  { opacity:0 },
  bar3Open:  { transform:'translateY(-7px) rotate(-45deg)' },

  // ── Mobile dropdown menu ────────────────────────────
  mobileMenu:   { background:'#0e0e12', borderTop:'1px solid #1e1e2e', padding:'16px 24px 24px', display:'flex', flexDirection:'column', gap:4 },
  mobileLink:   { color:'#ccc', textDecoration:'none', fontSize:16, fontWeight:500, padding:'12px 16px', borderRadius:10, display:'block' },
  mobileDivider:{ borderTop:'1px solid #1e1e2e', margin:'8px 0' },
  mobileUser:   { display:'flex', alignItems:'center', gap:12, padding:'12px 16px' },
  mobileAvatar: { width:44, height:44, borderRadius:'50%', background:'#7c5cfc', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:18, flexShrink:0 },
  mobileUserName: { color:'#fff', fontWeight:600, fontSize:15 },
  mobileUserEmail:{ color:'#555', fontSize:13, marginTop:2 },
  mobileLogout: { background:'rgba(255,77,77,0.1)', border:'1px solid rgba(255,77,77,0.2)', color:'#ff4d4d', borderRadius:10, padding:'12px 16px', fontSize:15, fontWeight:600, cursor:'pointer', textAlign:'left', marginTop:8 },
  mobileCta:    { background:'#7c5cfc', color:'#fff', textDecoration:'none', padding:'13px 16px', borderRadius:10, fontSize:15, fontWeight:700, textAlign:'center', marginTop:8 },

  // ── Overlay ─────────────────────────────────────────
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99, top:64 },
};