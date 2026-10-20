import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { storeAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import ReviewSection from '../components/ReviewSection'; 
import DiwaliEffects from '../components/DiwaliEffects';
import OfferBanner from '../components/OfferBanner';

export default function Home({ scrollToReviews = false }) {
  const { user } = useAuth();                        // ← ADDED
  const location = useLocation();
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

  // Auto-scroll to reviews section if navigating to /reviews, /review, or #reviews
  useEffect(() => {
    const isReviewTarget =
      scrollToReviews ||
      location.pathname === '/reviews' ||
      location.pathname === '/review' ||
      location.hash === '#reviews';

    if (isReviewTarget) {
      const doScroll = () => {
        const el = document.getElementById('reviews');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };

      // Try immediately and at staggered intervals to account for images/data rendering
      doScroll();
      const t1 = setTimeout(doScroll, 150);
      const t2 = setTimeout(doScroll, 400);
      const t3 = setTimeout(doScroll, 800);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [scrollToReviews, location.pathname, location.hash, loading]);

  return (
    <div style={s.page}>
      <style>{`
        /* Categories: 3 small boxes per line, full image on top */
        .home-cat-card {
          background: #0e0e12;
          border: 1px solid #1e1e2e;
          border-radius: 12px;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          position: relative;
        }
        .home-cat-card:hover {
          border-color: #7c5cfc;
          transform: translateY(-3px);
          box-shadow: 0 8px 22px rgba(124, 92, 252, 0.22);
          background: #13121d;
        }
        .home-cat-img-wrap {
          width: 100%;
          height: 64px;
          background: #111118;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .home-cat-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }
        .home-cat-card:hover .home-cat-img {
          transform: scale(1.06);
        }
        .home-cat-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle, #201a3a 0%, #0d0d14 100%);
        }
        .home-cat-icon {
          font-size: 26px;
          line-height: 1;
        }
        .home-cat-body {
          padding: 7px 4px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
        }
        .home-cat-name {
          color: #fff;
          font-weight: 700;
          font-size: 11px;
          line-height: 1.25;
          text-align: center;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          width: 100%;
          word-break: break-word;
        }
        .home-cat-count {
          color: #777;
          font-size: 9.5px;
          margin-top: 2px;
        }

        @media (min-width: 768px) {
          .home-cat-card {
            border-radius: 16px;
          }
          .home-cat-img-wrap {
            height: 90px;
          }
          .home-cat-icon {
            font-size: 36px;
          }
          .home-cat-body {
            padding: 10px 8px 12px;
          }
          .home-cat-name {
            font-size: 13.5px;
          }
          .home-cat-count {
            font-size: 11px;
            margin-top: 3px;
          }
        }
      `}</style>

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
      <section style={{ ...s.section, padding: isMobile ? '28px 14px' : '56px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: isMobile ? 14 : 20 }}>
          <h2 style={{ ...s.sectionTitle, fontSize: isMobile ? 20 : 30, margin: 0 }}>Browse by Category</h2>
          <Link to="/products" style={{ color: '#7c5cfc', fontSize: isMobile ? 12 : 14, fontWeight: 600, textDecoration: 'none' }}>
            View all →
          </Link>
        </div>

        {loading ? (
          <p style={s.loading}>Loading...</p>
        ) : categories.length === 0 ? (
          <div style={s.emptyBox}>
            <p style={{ fontSize: 40 }}>📭</p>
            <p style={{ color: '#555', marginTop: 8 }}>No categories yet.</p>
          </div>
        ) : (
          <div className="home-cat-grid" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: isMobile ? '8px' : '16px',
          }}>
            {categories.map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`} className="home-cat-card">
                <div className="home-cat-img-wrap">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="home-cat-img" />
                  ) : (
                    <div className="home-cat-placeholder">
                      <span className="home-cat-icon">{cat.icon || '📦'}</span>
                    </div>
                  )}
                </div>
                <div className="home-cat-body">
                  <span className="home-cat-name">{cat.name}</span>
                  <span className="home-cat-count">{cat.product_count} plan{cat.product_count !== 1 ? 's' : ''}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Plans */}
      {featured.length > 0 && (
        <section style={{ ...s.section, padding: isMobile ? '28px 14px' : '60px 24px' }}>
          
          <h2 style={{ ...s.sectionTitle, fontSize: isMobile ? 20 : 32, marginBottom: isMobile ? 14 : 22 }}>
            Featured Plans
          </h2>
          <div style={{
            ...s.prodGrid,
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: isMobile ? '10px 8px' : '20px',
          }}>
            {featured.map(p => (
              <ProductCard key={p.id} product={p} isMobile={isMobile} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: isMobile ? 22 : 32 }}>
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

function ProductCard({ product, isMobile = false }) {
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const [imgError, setImgError] = React.useState(false);
  const gradient = GRADIENTS[(product.id || 0) % GRADIENTS.length];
  const hasZeroOrders = !user || (user.order_count ?? 0) === 0;
  const showDiscount = hasZeroOrders && product.discounted_price !== null && product.discounted_price !== undefined;

  return (
    <Link to={`/products/${product.slug}`} style={{ ...s.prodCard, borderRadius: isMobile ? 14 : 20 }}>
      {/* Image area — always visible */}
      <div style={{ ...s.prodImgWrapper, height: isMobile ? 115 : 160 }}>
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            style={s.prodImg}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ ...s.prodImgPlaceholder, background: gradient }}>
            <span style={{ ...s.prodPlaceholderIcon, fontSize: isMobile ? 32 : 44 }}>
              {product.category_icon || '📦'}
            </span>
          </div>
        )}
      </div>
      <div style={{
        ...s.prodCatBadge,
        fontSize: isMobile ? 9 : 10,
        padding: isMobile ? '2px 7px' : '3px 9px',
        margin: isMobile ? '8px 10px 0' : '14px 14px 0'
      }}>
        {product.category_name}
      </div>
      <h3 style={{
        ...s.prodName,
        fontSize: isMobile ? 13 : 16,
        margin: isMobile ? '4px 10px 0' : '6px 14px 0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {product.name}
      </h3>
      <p style={{
        ...s.prodDesc,
        fontSize: isMobile ? 11 : 13,
        lineHeight: 1.35,
        margin: isMobile ? '3px 10px 0' : '6px 14px 0',
        WebkitLineClamp: 2,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {product.description.length > (isMobile ? 50 : 90)
          ? product.description.slice(0, isMobile ? 50 : 90) + '…'
          : product.description}
      </p>
      <div style={{
        ...s.prodFooter,
        margin: isMobile ? '8px 10px 10px' : '10px 14px 14px',
        gap: isMobile ? 2 : 4,
      }}>
        {showDiscount ? (
          <div>
            <span style={{ textDecoration: 'line-through', color: '#777', fontSize: isMobile ? 11 : 16, marginRight: 4 }}>
              {formatPrice(product.price)}
            </span>
            <span style={{ ...s.prodPrice, color: '#1db954', fontSize: isMobile ? 16 : 22 }}>
              {parseFloat(product.discounted_price) === 0 ? 'FREE (₹0)' : formatPrice(product.discounted_price)}
            </span>
          </div>
        ) : (
          <span style={{ ...s.prodPrice, fontSize: isMobile ? 16 : 22 }}>{formatPrice(product.price)}</span>
        )}
        <span style={{ ...s.prodCycle, fontSize: isMobile ? 10.5 : 12 }}>/{product.billing_cycle}</span>
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