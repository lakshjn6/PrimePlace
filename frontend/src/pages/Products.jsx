import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { storeAPI } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
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
              {cat.icon} {cat.name}
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

function ProductCard({ product, onAddToCart }) {
  const features = Array.isArray(product.features) ? product.features : [];
  return (
    <div style={s.card}>
      <div style={s.cardTop}>
        <span style={s.catBadge}>{product.category_name}</span>
        {product.is_featured && <span style={s.featuredBadge}>⭐ Featured</span>}
      </div>
      <h3 style={s.cardName}>{product.name}</h3>
      <p style={s.cardDesc}>{product.description.slice(0, 100)}{product.description.length > 100 ? '…' : ''}</p>

      {features.length > 0 && (
        <ul style={s.features}>
          {features.slice(0,4).map((f,i) => (
            <li key={i} style={s.featureItem}>✓ {f}</li>
          ))}
        </ul>
      )}

      <div style={s.cardFooter}>
        <div>
          <span style={s.price}>₹{product.price}</span>
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
  filterBtn: { background:'#0e0e12', border:'1px solid #1e1e2e', color:'#888', padding:'8px 16px', borderRadius:20, cursor:'pointer', fontSize:13, fontWeight:500, transition:'all 0.2s' },
  filterActive: { background:'#7c5cfc', color:'#fff', borderColor:'#7c5cfc' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:24 },
  loading: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:24 },
  skeleton: { background:'#0e0e12', height:320, borderRadius:16, animation:'pulse 1.5s infinite' },
  empty: { textAlign:'center', padding:'80px 0' },
  card: { background:'#0e0e12', border:'1px solid #1e1e2e', borderRadius:20, padding:28, display:'flex', flexDirection:'column', gap:14, transition:'border-color 0.2s' },
  cardTop: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  catBadge: { background:'rgba(124,92,252,0.15)', color:'#7c5cfc', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, letterSpacing:0.5 },
  featuredBadge: { fontSize:11, color:'#f5a623', background:'rgba(245,166,35,0.1)', padding:'4px 8px', borderRadius:20 },
  cardName: { color:'#fff', fontWeight:700, fontSize:20, margin:0 },
  cardDesc: { color:'#666', fontSize:14, lineHeight:1.6, margin:0 },
  features: { listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:6 },
  featureItem: { color:'#888', fontSize:13, display:'flex', gap:6 },
  cardFooter: { marginTop:'auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 },
  price: { color:'#7c5cfc', fontWeight:800, fontSize:26 },
  cycle: { color:'#555', fontSize:13 },
  cardActions: { display:'flex', gap:8 },
  viewBtn: { textDecoration:'none', color:'#aaa', border:'1px solid #2a2a2a', padding:'8px 14px', borderRadius:8, fontSize:13, fontWeight:500 },
  addBtn: { background:'#7c5cfc', color:'#fff', border:'none', padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' },
};
