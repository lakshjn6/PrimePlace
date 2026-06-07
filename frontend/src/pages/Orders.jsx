import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../api/client';

const STATUS_COLORS = {
  pending:   { bg:'rgba(245,166,35,0.1)',  color:'#f5a623' },
  paid:      { bg:'rgba(76,175,80,0.1)',   color:'#4caf50' },
  cancelled: { bg:'rgba(255,77,77,0.1)',   color:'#ff4d4d' },
  refunded:  { bg:'rgba(100,100,255,0.1)', color:'#6496ff' },
};

export default function Orders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getOrders()
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={s.loading}>Loading orders...</div>;

  return (
    <div style={s.page}>
      <div style={s.container}>
        <h1 style={s.title}>My Orders</h1>

        {orders.length === 0 ? (
          <div style={s.empty}>
            <p style={{fontSize:64}}>📋</p>
            <h2 style={{color:'#fff', fontFamily:'Georgia,serif'}}>No orders yet</h2>
            <Link to="/products" style={s.btn}>Start Shopping</Link>
          </div>
        ) : (
          <div style={s.list}>
            {orders.map(order => {
              const statusStyle = STATUS_COLORS[order.status] || {};
              return (
                <div key={order.id} style={s.card}>
                  <div style={s.cardHeader}>
                    <div>
                      <div style={s.orderNum}>#{order.order_number}</div>
                      <div style={s.orderDate}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          year:'numeric', month:'long', day:'numeric'
                        })}
                      </div>
                    </div>
                    <span style={{ ...s.badge, background:statusStyle.bg, color:statusStyle.color }}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={s.items}>
                    {order.items.map(item => (
                      <div key={item.id} style={s.item}>
                        <span style={s.itemName}>{item.product_name}</span>
                        <span style={s.itemPrice}>₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  <div style={s.cardFooter}>
                    <div style={s.total}>Total: <strong style={{color:'#7c5cfc'}}>₹{order.total_amount}</strong></div>
                    {order.payment && (
                      <div style={s.txRef}>Ref: {order.payment.transaction_ref}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { background:'#060608', minHeight:'100vh', color:'#fff' },
  loading: { display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'#555' },
  container: { maxWidth:800, margin:'0 auto', padding:'48px 24px' },
  title: { fontSize:36, fontWeight:800, marginBottom:36, fontFamily:'Georgia,serif' },
  empty: { textAlign:'center', padding:'80px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:12 },
  btn: { background:'#7c5cfc', color:'#fff', textDecoration:'none', padding:'12px 28px', borderRadius:10, fontWeight:700, marginTop:12 },
  list: { display:'flex', flexDirection:'column', gap:20 },
  card: { background:'#0e0e12', border:'1px solid #1e1e2e', borderRadius:20, padding:28 },
  cardHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 },
  orderNum: { color:'#fff', fontWeight:700, fontSize:18 },
  orderDate: { color:'#555', fontSize:13, marginTop:4 },
  badge: { padding:'5px 12px', borderRadius:20, fontSize:11, fontWeight:700, letterSpacing:1 },
  items: { display:'flex', flexDirection:'column', gap:10, marginBottom:20 },
  item: { display:'flex', justifyContent:'space-between', borderBottom:'1px solid #111', paddingBottom:10 },
  itemName: { color:'#bbb', fontSize:15 },
  itemPrice: { color:'#aaa', fontSize:15 },
  cardFooter: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  total: { color:'#aaa', fontSize:16 },
  txRef: { color:'#444', fontSize:12 },
};
