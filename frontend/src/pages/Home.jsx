import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storeAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';   // ← ADDED
import ReviewSection from '../components/ReviewSection'; 

export default function Home() {
  const { user } = useAuth();                        // ← ADDED
  const [categories, setCategories] = useState([]);
  const [featured,   setFeatured]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    Promise.all([
      storeAPI.getCategories(),
      storeAPI.getProducts({ featured: 'true' }),
    ]).then(([catRes, featRes]) => {
      setCategories(catRes.data);
      setFeatured(featRes.data.slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.page}>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroGlow} />
        <p style={s.heroEyebrow}>✦ The subscription marketplace</p>
        <h1 style={{ ...s.heroTitle, fontSize: isMobile ? 28 : 68 }}>
          One place for all your{' '}
          <span style={s.accent}>digital subscriptions</span>
        </h1>
        <p style={{ ...s.heroSub, fontSize: isMobile ? 14 : 18 }}>
          Stream, create, learn — find every subscription plan at the best price.
          Cancel anytime, no hidden fees.
        </p>
        <div style={{ ...s.heroCtas, flexDirection: isMobile ? 'column' : 'row' }}>
          <Link to="/products" style={s.ctaPrimary}>Browse All Plans</Link>
          {!user && (
            <Link to="/register" style={s.ctaSecondary}>Create Account →</Link>
          )}
          {user && (
            <Link to="/profile" style={s.ctaSecondary}>My Account →</Link>
          )}
        </div>
      </section>

      {/* Categories */}
      <section style={{ ...s.section, padding: isMobile ? '32px 16px' : '60px 24px' }}>
        <h2 style={{ ...s.sectionTitle, fontSize: isMobile ? 22 : 32 }}>Browse by Category</h2>
        {loading ? (
          <p style={s.loading}>Loading...</p>
        ) : categories.length === 0 ? (
          <div style={s.emptyBox}>
            <p style={{ fontSize: 40 }}>📭</p>
            <p style={{ color: '#555', marginTop: 8 }}>No categories yet.</p>
          </div>
        ) : (
          <div style={{
            ...s.catGrid,
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))',
          }}>
            {categories.map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`} style={s.catCard}>
                <span style={s.catIcon}>{cat.icon || '📦'}</span>
                <span style={s.catName}>{cat.name}</span>
                <span style={s.catCount}>{cat.product_count} plan{cat.product_count !== 1 ? 's' : ''}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Plans */}
      {featured.length > 0 && (
        <section style={{ ...s.section, padding: isMobile ? '32px 16px' : '60px 24px' }}>
          
          <h2 style={{ ...s.sectionTitle, fontSize: isMobile ? 22 : 32 }}>Featured Plans</h2>
          <div style={{
            ...s.prodGrid,
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
          }}>
            {featured.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link to="/products" style={s.ctaPrimary}>View All Plans</Link>
          </div>
        </section>
      )}

      {/* Stats */}
      <section style={{
        ...s.statsRow,
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        padding: isMobile ? '24px 16px 48px' : '40px 24px 80px',
      }}>
        {[
          ['100+', 'Active Subscribers'],
          ['10+',   'Subscription Plans'],
          ['5+',   'Categories'],
          ['24/7',  'Support'],
        ].map(([num, label]) => (
          <div key={label} style={s.statBox}>
            <div style={{ ...s.statNum, fontSize: isMobile ? 26 : 36 }}>{num}</div>
            <div style={s.statLabel}>{label}</div>
          </div>
        ))}
      </section>
      <ReviewSection />

    </div>
  );
}

function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.slug}`} style={s.prodCard}>
      {product.image_url && (
        <div style={s.imgWrapper}>
          <img
            src={product.image_url}
            alt={product.name}
            style={s.img}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
      <div style={s.prodCatBadge}>{product.category_name}</div>
      <h3 style={s.prodName}>{product.name}</h3>
      <p style={s.prodDesc}>
        {product.description.length > 90
          ? product.description.slice(0, 90) + '…'
          : product.description}
      </p>
      <div style={s.prodFooter}>
        <span style={s.prodPrice}>₹{product.price}</span>
        <span style={s.prodCycle}>/{product.billing_cycle}</span>
      </div>
    </Link>
  );
}

const s = {
  page: { background: '#060608', minHeight: '100vh', color: '#fff', overflowX: 'hidden', width: '100%', boxSizing: 'border-box' },
  hero: { maxWidth: 860, margin: '0 auto', padding: '72px 20px 56px', textAlign: 'center', position: 'relative', boxSizing: 'border-box', width: '100%' },
  heroGlow: { position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 500, height: 360, background: 'radial-gradient(ellipse, rgba(124,92,252,0.15) 0%, transparent 70%)', pointerEvents: 'none' },
  heroEyebrow: { color: '#7c5cfc', fontSize: 12, fontWeight: 600, letterSpacing: 2, marginBottom: 14 },
  heroTitle: { fontWeight: 900, lineHeight: 1.15, marginBottom: 18, fontFamily: 'Georgia, serif' },
  accent: { color: '#7c5cfc', fontStyle: 'italic' },
  heroSub: { color: '#888', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.7 },
  heroCtas: { display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'stretch' },
  ctaPrimary: { background: '#7c5cfc', color: '#fff', textDecoration: 'none', padding: '13px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textAlign: 'center' },
  ctaSecondary: { color: '#aaa', textDecoration: 'none', padding: '13px 28px', border: '1px solid #2a2a2a', borderRadius: 10, fontWeight: 600, fontSize: 15, textAlign: 'center' },
  section: { maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box', width: '100%' },
  sectionTitle: { fontWeight: 800, marginBottom: 20, fontFamily: 'Georgia, serif' },
  loading: { color: '#555' },
  emptyBox: { textAlign: 'center', padding: '32px 0' },
  catGrid: { display: 'grid', gap: 12 },
  catCard: { background: '#0e0e12', border: '1px solid #1e1e2e', borderRadius: 14, padding: '18px 10px', textAlign: 'center', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 6 },
  catIcon: { fontSize: 26 },
  catName: { color: '#fff', fontWeight: 600, fontSize: 13 },
  catCount: { color: '#666', fontSize: 11 },
  prodGrid: { display: 'grid', gap: 14 },
  prodCard: { background: '#0e0e12', border: '1px solid #1e1e2e', borderRadius: 14, padding: 18, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 10 },
  prodCatBadge: { background: 'rgba(124,92,252,0.15)', color: '#7c5cfc', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, width: 'fit-content', letterSpacing: 1 },
  prodName: { color: '#fff', fontWeight: 700, fontSize: 16, margin: 0 },
  prodDesc: { color: '#666', fontSize: 13, lineHeight: 1.6, margin: 0 },
  prodFooter: { display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 'auto' },
  prodPrice: { color: '#7c5cfc', fontWeight: 800, fontSize: 22 },
  prodCycle: { color: '#555', fontSize: 12 },
  statsRow: { maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 10, boxSizing: 'border-box', width: '100%' },
  statBox: { background: '#0e0e12', border: '1px solid #1e1e2e', borderRadius: 14, padding: '20px 12px', textAlign: 'center' },
  statNum: { fontWeight: 900, color: '#7c5cfc', fontFamily: 'Georgia, serif' },
  statLabel: { color: '#666', fontSize: 12, marginTop: 6 },
   imgWrapper: {
  width: '100%', height: 160, borderRadius: 12,
  overflow: 'hidden', marginBottom: 4,
  background: '#111',
},
img: {
  width: '100%', height: '100%',
  objectFit: 'cover', display: 'block',
},
};