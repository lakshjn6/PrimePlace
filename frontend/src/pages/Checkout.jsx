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
    payer_name:          user ? `${user.first_name} ${user.last_name}` : '',
    payer_email:         user?.email || '',
    transaction_ref:     '',
    payment_method:      'upi',
    payment_screenshot:  null,
    notes:               '',
  });

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  // ── THE FIX: use FormData so file uploads work ──────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.transaction_ref.trim()) { toast.error('Enter transaction reference'); return; }

    setLoading(true);
    try {
      // Build FormData — this fixes "submitted data is not a file" error
      const fd = new FormData();
      fd.append('payer_name',      form.payer_name);
      fd.append('payer_email',     form.payer_email);
      fd.append('transaction_ref', form.transaction_ref);
      fd.append('payment_method',  form.payment_method);
      fd.append('notes',           form.notes || '');
      // Only append screenshot if user actually chose a file
      if (form.payment_screenshot instanceof File) {
        fd.append('payment_screenshot', form.payment_screenshot);
      }

      const { data } = await ordersAPI.checkout(fd);   // pass FormData not plain object
      setOrder(data.order);
      await clearCart();
      setStep(3);
    } catch (err) {
      const errs = err.response?.data;
      const msg  = typeof errs === 'object'
        ? Object.entries(errs).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(', '):v}`).join(' | ')
        : String(errs);
      toast.error(msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3 && order) return <SuccessScreen order={order} navigate={navigate} />;

  return (
    <>
      <style>{`
        .co-page      { background:#060608; min-height:100vh; color:#fff; }
        .co-container { max-width:1000px; margin:0 auto; padding:48px 24px; box-sizing:border-box; }

        /* Step indicator */
        .co-steps { display:flex; gap:24px; margin-bottom:40px; align-items:center; flex-wrap:wrap; }
        .co-step-item   { display:flex; align-items:center; gap:10px; }
        .co-step-circle {
          width:36px; height:36px; border-radius:50%; background:#1a1a2e; color:#555;
          display:flex; align-items:center; justify-content:center;
          font-weight:700; font-size:14px; border:2px solid #2a2a3a; flex-shrink:0;
        }
        .co-step-active { background:#7c5cfc !important; color:#fff !important; border-color:#7c5cfc !important; }
        .co-step-done   { background:#1a3a2e !important; color:#4caf50 !important; border-color:#4caf50 !important; }
        .co-step-label  { color:#555; font-size:14px; font-weight:500; }
        .co-step-label.active { color:#fff; }

        /* 2-col layout */
        .co-layout {
          display:grid;
          grid-template-columns:1fr 300px;
          gap:32px;
          align-items:start;
        }

        .co-card {
          background:#0e0e12; border:1px solid #1e1e2e;
          border-radius:20px; padding:32px;
          display:flex; flex-direction:column; gap:20px;
        }
        .co-card-title { color:#fff; font-weight:700; font-size:22px; margin:0; font-family:Georgia,serif; }

        /* Order items in review step */
        .co-order-item {
          display:flex; justify-content:space-between; align-items:center;
          padding:16px 0; border-bottom:1px solid #1e1e2e;
        }
        .co-order-name  { color:#fff; font-weight:600; font-size:16px; }
        .co-order-cat   { color:#555; font-size:13px; margin-top:4px; }
        .co-order-price { color:#7c5cfc; font-weight:700; font-size:18px; flex-shrink:0; }

        /* Bank info box */
        .co-bank-info  {
          background:#080810; border:1px solid #2a2a4a;
          border-radius:14px; padding:20px;
          display:flex; flex-direction:column; gap:10px;
        }
        .co-bank-title { color:#fff; font-weight:700; font-size:16px; margin:0; }
        .co-bank-row   { display:flex; justify-content:space-between; color:#888; font-size:14px; }
        .co-bank-note  {
          color:#f5a623; font-size:13px; margin:4px 0 0;
          background:rgba(245,166,35,0.08); padding:10px 14px; border-radius:8px;
        }
        .co-qr-img {
          width:160px; height:160px; object-fit:contain;
          border-radius:12px; border:2px solid #ddd;
          padding:8px; background:#fff; display:block; margin:0 auto 8px;
        }

        /* Form fields */
        .co-field { display:flex; flex-direction:column; gap:6px; }
        .co-label { color:#888; font-size:12px; font-weight:600; letter-spacing:0.5px; }
        .co-input {
          background:#111; border:1px solid #2a2a2a; border-radius:10px;
          padding:12px 14px; color:#fff; font-size:14px; outline:none;
          width:100%; box-sizing:border-box;
        }
        .co-input::placeholder { color:#444; }
        .co-screenshot-preview {
          max-width:100%; max-height:180px; border-radius:8px;
          margin-top:8px; object-fit:cover;
        }

        /* Action buttons */
        .co-form-actions { display:flex; gap:12px; flex-wrap:wrap; }
        .co-back-btn {
          background:transparent; border:1px solid #2a2a2a; color:#888;
          border-radius:10px; padding:12px 20px; font-size:15px; cursor:pointer; flex:1;
          min-width:100px;
        }
        .co-next-btn {
          background:#7c5cfc; color:#fff; border:none; border-radius:12px;
          padding:14px; font-size:16px; font-weight:700; cursor:pointer; width:100%;
        }
        .co-submit-btn {
          background:#4caf50; color:#fff; border:none; border-radius:10px;
          padding:12px 24px; font-size:15px; font-weight:700; cursor:pointer; flex:2;
          min-width:140px;
        }
        .co-submit-btn:disabled, .co-next-btn:disabled { opacity:0.6; cursor:not-allowed; }

        /* Right summary */
        .co-summary {
          background:#0e0e12; border:1px solid #1e1e2e; border-radius:16px;
          padding:24px; position:sticky; top:88px;
          display:flex; flex-direction:column; gap:12px;
        }
        .co-summary-title { color:#fff; font-weight:700; font-size:18px; margin:0; font-family:Georgia,serif; }
        .co-summary-item  { display:flex; justify-content:space-between; color:#888; font-size:14px; }
        .co-summary-total { display:flex; justify-content:space-between; font-weight:700; color:#fff; font-size:18px; }
        .co-divider       { border-top:1px solid #1e1e2e; }

        /* Success screen */
        .co-success-page {
          background:#060608; min-height:100vh;
          display:flex; align-items:center; justify-content:center; padding:24px;
        }
        .co-success-card {
          background:#0e0e12; border:1px solid #1e1e2e; border-radius:24px;
          padding:48px; text-align:center; max-width:480px; width:100%; box-sizing:border-box;
        }
        .co-success-icon {
          width:80px; height:80px; background:rgba(76,175,80,0.15);
          border:2px solid #4caf50; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-size:36px; color:#4caf50; margin:0 auto 24px;
        }
        .co-success-title { color:#fff; font-size:32px; font-weight:800; margin:0 0 8px; font-family:Georgia,serif; }
        .co-success-sub   { color:#888; font-size:16px; margin:0 0 24px; }
        .co-success-note  {
          color:#555; font-size:14px; line-height:1.7;
          background:#0a0a15; border-radius:12px; padding:16px; text-align:left;
        }
        .co-success-btns  { display:flex; flex-direction:column; gap:12px; margin-top:24px; }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .co-container { padding:24px 16px; }
          .co-layout    { grid-template-columns:1fr; gap:20px; }
          .co-summary   { position:static; }
          .co-card      { padding:20px 16px; }
          .co-steps     { gap:12px; margin-bottom:28px; }
          .co-step-label{ display:none; }   /* hide text labels, show only circles */
          .co-form-actions { flex-direction:column; }
          .co-back-btn, .co-submit-btn { flex:unset; width:100%; }
          .co-success-card { padding:32px 20px; }
          .co-success-title { font-size:24px; }
        }
      `}</style>

      <div className="co-page">
        <div className="co-container">

          {/* Step indicator */}
          <div className="co-steps">
            {['Review', 'Payment', 'Confirmed'].map((label, i) => (
              <div key={label} className="co-step-item">
                <div className={`co-step-circle ${step > i+1 ? 'co-step-done' : step === i+1 ? 'co-step-active' : ''}`}>
                  {step > i+1 ? '✓' : i+1}
                </div>
                <span className={`co-step-label ${step === i+1 ? 'active' : ''}`}>{label}</span>
              </div>
            ))}
          </div>

          <div className="co-layout">

            {/* ── Left — step content ── */}
            <div>

              {/* STEP 1 — Review */}
              {step === 1 && (
                <div className="co-card">
                  <h2 className="co-card-title">Review Your Order</h2>
                  {cart.items.map(item => (
                    <div key={item.id} className="co-order-item">
                      <div>
                        <div className="co-order-name">{item.product.name}</div>
                        <div className="co-order-cat">{item.product.category_name} · {item.product.billing_cycle}</div>
                      </div>
                      <div className="co-order-price">₹{item.subtotal}</div>
                    </div>
                  ))}
                  <button className="co-next-btn" onClick={() => setStep(2)}>
                    Continue to Payment →
                  </button>
                </div>
              )}

              {/* STEP 2 — Payment */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="co-card">
                  <h2 className="co-card-title">Payment Details</h2>

                  {/* Bank / QR info */}
                  <div className="co-bank-info">
                    <h3 className="co-bank-title">📤 Transfer to:</h3>
                    <img
                      src={require('../images/scanner.png')}
                      alt="UPI QR"
                      className="co-qr-img"
                    />
                    <div className="co-bank-row"><span>Bank:</span><strong>State Bank of India</strong></div>
                    <div className="co-bank-row"><span>Account:</span><strong>12345678901</strong></div>
                    <div className="co-bank-row"><span>IFSC:</span><strong>SBIN0001234</strong></div>
                    <div className="co-bank-row"><span>Name:</span><strong>SubFlow Pvt. Ltd.</strong></div>
                    <div className="co-bank-row">
                      <span>Amount:</span>
                      <strong style={{color:'#7c5cfc'}}>₹{cart.total}</strong>
                    </div>
                    <p className="co-bank-note">
                      ⚠️ After transferring, fill the form below with your transaction details.
                    </p>
                  </div>

                  {/* Form fields */}
                  <div className="co-field">
                    <label className="co-label">Your Name *</label>
                    <input className="co-input" name="payer_name" value={form.payer_name} onChange={handleChange} required />
                  </div>
                  <div className="co-field">
                    <label className="co-label">Your Email *</label>
                    <input className="co-input" name="payer_email" type="email" value={form.payer_email} onChange={handleChange} required />
                  </div>
                  <div className="co-field">
                    <label className="co-label">Transaction Reference / UTR Number *</label>
                    <input className="co-input" name="transaction_ref" placeholder="e.g. UTR123456789" value={form.transaction_ref} onChange={handleChange} required />
                  </div>
                  <div className="co-field">
                    <label className="co-label">Payment Method</label>
                    <select className="co-input" name="payment_method" value={form.payment_method} onChange={handleChange}>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer / NEFT</option>
                      <option value="cash">Cash Deposit</option>
                    </select>
                  </div>
                  <div className="co-field">
                    <label className="co-label">Payment Screenshot (optional but recommended)</label>
                    <input
                      className="co-input"
                      style={{padding:'10px 14px'}}
                      type="file"
                      name="payment_screenshot"
                      accept="image/*"
                      onChange={handleChange}
                    />
                    {form.payment_screenshot instanceof File && (
                      <img
                        src={URL.createObjectURL(form.payment_screenshot)}
                        alt="preview"
                        className="co-screenshot-preview"
                      />
                    )}
                  </div>
                  <div className="co-field">
                    <label className="co-label">Notes (optional)</label>
                    <textarea
                      className="co-input"
                      style={{height:80, resize:'vertical'}}
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Any additional info..."
                    />
                  </div>

                  <div className="co-form-actions">
                    <button type="button" className="co-back-btn" onClick={() => setStep(1)}>← Back</button>
                    <button className="co-submit-btn" type="submit" disabled={loading}>
                      {loading ? 'Placing Order...' : '✓ Confirm Order'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ── Right — order summary ── */}
            <div className="co-summary">
              <h3 className="co-summary-title">Order Total</h3>
              {cart.items.map(item => (
                <div key={item.id} className="co-summary-item">
                  <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'160px'}}>
                    {item.product.name}
                  </span>
                  <span>₹{item.subtotal}</span>
                </div>
              ))}
              <div className="co-divider" />
              <div className="co-summary-total">
                <span>Total</span>
                <span>₹{cart.total}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

function SuccessScreen({ order, navigate }) {
  return (
    <>
      <style>{`
        .co-success-page{background:#060608;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
        .co-success-card{background:#0e0e12;border:1px solid #1e1e2e;border-radius:24px;padding:48px;text-align:center;max-width:480px;width:100%;box-sizing:border-box;}
        .co-success-icon{width:80px;height:80px;background:rgba(76,175,80,0.15);border:2px solid #4caf50;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:36px;color:#4caf50;margin:0 auto 24px;}
        .co-success-title{color:#fff;font-size:32px;font-weight:800;margin:0 0 8px;font-family:Georgia,serif;}
        .co-success-sub{color:#888;font-size:16px;margin:0 0 24px;}
        .co-success-note{color:#555;font-size:14px;line-height:1.7;background:#0a0a15;border-radius:12px;padding:16px;text-align:left;}
        .co-success-btns{display:flex;flex-direction:column;gap:12px;margin-top:24px;}
        .co-next-btn{background:#7c5cfc;color:#fff;border:none;border-radius:12px;padding:14px;font-size:16px;font-weight:700;cursor:pointer;width:100%;}
        .co-back-btn2{background:transparent;border:1px solid #2a2a2a;color:#888;border-radius:10px;padding:12px 20px;font-size:15px;cursor:pointer;width:100%;}
        @media(max-width:480px){.co-success-card{padding:28px 16px;}.co-success-title{font-size:22px;}}
      `}</style>
      <div className="co-success-page">
        <div className="co-success-card">
          <div className="co-success-icon">✓</div>
          <h1 className="co-success-title">Payment Received!</h1>
          <p className="co-success-sub">Your order has been placed successfully.</p>
          <div style={{color:'#aaa', fontSize:15, marginBottom:8}}>
            Order: <strong style={{color:'#fff'}}>{order.order_number}</strong>
          </div>
          <div style={{color:'#fff', fontSize:18, fontWeight:700, marginBottom:16}}>
            Total: <strong style={{color:'#7c5cfc'}}>₹{order.total_amount}</strong>
          </div>
          <p className="co-success-note">
            We'll verify your payment and activate your subscriptions within 24 hours.
            You'll receive a confirmation email at <strong>{order.payment?.payer_email}</strong>.
          </p>
          <div className="co-success-btns">
            <button className="co-next-btn" onClick={() => navigate('/orders')}>View Orders</button>
            <button className="co-back-btn2" onClick={() => navigate('/products')}>Continue Shopping</button>
          </div>
        </div>
      </div>
    </>
  );
}