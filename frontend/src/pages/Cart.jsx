import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, fetchCart, updateItem, removeItem, loading } = useCart();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleUpdate = async (itemId, qty) => {
    try { await updateItem(itemId, qty); }
    catch { toast.error('Update failed'); }
  };

  const handleRemove = async (itemId) => {
    try { await removeItem(itemId); toast.success('Removed'); }
    catch { toast.error('Remove failed'); }
  };

  if (loading) return <div style={s.loading}>Loading cart...</div>;

  if (cart.items.length === 0) return (
    <div style={s.empty}>
      <p style={{fontSize:64}}>🛒</p>
      <h2 style={{color:'#fff', fontFamily:'Georgia,serif'}}>Your cart is empty</h2>
      <p style={{color:'#555'}}>Browse our plans and add some to your cart</p>
      <Link to="/products" style={s.btn}>Browse Plans</Link>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.title}>Your Cart</h1>

        <div style={s.layout}>
          {/* Items */}
          <div style={s.items}>
            {cart.items.map(item => (
              <div key={item.id} style={s.item}>
                <div style={s.itemInfo}>
                  <span style={s.itemCat}>{item.product.category_name}</span>
                  <h3 style={s.itemName}>{item.product.name}</h3>
                  <p style={s.itemCycle}>Billed {item.product.billing_cycle}</p>
                </div>
                <div style={s.itemRight}>
                  <div style={s.qtyRow}>
                    <button style={s.qtyBtn} onClick={() => handleUpdate(item.id, item.quantity - 1)}>−</button>
                    <span style={s.qty}>{item.quantity}</span>
                    <button style={s.qtyBtn} onClick={() => handleUpdate(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <div style={s.itemPrice}>₹{item.subtotal}</div>
                  <button style={s.removeBtn} onClick={() => handleRemove(item.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={s.summary}>
            <h2 style={s.summaryTitle}>Order Summary</h2>
            <div style={s.summaryRow}>
              <span>Items ({cart.count})</span>
              <span>₹{cart.total}</span>
            </div>
            <div style={s.summaryRow}>
              <span style={{color:'#4caf50'}}>Discount</span>
              <span style={{color:'#4caf50'}}>₹0</span>
            </div>
            <div style={s.divider} />
            <div style={{...s.summaryRow, fontWeight:700, fontSize:20, color:'#fff'}}>
              <span>Total</span>
              <span>₹{cart.total}</span>
            </div>
            <button style={s.checkoutBtn} onClick={() => navigate('/checkout')}>
              Proceed to Checkout →
            </button>
            <Link to="/products" style={s.continueBtn}>← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background:'#060608', minHeight:'100vh', color:'#fff' },
  loading: { display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'#555' },
  empty: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'70vh', gap:12, textAlign:'center' },
  btn: { background:'#7c5cfc', color:'#fff', textDecoration:'none', padding:'12px 28px', borderRadius:10, fontWeight:700, marginTop:12 },
  container: { maxWidth:1100, margin:'0 auto', padding:'48px 24px' },
  title: { fontSize:36, fontWeight:800, marginBottom:36, fontFamily:'Georgia,serif' },
  layout: { display:'grid', gridTemplateColumns:'1fr 360px', gap:40, alignItems:'start' },
  items: { display:'flex', flexDirection:'column', gap:16 },
  item: { background:'#0e0e12', border:'1px solid #1e1e2e', borderRadius:16, padding:24, display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 },
  itemInfo: { flex:1 },
  itemCat: { background:'rgba(124,92,252,0.15)', color:'#7c5cfc', fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:12, letterSpacing:0.5 },
  itemName: { color:'#fff', fontWeight:700, fontSize:18, margin:'8px 0 4px' },
  itemCycle: { color:'#555', fontSize:13, margin:0 },
  itemRight: { display:'flex', alignItems:'center', gap:20 },
  qtyRow: { display:'flex', alignItems:'center', gap:10 },
  qtyBtn: { background:'#1a1a2e', border:'1px solid #2a2a3a', color:'#fff', width:32, height:32, borderRadius:8, cursor:'pointer', fontSize:16 },
  qty: { color:'#fff', fontWeight:700, fontSize:16, minWidth:20, textAlign:'center' },
  itemPrice: { color:'#7c5cfc', fontWeight:700, fontSize:20, minWidth:70, textAlign:'right' },
  removeBtn: { background:'none', border:'none', color:'#444', cursor:'pointer', fontSize:16, padding:4 },
  summary: { background:'#0e0e12', border:'1px solid #1e1e2e', borderRadius:20, padding:28, position:'sticky', top:88, display:'flex', flexDirection:'column', gap:16 },
  summaryTitle: { color:'#fff', fontWeight:700, fontSize:20, margin:0, fontFamily:'Georgia,serif' },
  summaryRow: { display:'flex', justifyContent:'space-between', color:'#888', fontSize:15 },
  divider: { borderTop:'1px solid #1e1e2e' },
  checkoutBtn: { background:'#7c5cfc', color:'#fff', border:'none', borderRadius:12, padding:'14px', fontSize:16, fontWeight:700, cursor:'pointer', width:'100%' },
  continueBtn: { textDecoration:'none', color:'#555', fontSize:13, textAlign:'center' },
};
