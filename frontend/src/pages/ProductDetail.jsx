import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storeAPI } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug }      = useParams();
  const navigate      = useNavigate();
  const { addToCart } = useCart();
  const { user }      = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding,  setAdding]  = useState(false);

  useEffect(() => {
    storeAPI.getProduct(slug)
      .then(r  => setProduct(r.data))
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

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                  height:'60vh', color:'#555', background:'#060608' }}>
      Loading...
    </div>
  );
  if (!product) return null;

  const features = Array.isArray(product.features) ? product.features : [];

  return (
    <>
      {/* ── Mobile-safe styles ── */}
      <style>{`
        .pd-page      { background: #060608; min-height: 100vh; color: #fff; }
        .pd-container { max-width: 1100px; margin: 0 auto; padding: 48px 24px; box-sizing: border-box; }

        .pd-back {
          background: none; border: none; color: #666; cursor: pointer;
          font-size: 14px; margin-bottom: 32px; padding: 0;
        }

        /* Two-col layout on desktop, single col on mobile */
        .pd-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 60px;
          align-items: start;
        }

        .pd-left  { display: flex; flex-direction: column; gap: 16px; }

        .pd-cat-badge {
          background: rgba(124,92,252,0.15); color: #7c5cfc;
          font-size: 12px; font-weight: 700; padding: 5px 12px;
          border-radius: 20px; width: fit-content; letter-spacing: 0.5px;
        }
        .pd-featured { color: #f5a623; font-size: 13px; }
        .pd-title    { font-size: 42px; font-weight: 900; margin: 0; font-family: Georgia,serif; line-height: 1.1; }
        .pd-desc     { color: #888; font-size: 16px; line-height: 1.8; margin: 0; }

        .pd-features-box   { background: #0e0e12; border: 1px solid #1e1e2e; border-radius: 16px; padding: 24px; margin-top: 8px; }
        .pd-features-title { color: #fff; font-weight: 700; font-size: 16px; margin: 0 0 16px; }
        .pd-feature-list   { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
        .pd-feature-item   { color: #bbb; font-size: 15px; display: flex; gap: 10px; align-items: flex-start; }
        .pd-check          { color: #7c5cfc; font-weight: 700; flex-shrink: 0; }

        /* Pricing card — sticky on desktop, normal flow on mobile */
        .pd-right       { position: sticky; top: 88px; }
        .pd-pricing-card {
          background: #0e0e12; border: 1px solid #2a2a3a;
          border-radius: 20px; padding: 32px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .pd-pricing-top  { border-bottom: 1px solid #1e1e2e; padding-bottom: 20px; }
        .pd-price-row    { display: flex; align-items: baseline; gap: 8px; }
        .pd-price        { font-size: 48px; font-weight: 900; color: #7c5cfc; }
        .pd-cycle        { font-size: 16px; color: #555; }
        .pd-pricing-desc { color: #555; font-size: 13px; margin: 8px 0 0; }

        .pd-add-btn {
          background: transparent; border: 2px solid #7c5cfc; color: #7c5cfc;
          border-radius: 12px; padding: 13px 20px; font-size: 16px;
          font-weight: 700; cursor: pointer; width: 100%;
        }
        .pd-add-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .pd-buy-btn {
          background: #7c5cfc; border: none; color: #fff;
          border-radius: 12px; padding: 14px 20px; font-size: 16px;
          font-weight: 700; cursor: pointer; width: 100%;
        }
        .pd-guarantees { display: flex; flex-direction: column; gap: 8px; padding-top: 8px; }
        .pd-guarantee  { color: #555; font-size: 13px; }

        /* ── Mobile breakpoint ── */
        @media (max-width: 768px) {
          .pd-container { padding: 24px 16px; }
          .pd-layout    {
            grid-template-columns: 1fr;   /* stack vertically */
            gap: 32px;
          }
          .pd-right     { position: static; }  /* no sticky on mobile */
          .pd-title     { font-size: 28px; }
          .pd-price     { font-size: 36px; }
          .pd-pricing-card { padding: 20px; }
        }
      `}</style>

      <div className="pd-page">
        <div className="pd-container">

          <button className="pd-back" onClick={() => navigate(-1)}>← Back</button>

          <div className="pd-layout">

            {/* ── Left — info ── */}
            <div className="pd-left">
              <span className="pd-cat-badge">{product.category_name}</span>
              {product.is_featured && <span className="pd-featured">⭐ Featured Plan</span>}
              <h1 className="pd-title">{product.name}</h1>
              <p className="pd-desc">{product.description}</p>

              {features.length > 0 && (
                <div className="pd-features-box">
                  <h3 className="pd-features-title">What's included</h3>
                  <ul className="pd-feature-list">
                    {features.map((f, i) => (
                      <li key={i} className="pd-feature-item">
                        <span className="pd-check">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ── Right — pricing card ── */}
            <div className="pd-right">
              <div className="pd-pricing-card">
                <div className="pd-pricing-top">
                  <div className="pd-price-row">
                    <span className="pd-price">₹{product.price}</span>
                    <span className="pd-cycle">/{product.billing_cycle}</span>
                  </div>
                  <p className="pd-pricing-desc">Billed {product.billing_cycle}. Cancel anytime.</p>
                </div>

                <button className="pd-add-btn" onClick={handleAddToCart} disabled={adding}>
                  {adding ? 'Adding...' : '🛒 Add to Cart'}
                </button>

                <button className="pd-buy-btn" onClick={async () => {
                  await handleAddToCart();
                  navigate('/cart');
                }}>
                  Buy Now →
                </button>

                <div className="pd-guarantees">
                  <div className="pd-guarantee">🔒 Secure payment</div>
                  <div className="pd-guarantee">♻️ Easy cancellation</div>
                  <div className="pd-guarantee">🧾 Instant receipt</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}