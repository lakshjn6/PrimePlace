import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../api/client';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, fetchCart, clearCart } = useCart();
  const { user }                       = useAuth();
  const navigate                       = useNavigate();
  const [step, setStep]                = useState(1); // 1=Review 2=Pay 3=Success
  const [order, setOrder]              = useState(null);
  const [loading, setLoading]          = useState(false);
  const [form, setForm]                = useState({
    payer_name: user ? `${user.first_name} ${user.last_name}` : '',
    payer_email: user?.email || '',
    transaction_ref: '',
    payment_method: 'bank_transfer',
    payment_screenshot: null,
    notes: '',
  });

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.transaction_ref.trim()) { toast.error('Enter transaction reference'); return; }
    setLoading(true);
    try {
      const { data } = await ordersAPI.checkout(form);
      setOrder(data.order);
      await clearCart();
      setStep(3);
    } catch (err) {
      const errs = err.response?.data;
      toast.error(typeof errs === 'string' ? errs : JSON.stringify(errs));
    } finally {
      setLoading(false);
    }
  };

  if (step === 3 && order) return <SuccessScreen order={order} navigate={navigate} />;

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.steps}>
          {['Review', 'Payment', 'Confirmed'].map((label, i) => (
            <div key={label} style={s.stepItem}>
              <div style={{ ...s.stepCircle, ...(step > i ? s.stepDone : step === i+1 ? s.stepActive : {}) }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ ...s.stepLabel, ...(step === i+1 ? {color:'#fff'} : {}) }}>{label}</span>
            </div>
          ))}
        </div>

        <div style={s.layout}>
          {/* Left — form */}
          <div>
            {step === 1 && (
              <div style={s.card}>
                <h2 style={s.cardTitle}>Review Your Order</h2>
                {cart.items.map(item => (
                  <div key={item.id} style={s.orderItem}>
                    <div>
                      <div style={s.orderName}>{item.product.name}</div>
                      <div style={s.orderCat}>{item.product.category_name} · {item.product.billing_cycle}</div>
                    </div>
                    <div style={s.orderPrice}>₹{item.subtotal}</div>
                  </div>
                ))}
                <button style={s.nextBtn} onClick={() => setStep(2)}>Continue to Payment →</button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} style={s.card}>
                <h2 style={s.cardTitle}>Payment Details</h2>

              <div style={s.bankInfo}>
  <h3 style={s.bankTitle}>📤 Transfer to:</h3>

  {/* Scanner Image */}
  <div style={{ textAlign: "center", marginBottom: "16px" }}>
    <img
      src={require("../images/scanner.png")}
      alt="Scanner QR"
      style={{
        width: "160px",
        height: "160px",
        objectFit: "contain",
        borderRadius: "12px",
        border: "2px solid #ddd",
        padding: "8px",
        background: "#fff"
      }}
    />
  </div>

  <div style={s.bankRow}>
    <span>Bank:</span>
    <strong>State Bank of India</strong>
  </div>

  <div style={s.bankRow}>
    <span>Account:</span>
    <strong>12345678901</strong>
  </div>

  <div style={s.bankRow}>
    <span>IFSC:</span>
    <strong>SBIN0001234</strong>
  </div>

  <div style={s.bankRow}>
    <span>Name:</span>
    <strong>SubFlow Pvt. Ltd.</strong>
  </div>

  <div style={s.bankRow}>
    <span>Amount:</span>
    <strong style={{ color: "#7c5cfc" }}>₹{cart.total}</strong>
  </div>

  <p style={s.bankNote}>
    ⚠️ After transferring, fill the form below with your transaction details.
  </p>
</div>



                <div style={s.field}>
                  <label style={s.label}>Your Name *</label>
                  <input style={s.input} name="payer_name" value={form.payer_name} onChange={handleChange} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Your Email *</label>
                  <input style={s.input} name="payer_email" type="email" value={form.payer_email} onChange={handleChange} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Transaction Reference / UTR Number *</label>
                  <input style={s.input} name="transaction_ref" placeholder="e.g. UTR123456789" value={form.transaction_ref} onChange={handleChange} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Payment Method</label>
                  <select style={s.input} name="payment_method" value={form.payment_method} onChange={handleChange}>
                    <option value="bank_transfer">Bank Transfer / NEFT</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash Deposit</option>
                  </select>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Payment Screenshot (optional but recommended)</label>
                  <input style={{...s.input, padding:'10px 14px'}} type="file" name="payment_screenshot" accept="image/*" onChange={handleChange} />
                  {form.payment_screenshot && (
                    <img
                      src={URL.createObjectURL(form.payment_screenshot)}
                      alt="preview"
                      style={{maxWidth:'100%', maxHeight:200, borderRadius:8, marginTop:8, objectFit:'cover'}}
                    />
                  )}
                </div>
                <div style={s.field}>
                  <label style={s.label}>Notes (optional)</label>
                  <textarea style={{...s.input, height:80, resize:'vertical'}} name="notes" value={form.notes} onChange={handleChange} placeholder="Any additional info..." />
                </div>

                <div style={s.formActions}>
                  <button type="button" style={s.backBtn} onClick={() => setStep(1)}>← Back</button>
                  <button style={s.submitBtn} type="submit" disabled={loading}>
                    {loading ? 'Placing Order...' : '✓ Confirm Order'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right — summary */}
          <div style={s.summary}>
            <h3 style={s.summaryTitle}>Order Total</h3>
            {cart.items.map(item => (
              <div key={item.id} style={s.summaryItem}>
                <span>{item.product.name}</span>
                <span>₹{item.subtotal}</span>
              </div>
            ))}
            <div style={s.divider} />
            <div style={{...s.summaryItem, fontWeight:700, color:'#fff', fontSize:18}}>
              <span>Total</span><span>₹{cart.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessScreen({ order, navigate }) {
  return (
    <div style={s.successPage}>
      <div style={s.successCard}>
        <div style={s.successIcon}>✓</div>
        <h1 style={s.successTitle}>Payment Received!</h1>
        <p style={s.successSub}>Your order has been placed successfully.</p>
        <div style={s.orderRef}>Order: <strong>{order.order_number}</strong></div>
        <div style={s.orderTotal}>Total: <strong>₹{order.total_amount}</strong></div>
        <p style={s.successNote}>
          We'll verify your payment and activate your subscriptions within 24 hours.
          You'll receive a confirmation email at {order.payment?.payer_email}.
        </p>
        <div style={s.successBtns}>
          <button style={s.nextBtn} onClick={() => navigate('/orders')}>View Orders</button>
          <button style={{...s.backBtn, marginTop:0}} onClick={() => navigate('/products')}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background:'#060608', minHeight:'100vh', color:'#fff' },
  container: { maxWidth:1000, margin:'0 auto', padding:'48px 24px' },
  steps: { display:'flex', gap:32, marginBottom:40, alignItems:'center' },
  stepItem: { display:'flex', alignItems:'center', gap:10 },
  stepCircle: { width:36, height:36, borderRadius:'50%', background:'#1a1a2e', color:'#555', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, border:'2px solid #2a2a3a' },
  stepActive: { background:'#7c5cfc', color:'#fff', borderColor:'#7c5cfc' },
  stepDone: { background:'#1a3a2e', color:'#4caf50', borderColor:'#4caf50' },
  stepLabel: { color:'#555', fontSize:14, fontWeight:500 },
  layout: { display:'grid', gridTemplateColumns:'1fr 300px', gap:32, alignItems:'start' },
  card: { background:'#0e0e12', border:'1px solid #1e1e2e', borderRadius:20, padding:32, display:'flex', flexDirection:'column', gap:20 },
  cardTitle: { color:'#fff', fontWeight:700, fontSize:22, margin:0, fontFamily:'Georgia,serif' },
  orderItem: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0', borderBottom:'1px solid #1e1e2e' },
  orderName: { color:'#fff', fontWeight:600, fontSize:16 },
  orderCat: { color:'#555', fontSize:13, marginTop:4 },
  orderPrice: { color:'#7c5cfc', fontWeight:700, fontSize:18 },
  bankInfo: { background:'#080810', border:'1px solid #2a2a4a', borderRadius:14, padding:20, display:'flex', flexDirection:'column', gap:8 },
  bankTitle: { color:'#fff', fontWeight:700, fontSize:16, margin:'0 0 8px' },
  bankRow: { display:'flex', justifyContent:'space-between', color:'#888', fontSize:14 },
  bankNote: { color:'#f5a623', fontSize:13, margin:'8px 0 0', background:'rgba(245,166,35,0.08)', padding:'10px 14px', borderRadius:8 },
  field: { display:'flex', flexDirection:'column', gap:6 },
  label: { color:'#888', fontSize:12, fontWeight:600, letterSpacing:0.5 },
  input: { background:'#111', border:'1px solid #2a2a2a', borderRadius:10, padding:'12px 14px', color:'#fff', fontSize:14, outline:'none' },
  formActions: { display:'flex', gap:12 },
  backBtn: { background:'transparent', border:'1px solid #2a2a2a', color:'#888', borderRadius:10, padding:'12px 20px', fontSize:15, cursor:'pointer', flex:1 },
  nextBtn: { background:'#7c5cfc', color:'#fff', border:'none', borderRadius:12, padding:'14px', fontSize:16, fontWeight:700, cursor:'pointer', width:'100%' },
  submitBtn: { background:'#4caf50', color:'#fff', border:'none', borderRadius:10, padding:'12px 24px', fontSize:15, fontWeight:700, cursor:'pointer', flex:2 },
  summary: { background:'#0e0e12', border:'1px solid #1e1e2e', borderRadius:16, padding:24, position:'sticky', top:88, display:'flex', flexDirection:'column', gap:12 },
  summaryTitle: { color:'#fff', fontWeight:700, fontSize:18, margin:0, fontFamily:'Georgia,serif' },
  summaryItem: { display:'flex', justifyContent:'space-between', color:'#888', fontSize:14 },
  divider: { borderTop:'1px solid #1e1e2e' },
  successPage: { background:'#060608', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 },
  successCard: { background:'#0e0e12', border:'1px solid #1e1e2e', borderRadius:24, padding:48, textAlign:'center', maxWidth:480, width:'100%' },
  successIcon: { width:80, height:80, background:'rgba(76,175,80,0.15)', border:'2px solid #4caf50', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, color:'#4caf50', margin:'0 auto 24px' },
  successTitle: { color:'#fff', fontSize:32, fontWeight:800, margin:'0 0 8px', fontFamily:'Georgia,serif' },
  successSub: { color:'#888', fontSize:16, margin:'0 0 24px' },
  orderRef: { color:'#aaa', fontSize:15, marginBottom:8 },
  orderTotal: { color:'#fff', fontSize:18, fontWeight:700, marginBottom:16 },
  successNote: { color:'#555', fontSize:14, lineHeight:1.7, background:'#0a0a15', borderRadius:12, padding:16 },
  successBtns: { display:'flex', flexDirection:'column', gap:12, marginTop:24 },
};
