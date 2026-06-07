import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storeAPI } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug }       = useParams();
  const navigate       = useNavigate();
  const { addToCart }  = useCart();
  const { user }       = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);

  useEffect(() => {
    storeAPI.getProduct(slug)
      .then(r => setProduct(r.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(product.id);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div style={s.loading}>Loading...</div>;
  if (!product) return null;

  const features = Array.isArray(product.features) ? product.features : [];

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Back */}
        <button style={s.back} onClick={() => navigate(-1)}>← Back</button>

        <div style={s.layout}>
          {/* Left */}
          <div style={s.left}>
            <span style={s.catBadge}>{product.category_name}</span>
            {product.is_featured && <span style={s.featured}>⭐ Featured Plan</span>}
            <h1 style={s.title}>{product.name}</h1>
            <p style={s.desc}>{product.description}</p>

            {features.length > 0 && (
              <div style={s.featuresBox}>
                <h3 style={s.featuresTitle}>What's included</h3>
                <ul style={s.featureList}>
                  {features.map((f, i) => (
                    <li key={i} style={s.featureItem}>
                      <span style={s.checkIcon}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right — pricing card */}
          <div style={s.right}>
            <div style={s.pricingCard}>
              <div style={s.pricingTop}>
                <div style={s.priceRow}>
                  <span style={s.price}>₹{product.price}</span>
                  <span style={s.cycle}>/{product.billing_cycle}</span>
                </div>
                <p style={s.pricingDesc}>
                  Billed {product.billing_cycle}. Cancel anytime.
                </p>
              </div>

              <button
                style={s.addBtn}
                onClick={handleAddToCart}
                disabled={adding}
              >
                {adding ? 'Adding...' : '🛒 Add to Cart'}
              </button>

              <button
                style={s.buyBtn}
                onClick={async () => {
                  await handleAddToCart();
                  navigate('/cart');
                }}
              >
                Buy Now →
              </button>

              <div style={s.guarantees}>
                <div style={s.guarantee}>🔒 Secure payment</div>
                <div style={s.guarantee}>♻️ Easy cancellation</div>
                <div style={s.guarantee}>🧾 Instant receipt</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background:'#060608', minHeight:'100vh', color:'#fff' },
  loading: { display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'#555' },
  container: { maxWidth:1100, margin:'0 auto', padding:'48px 24px' },
  back: { background:'none', border:'none', color:'#666', cursor:'pointer', fontSize:14, marginBottom:32, padding:0 },
  layout: { display:'grid', gridTemplateColumns:'1fr 380px', gap:60, alignItems:'start' },
  left: { display:'flex', flexDirection:'column', gap:16 },
  catBadge: { background:'rgba(124,92,252,0.15)', color:'#7c5cfc', fontSize:12, fontWeight:700, padding:'5px 12px', borderRadius:20, width:'fit-content', letterSpacing:0.5 },
  featured: { color:'#f5a623', fontSize:13 },
  title: { fontSize:42, fontWeight:900, margin:0, fontFamily:'Georgia,serif', lineHeight:1.1 },
  desc: { color:'#888', fontSize:16, lineHeight:1.8, margin:0 },
  featuresBox: { background:'#0e0e12', border:'1px solid #1e1e2e', borderRadius:16, padding:24, marginTop:8 },
  featuresTitle: { color:'#fff', fontWeight:700, fontSize:16, marginBottom:16, marginTop:0 },
  featureList: { listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:12 },
  featureItem: { color:'#bbb', fontSize:15, display:'flex', gap:10, alignItems:'flex-start' },
  checkIcon: { color:'#7c5cfc', fontWeight:700, flexShrink:0 },
  right: { position:'sticky', top:88 },
  pricingCard: { background:'#0e0e12', border:'1px solid #2a2a3a', borderRadius:20, padding:32, display:'flex', flexDirection:'column', gap:16 },
  pricingTop: { borderBottom:'1px solid #1e1e2e', paddingBottom:20 },
  priceRow: { display:'flex', alignItems:'baseline', gap:8 },
  price: { fontSize:48, fontWeight:900, color:'#7c5cfc' },
  cycle: { fontSize:16, color:'#555' },
  pricingDesc: { color:'#555', fontSize:13, margin:'8px 0 0' },
  addBtn: { background:'transparent', border:'2px solid #7c5cfc', color:'#7c5cfc', borderRadius:12, padding:'13px 20px', fontSize:16, fontWeight:700, cursor:'pointer', width:'100%' },
  buyBtn: { background:'#7c5cfc', border:'none', color:'#fff', borderRadius:12, padding:'14px 20px', fontSize:16, fontWeight:700, cursor:'pointer', width:'100%' },
  guarantees: { display:'flex', flexDirection:'column', gap:8, paddingTop:8 },
  guarantee: { color:'#555', fontSize:13 },
};
