import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../api/client';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const STATUS_COLORS = {
  pending:   { bg:'rgba(245,166,35,0.1)',  color:'#f5a623' },
  paid:      { bg:'rgba(76,175,80,0.1)',   color:'#4caf50' },
  cancelled: { bg:'rgba(255,77,77,0.1)',   color:'#ff4d4d' },
  refunded:  { bg:'rgba(100,100,255,0.1)', color:'#6496ff' },
};

export default function Orders() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Admin profit edit state
  const [editingProfitId, setEditingProfitId] = useState(null);
  const [profitInput, setProfitInput] = useState('');
  const [savingProfit, setSavingProfit] = useState(false);

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveProfit = async (order) => {
    setSavingProfit(true);
    try {
      const res = await ordersAPI.updateOrder(order.order_number, {
        profit: profitInput === '' ? null : profitInput,
      });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, profit: res.data.profit } : o));
      setEditingProfitId(null);
      toast.success(`Profit updated for #${order.order_number}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profit.');
    } finally {
      setSavingProfit(false);
    }
  };

  useEffect(() => {
    ordersAPI.getOrders()
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                  height:'60vh', color:'#555', background:'#060608' }}>
      Loading orders...
    </div>
  );

  return (
    <>
      <style>{`
        .ord-page      { background:#060608; min-height:100vh; color:#fff; }
        .ord-container { max-width:860px; margin:0 auto; padding:48px 24px; box-sizing:border-box; }
        .ord-title-row { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:28px; flex-wrap:wrap; gap:12px; }
        .ord-title     { font-size:36px; font-weight:800; margin:0; font-family:Georgia,serif; }

        .ord-admin-badge {
          background: rgba(124, 92, 252, 0.15);
          border: 1px solid rgba(124, 92, 252, 0.35);
          color: #c4b5fd;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .ord-empty {
          text-align:center; padding:80px 0;
          display:flex; flex-direction:column; align-items:center; gap:12px;
        }
        .ord-empty-btn {
          background:#7c5cfc; color:#fff; text-decoration:none;
          padding:12px 28px; border-radius:10px; font-weight:700; margin-top:12px;
        }

        .ord-list { display:flex; flex-direction:column; gap:20px; }

        .ord-card {
          background:#0e0e12; border:1px solid #1e1e2e;
          border-radius:20px; padding:28px;
          transition: border-color 0.2s ease;
        }
        .ord-card:hover {
          border-color: #2a2a3e;
        }
        .ord-card-header {
          display:flex; justify-content:space-between;
          align-items:flex-start; margin-bottom:20px; gap:12px;
        }
        .ord-num    { color:#fff; font-weight:700; font-size:18px; }
        .ord-date   { color:#555; font-size:13px; margin-top:4px; }
        .ord-user-tag { color: #a78bfa; font-size: 13px; margin-top: 4px; font-weight: 500; }
        .ord-badge  { padding:5px 12px; border-radius:20px; font-size:11px; font-weight:700; letter-spacing:1px; flex-shrink:0; }

        .ord-pending-msg {
          display:flex; align-items:center; gap:8px;
          background:rgba(245,166,35,0.1); border:1px solid rgba(245,166,35,0.3);
          color:#f5a623; font-size:13px; font-weight:600;
          border-radius:10px; padding:10px 14px; margin-bottom:20px;
        }

        /* Delivery & Product Details Box */
        .ord-delivery-box {
          background: #090a10;
          border: 1px solid rgba(124, 92, 252, 0.28);
          border-radius: 12px;
          padding: 14px 16px;
          margin-top: 10px;
          margin-bottom: 12px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
        }
        .ord-order-box {
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(124, 92, 252, 0.08) 100%);
          border: 1px solid rgba(76, 175, 80, 0.3);
          margin-bottom: 20px;
        }
        .ord-box-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .ord-box-title {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #a78bfa;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ord-order-box .ord-box-title {
          color: #4caf50;
        }
        .ord-copy-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #ccc;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ord-copy-btn:hover {
          background: #7c5cfc;
          border-color: #7c5cfc;
          color: #fff;
        }
        .ord-copy-btn.copied {
          background: rgba(76, 175, 80, 0.2);
          border-color: #4caf50;
          color: #4caf50;
        }
        .ord-box-content {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          background: #050508;
          border: 1px solid #1a1a24;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13.5px;
          color: #e2e8f0;
          line-height: 1.55;
          white-space: pre-wrap;
          word-break: break-word;
          user-select: text;
        }

        .ord-items  { display:flex; flex-direction:column; gap:12px; margin-bottom:20px; }
        .ord-item-group { border-bottom:1px solid #161622; padding-bottom:12px; }
        .ord-item-group:last-child { border-bottom:none; }
        .ord-item   { display:flex; justify-content:space-between; align-items:center; gap:8px; }
        .ord-item-name  { color:#bbb; font-size:15px; flex:1; min-width:0;
                          overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .ord-item-price { color:#aaa; font-size:15px; flex-shrink:0; }

        .ord-card-footer {
          display:flex; justify-content:space-between;
          align-items:center; flex-wrap:wrap; gap:12px;
          padding-top:14px; border-top:1px solid #161622;
        }
        .ord-total  { color:#aaa; font-size:15px; }
        .ord-ref    { color:#555; font-size:12px; }

        /* Admin Profit Styling */
        .ord-admin-profit {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 8px;
          padding: 4px 10px;
        }

        /* Mobile */
        @media (max-width: 600px) {
          .ord-container { padding:24px 16px; }
          .ord-title     { font-size:26px; }
          .ord-card      { padding:16px; border-radius:14px; }
          .ord-num       { font-size:15px; }
          .ord-item-name { font-size:14px; }
          .ord-card-footer { flex-direction:column; align-items:flex-start; }
        }
      `}</style>

      <div className="ord-page">
        <div className="ord-container">
          <div className="ord-title-row">
            <h1 className="ord-title">{user?.is_admin ? 'All Orders' : 'My Orders'}</h1>
            {user?.is_admin && (
              <span className="ord-admin-badge">
                🛡️ Admin Mode · Total Orders: {orders.length}
              </span>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="ord-empty">
              <p style={{fontSize:64, margin:0}}>📋</p>
              <h2 style={{color:'#fff', fontFamily:'Georgia,serif', margin:0}}>No orders yet</h2>
              <Link to="/products" className="ord-empty-btn">Start Shopping</Link>
            </div>
          ) : (
            <div className="ord-list">
              {orders.map(order => {
                const st = STATUS_COLORS[order.status] || {};
                const isPaid = order.status === 'paid';

                return (
                  <div key={order.id} className="ord-card">
                    <div className="ord-card-header">
                      <div>
                        <div className="ord-num">#{order.order_number}</div>
                        {user?.is_admin && order.user_email && (
                          <div className="ord-user-tag">👤 Customer: {order.user_email}</div>
                        )}
                        <div className="ord-date">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            year:'numeric', month:'long', day:'numeric'
                          })}
                        </div>
                      </div>
                      <span className="ord-badge" style={{background:st.bg, color:st.color}}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>

                    {order.status === 'pending' && (
                      <div className="ord-pending-msg">
                        🚚 Your product will be delivered within 24hrs from the time you ordered.
                      </div>
                    )}

                    {/* Overall Order Delivery Box shown when Paid */}
                    {isPaid && (order.your_order || !order.items?.some(it => it.your_product)) && (
                      <div className="ord-delivery-box ord-order-box">
                        <div className="ord-box-header">
                          <span className="ord-box-title">
                            📦 Your Order
                          </span>
                          {order.your_order && (
                            <button
                              className={`ord-copy-btn ${copiedId === `ord-${order.id}` ? 'copied' : ''}`}
                              onClick={() => handleCopy(order.your_order, `ord-${order.id}`)}
                            >
                              {copiedId === `ord-${order.id}` ? '✓ Copied' : '📋 Copy'}
                            </button>
                          )}
                        </div>
                        <div className="ord-box-content">
                          {order.your_order ? order.your_order : 'Payment Confirmed! Your order is active.'}
                        </div>
                      </div>
                    )}

                    <div className="ord-items">
                      {order.items?.map(item => (
                        <div key={item.id} className="ord-item-group">
                          <div className="ord-item">
                            <span className="ord-item-name">{item.product_name}</span>
                            <span className="ord-item-price">{formatPrice(item.subtotal)}</span>
                          </div>

                          {/* Per-Product Delivery Box shown when Paid */}
                          {isPaid && item.your_product ? (
                            <div className="ord-delivery-box ord-product-box">
                              <div className="ord-box-header">
                                <span className="ord-box-title">
                                  🔑 Your Product
                                </span>
                                <button
                                  className={`ord-copy-btn ${copiedId === `prod-${item.id}` ? 'copied' : ''}`}
                                  onClick={() => handleCopy(item.your_product, `prod-${item.id}`)}
                                >
                                  {copiedId === `prod-${item.id}` ? '✓ Copied' : '📋 Copy'}
                                </button>
                              </div>
                              <div className="ord-box-content">
                                {item.your_product}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    <div className="ord-card-footer">
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                        <div className="ord-total">
                          Total: <strong style={{color:'#7c5cfc'}}>{formatPrice(order.total_amount)}</strong>
                        </div>

                        {/* Admin-only Profit Column / Field */}
                        {user?.is_admin && (
                          <div className="ord-admin-profit">
                            <span style={{ fontSize: 13, color: '#10b981', fontWeight: 700 }}>
                              💰 Profit:
                            </span>

                            {editingProfitId === order.id ? (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ color: '#888', fontSize: 12 }}>₹</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={profitInput}
                                  onChange={(e) => setProfitInput(e.target.value)}
                                  placeholder="0.00"
                                  style={{
                                    width: 85,
                                    background: '#090a10',
                                    border: '1px solid #10b981',
                                    borderRadius: 6,
                                    color: '#fff',
                                    padding: '3px 8px',
                                    fontSize: 13,
                                    outline: 'none',
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveProfit(order)}
                                  disabled={savingProfit}
                                  style={{
                                    background: '#10b981',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    padding: '4px 10px',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {savingProfit ? '...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => setEditingProfitId(null)}
                                  style={{
                                    background: 'transparent',
                                    color: '#888',
                                    border: '1px solid #333',
                                    borderRadius: 6,
                                    padding: '4px 8px',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <span
                                onClick={() => {
                                  setEditingProfitId(order.id);
                                  setProfitInput(order.profit !== null && order.profit !== undefined ? order.profit : '');
                                }}
                                title="Click to edit profit"
                                style={{
                                  cursor: 'pointer',
                                  color: order.profit ? '#34d399' : '#888',
                                  fontSize: 13,
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                {order.profit !== null && order.profit !== undefined && order.profit !== '' ? (
                                  <>₹{order.profit} <span style={{ fontSize: 11, color: '#aaa' }}>✎</span></>
                                ) : (
                                  <span style={{ fontStyle: 'italic', color: '#777', textDecoration: 'underline' }}>+ Write profit</span>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {order.payment && (
                        <div className="ord-ref">Ref: {order.payment.transaction_ref}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}