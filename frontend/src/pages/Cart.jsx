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

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                  height:'60vh', color:'#555', background:'#060608' }}>
      Loading cart...
    </div>
  );

  if (cart.items.length === 0) return (
    <>
      <style>{`.cart-empty-btn{background:#7c5cfc;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;margin-top:12px;}`}</style>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
                    justifyContent:'center', height:'70vh', gap:12,
                    textAlign:'center', background:'#060608', color:'#fff' }}>
        <p style={{fontSize:64, margin:0}}>🛒</p>
        <h2 style={{fontFamily:'Georgia,serif', margin:0}}>Your cart is empty</h2>
        <p style={{color:'#555'}}>Browse our plans and add some to your cart</p>
        <Link to="/products" className="cart-empty-btn">Browse Plans</Link>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        .cart-page      { background:#060608; min-height:100vh; color:#fff; }
        .cart-container { max-width:1100px; margin:0 auto; padding:48px 24px; box-sizing:border-box; }
        .cart-title     { font-size:36px; font-weight:800; margin-bottom:36px; font-family:Georgia,serif; }

        /* 2-col on desktop, stack on mobile */
        .cart-layout {
          display:grid;
          grid-template-columns:1fr 360px;
          gap:40px;
          align-items:start;
        }

        .cart-items { display:flex; flex-direction:column; gap:16px; }

        .cart-item {
          background:#0e0e12; border:1px solid #1e1e2e;
          border-radius:16px; padding:20px 24px;
          display:flex; justify-content:space-between;
          align-items:center; gap:16px;
        }
        .cart-item-info { flex:1; min-width:0; }
        .cart-item-cat  {
          background:rgba(124,92,252,0.15); color:#7c5cfc;
          font-size:11px; font-weight:700; padding:3px 8px;
          border-radius:12px; letter-spacing:0.5px;
        }
        .cart-item-name  { color:#fff; font-weight:700; font-size:17px; margin:8px 0 4px;
                           white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .cart-item-cycle { color:#555; font-size:13px; margin:0; }

        .cart-item-right { display:flex; align-items:center; gap:16px; flex-shrink:0; }
        .cart-qty-row    { display:flex; align-items:center; gap:8px; }
        .cart-qty-btn    {
          background:#1a1a2e; border:1px solid #2a2a3a; color:#fff;
          width:32px; height:32px; border-radius:8px; cursor:pointer; font-size:16px;
          display:flex; align-items:center; justify-content:center;
        }
        .cart-qty        { color:#fff; font-weight:700; font-size:16px; min-width:20px; text-align:center; }
        .cart-item-price { color:#7c5cfc; font-weight:700; font-size:18px; min-width:60px; text-align:right; }
        .cart-remove-btn { background:none; border:none; color:#444; cursor:pointer; font-size:18px; padding:4px; }

        /* Summary box */
        .cart-summary {
          background:#0e0e12; border:1px solid #1e1e2e; border-radius:20px;
          padding:28px; position:sticky; top:88px;
          display:flex; flex-direction:column; gap:16px;
        }
        .cart-summary-title { color:#fff; font-weight:700; font-size:20px; margin:0; font-family:Georgia,serif; }
        .cart-summary-row   { display:flex; justify-content:space-between; color:#888; font-size:15px; }
        .cart-divider       { border-top:1px solid #1e1e2e; }
        .cart-total-row     { display:flex; justify-content:space-between; font-weight:700; font-size:20px; color:#fff; }
        .cart-checkout-btn  {
          background:#7c5cfc; color:#fff; border:none; border-radius:12px;
          padding:14px; font-size:16px; font-weight:700; cursor:pointer; width:100%;
        }
        .cart-continue-btn  { text-decoration:none; color:#555; font-size:13px; text-align:center; }

        /* Mobile */
        @media (max-width: 768px) {
          .cart-container { padding:24px 16px; }
          .cart-title     { font-size:26px; margin-bottom:20px; }
          .cart-layout    { grid-template-columns:1fr; gap:24px; }
          .cart-summary   { position:static; }
          .cart-item      { flex-direction:column; align-items:flex-start; padding:16px; }
          .cart-item-right{ width:100%; justify-content:space-between; margin-top:12px; }
          .cart-item-name { font-size:15px; white-space:normal; }
        }
      `}</style>

      <div className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">Your Cart</h1>

          <div className="cart-layout">
            {/* Items */}
            <div className="cart-items">
              {cart.items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-cat">{item.product.category_name}</span>
                    <h3 className="cart-item-name">{item.product.name}</h3>
                    <p className="cart-item-cycle">Billed {item.product.billing_cycle}</p>
                  </div>
                  <div className="cart-item-right">
                    <div className="cart-qty-row">
                      <button className="cart-qty-btn" onClick={() => handleUpdate(item.id, item.quantity - 1)}>−</button>
                      <span className="cart-qty">{item.quantity}</span>
                      <button className="cart-qty-btn" onClick={() => handleUpdate(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <div className="cart-item-price">₹{item.subtotal}</div>
                    <button className="cart-remove-btn" onClick={() => handleRemove(item.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="cart-summary">
              <h2 className="cart-summary-title">Order Summary</h2>
              <div className="cart-summary-row">
                <span>Items ({cart.count})</span>
                <span>₹{cart.total}</span>
              </div>
              <div className="cart-summary-row">
                <span style={{color:'#4caf50'}}>Discount</span>
                <span style={{color:'#4caf50'}}>₹0</span>
              </div>
              <div className="cart-divider" />
              <div className="cart-total-row">
                <span>Total</span>
                <span>₹{cart.total}</span>
              </div>
              <button className="cart-checkout-btn" onClick={() => navigate('/checkout')}>
                Proceed to Checkout →
              </button>
              <Link to="/products" className="cart-continue-btn">← Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}