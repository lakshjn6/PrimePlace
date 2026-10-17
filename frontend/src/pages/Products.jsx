import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { storeAPI } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';

export default function Products() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { user }      = useAuth();
  const activeCategory = searchParams.get('category') || '';

  useEffect(() => {
    storeAPI.getCategories().then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = activeCategory ? { category: activeCategory } : {};
    storeAPI.getProducts(params)
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const handleAddToCart = async (productId, e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to add to cart'); return; }
    try {
      await addToCart(productId);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add to cart');
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.title}>All Subscription Plans</h1>

        {/* Category Filter */}
        <div style={s.filters}>
          <button
            style={{ ...s.filterBtn, ...(activeCategory === '' ? s.filterActive : {}) }}
            onClick={() => setSearchParams({})}
          >All</button>
          {categories.map(cat => (
            <button
              key={cat.id}
              style={{ ...s.filterBtn, ...(activeCategory === cat.slug ? s.filterActive : {}) }}
              onClick={() => setSearchParams({ category: cat.slug })}
            >
              {cat.image_url
                ? <img src={cat.image_url} alt={cat.name} style={s.filterCatImg} />
                : <span>{cat.icon}</span>
              }
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={s.loading}>
            {[...Array(6)].map((_, i) => <div key={i} style={s.skeleton} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={s.empty}>
            <p style={{fontSize:48}}>📭</p>
            <p style={{color:'#555'}}>No plans found in this category.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {products.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Gradient palettes cycling per category
const GRADIENTS = [
  'linear-gradient(135deg, #1a0533 0%, #3b1278 50%, #7c5cfc 100%)',
  'linear-gradient(135deg, #0a2a1a 0%, #0d5c3a 50%, #00c97a 100%)',
  'linear-gradient(135deg, #1a0a00 0%, #6b2c00 50%, #ff7c20 100%)',
  'linear-gradient(135deg, #001a2e 0%, #003d6b 50%, #0099ff 100%)',
  'linear-gradient(135deg, #1a001a 0%, #6b006b 50%, #e040fb 100%)',
  'linear-gradient(135deg, #1a1a00 0%, #5c5a00 50%, #d4c400 100%)',
];

function ProductCard({ product, onAddToCart }) {
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const features = Array.isArray(product.features) ? product.features : [];
  const [imgError, setImgError] = React.useState(false);
  // pick a stable gradient based on the product id
  const gradient = GRADIENTS[(product.id || 0) % GRADIENTS.length];
  const hasZeroOrders = !user || (user.order_count ?? 0) === 0;
  const showDiscount = hasZeroOrders && product.discounted_price !== null && product.discounted_price !== undefined;

  return (
    <div style={s.card}>

      {/* ── Product Image ── */}
      <div style={s.imgWrapper}>
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            style={s.img}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ ...s.imgPlaceholder, background: gradient }}>
            <span style={s.placeholderIcon}>
              {product.category_icon || '📦'}
            </span>
            <span style={s.placeholderName}>{product.category_name}</span>
          </div>
        )}
        {product.is_featured && (
          <span style={s.featuredRibbon}>⭐ Featured</span>
        )}
      </div>

      <div style={s.cardTop}>
        <span style={s.catBadge}>{product.category_name}</span>
      </div>

      <h3 style={s.cardName}>{product.name}</h3>

      {/* ── Features list ── */}
      {features.length > 0 && (
        <ul style={s.features}>
          {features.slice(0, 4).map((f, i) => (
            <li key={i} style={s.featureItem}>✓ {f}</li>
          ))}
        </ul>
      )}

      <div style={s.cardFooter}>
        <div>
          {showDiscount ? (
            <div>
              <span style={{ textDecoration: 'line-through', color: '#777', fontSize: 14, marginRight: 6 }}>
                {formatPrice(product.price)}
              </span>
              <span style={{ ...s.price, color: '#1db954' }}>
                {parseFloat(product.discounted_price) === 0 ? 'FREE (₹0)' : formatPrice(product.discounted_price)}
              </span>
            </div>
          ) : (
            <span style={s.price}>{formatPrice(product.price)}</span>
          )}
          <span style={s.cycle}>/{product.billing_cycle}</span>
        </div>
        <div style={s.cardActions}>
          <Link to={`/products/${product.slug}`} style={s.viewBtn}>Details</Link>
          <button style={s.addBtn} onClick={(e) => onAddToCart(product.id, e)}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background:'#060608', minHeight:'100vh', color:'#fff' },
  container: { maxWidth:1200, margin:'0 auto', padding:'48px 24px' },
  title: { fontSize:36, fontWeight:800, marginBottom:32, fontFamily:'Georgia,serif' },
  filters: { display:'flex', gap:10, flexWrap:'wrap', marginBottom:40 },
  filterBtn: {
    background:'#0e0e12', border:'1px solid #1e1e2e', color:'#888',
    padding:'7px 14px', borderRadius:20, cursor:'pointer', fontSize:13,
    fontWeight:500, transition:'all 0.2s',
    display:'flex', alignItems:'center', gap:7,
  },
  filterCatImg: { width:20, height:20, borderRadius:'50%', objectFit:'cover', flexShrink:0 },
  filterActive: { background:'#7c5cfc', color:'#fff', borderColor:'#7c5cfc' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:24 },
  loading: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:24 },
  skeleton: { background:'#0e0e12', height:320, borderRadius:16, animation:'pulse 1.5s infinite' },
  empty: { textAlign:'center', padding:'80px 0' },
  card: { background:'#0e0e12', border:'1px solid #1e1e2e', borderRadius:20, padding:0, display:'flex', flexDirection:'column', gap:0, transition:'border-color 0.2s, transform 0.2s, box-shadow 0.2s', overflow:'hidden' },
  cardTop: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px 0' },
  catBadge: { background:'rgba(124,92,252,0.15)', color:'#7c5cfc', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, letterSpacing:0.5 },
  featuredRibbon: { position:'absolute', top:10, right:10, fontSize:11, color:'#f5a623', background:'rgba(10,8,2,0.75)', backdropFilter:'blur(4px)', padding:'4px 10px', borderRadius:20, fontWeight:700 },
  cardName: { color:'#fff', fontWeight:700, fontSize:20, margin:0, padding:'0 18px' },
  cardDesc: { color:'#666', fontSize:14, lineHeight:1.6, margin:0 },
  features: { listStyle:'none', padding:'0 18px', margin:'8px 0', display:'flex', flexDirection:'column', gap:5 },
  featureItem: { color:'#888', fontSize:13, display:'flex', gap:6, alignItems:'flex-start' },
  cardFooter: { marginTop:'auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, padding:'14px 18px 18px' },
  price: { color:'#7c5cfc', fontWeight:800, fontSize:26 },
  cycle: { color:'#555', fontSize:13 },
  cardActions: { display:'flex', gap:8 },
  viewBtn: { textDecoration:'none', color:'#aaa', border:'1px solid #2a2a2a', padding:'8px 14px', borderRadius:8, fontSize:13, fontWeight:500 },
  addBtn: { background:'#7c5cfc', color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' },
  imgWrapper: { position:'relative', width:'100%', height:180, overflow:'hidden', background:'#111' },
  img: { width:'100%', height:'100%', objectFit:'cover', display:'block' },
  imgPlaceholder: { width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 },
  placeholderIcon: { fontSize:52, lineHeight:1, filter:'drop-shadow(0 2px 12px rgba(0,0,0,0.5))' },
  placeholderName: { color:'rgba(255,255,255,0.45)', fontSize:12, fontWeight:600, letterSpacing:1, textTransform:'uppercase' },
};
