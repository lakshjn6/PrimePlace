import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storeAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import ReviewSection from '../components/ReviewSection'; 
import DiwaliEffects from '../components/DiwaliEffects';
import OfferBanner from '../components/OfferBanner';

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

      {/* Hero with Diwali Festive Effects */}
      <section style={s.hero}>
        <div style={s.heroGlow} />

        {/* Diwali Animations: Sparklers, Rockets, Bombs, Lights & Diyas */}
        <DiwaliEffects isMobile={isMobile} />

        <div style={{ position: 'relative', zIndex: 5 }}>
          <div className="diwali-festive-badge">
            <span>🪔</span> Shubh Deepavali • Festive Offers <span>✨</span>
          </div>

          {/* ── Offer Banner: guests or users with no orders ── */}
          <div style={{ width: '100%', margin: isMobile ? '18px 0 24px' : '20px 0 36px', textAlign: 'left' }}>
            <OfferBanner />
          </div>

          <div className="diwali-hero-title-box">
            <h1 style={{ ...s.heroTitle, fontSize: isMobile ? 28 : 68 }}>
              One place for all your{' '}
              <span className="diwali-accent-gold" style={s.accent}>digital subscriptions</span>
            </h1>
          </div>

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
                <div style={s.catImgWrap}>
                  {cat.image_url
                    ? <img src={cat.image_url} alt={cat.name} style={s.catImg} />
                    : <span style={s.catIcon}>{cat.icon || '📦'}</span>
                  }
                </div>
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

// Gradient palettes cycling per product id
const GRADIENTS = [
  'linear-gradient(135deg, #1a0533 0%, #3b1278 50%, #7c5cfc 100%)',
  'linear-gradient(135deg, #0a2a1a 0%, #0d5c3a 50%, #00c97a 100%)',
  'linear-gradient(135deg, #1a0a00 0%, #6b2c00 50%, #ff7c20 100%)',
  'linear-gradient(135deg, #001a2e 0%, #003d6b 50%, #0099ff 100%)',
  'linear-gradient(135deg, #1a001a 0%, #6b006b 50%, #e040fb 100%)',
  'linear-gradient(135deg, #1a1a00 0%, #5c5a00 50%, #d4c400 100%)',
];

function ProductCard({ product }) {
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const [imgError, setImgError] = React.useState(false);
  const gradient = GRADIENTS[(product.id || 0) % GRADIENTS.length];
  const hasZeroOrders = !user || (user.order_count ?? 0) === 0;
  const showDiscount = hasZeroOrders && product.discounted_price !== null && product.discounted_price !== undefined;

  return (
    <Link to={`/products/${product.slug}`} style={s.prodCard}>
      {/* Image area — always visible */}
      <div style={s.prodImgWrapper}>
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            style={s.prodImg}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ ...s.prodImgPlaceholder, background: gradient }}>
            <span style={s.prodPlaceholderIcon}>
              {product.category_icon || '📦'}
            </span>
          </div>
        )}
      </div>
      <div style={s.prodCatBadge}>{product.category_name}</div>
      <h3 style={s.prodName}>{product.name}</h3>
      <p style={s.prodDesc}>
        {product.description.length > 90
          ? product.description.slice(0, 90) + '…'
          : product.description}
      </p>
      <div style={s.prodFooter}>
        {showDiscount ? (
          <div>
            <span style={{ textDecoration: 'line-through', color: '#777', fontSize: 16, marginRight: 8 }}>
              {formatPrice(product.price)}
            </span>
            <span style={{ ...s.prodPrice, color: '#1db954' }}>
              {parseFloat(product.discounted_price) === 0 ? 'FREE (₹0)' : formatPrice(product.discounted_price)}
            </span>
          </div>
        ) : (
          <span style={s.prodPrice}>{formatPrice(product.price)}</span>
        )}
        <span style={s.prodCycle}>/{product.billing_cycle}</span>
      </div>
    </Link>
  );
}

const s = {
  page: { background: '#060608', minHeight: '100vh', color: '#fff', overflowX: 'hidden', width: '100%', boxSizing: 'border-box' },
  hero: { maxWidth: 920, margin: '0 auto', padding: '64px 20px 60px', textAlign: 'center', position: 'relative', boxSizing: 'border-box', width: '100%', overflow: 'visible' },
  heroGlow: { position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 650, height: 420, background: 'radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, rgba(124,92,252,0.1) 40%, transparent 70%)', pointerEvents: 'none' },
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
  catCard: {
    background: '#0e0e12', border: '1px solid #1e1e2e', borderRadius: 14,
    textDecoration: 'none', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 6, overflow: 'hidden',
    transition: 'border-color 0.2s, transform 0.2s',
  },
  catImgWrap: {
    width: '100%', height: 100, overflow: 'hidden',
    background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  catImg:   { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  catIcon:  { fontSize: 32, lineHeight: 1 },
  catName:  { color: '#fff', fontWeight: 600, fontSize: 13, padding: '0 8px', textAlign: 'center' },
  catCount: { color: '#666', fontSize: 11, paddingBottom: 12 },
  prodGrid: { display: 'grid', gap: 14 },
  prodCard: { background: '#0e0e12', border: '1px solid #1e1e2e', borderRadius: 14, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' },
  prodImgWrapper: { width: '100%', height: 160, overflow: 'hidden', background: '#111', flexShrink: 0 },
  prodImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  prodImgPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  prodPlaceholderIcon: { fontSize: 44, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' },
  prodCatBadge: { background: 'rgba(124,92,252,0.15)', color: '#7c5cfc', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, width: 'fit-content', letterSpacing: 1, margin: '14px 14px 0' },
  prodName: { color: '#fff', fontWeight: 700, fontSize: 16, margin: '6px 14px 0' },
  prodDesc: { color: '#666', fontSize: 13, lineHeight: 1.6, margin: '6px 14px 0', flexGrow: 1 },
  prodFooter: { display: 'flex', alignItems: 'baseline', gap: 4, margin: '10px 14px 14px' },
  prodPrice: { color: '#7c5cfc', fontWeight: 800, fontSize: 22 },
  prodCycle: { color: '#555', fontSize: 12 },
  statsRow: { maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 10, boxSizing: 'border-box', width: '100%' },
  statBox: { background: '#0e0e12', border: '1px solid #1e1e2e', borderRadius: 14, padding: '20px 12px', textAlign: 'center' },
  statNum: { fontWeight: 900, color: '#7c5cfc', fontFamily: 'Georgia, serif' },
  statLabel: { color: '#666', fontSize: 12, marginTop: 6 },
};