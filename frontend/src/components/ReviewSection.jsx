import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../api/client';

export default function ReviewSection() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, message: '' });

  useEffect(() => { loadReviews(); }, []);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setShowAllModal(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    if (showAllModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showAllModal]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await API.get('/reviews/latest/');
      setReviews(response.data);
    } catch (error) {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'rating' ? parseInt(value) : value }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to post a review'); setShowForm(false); return; }
    if (!formData.message.trim()) { toast.error('Please write a review'); return; }
    if (formData.message.length < 10) { toast.error('Review must be at least 10 characters'); return; }
    setSubmitting(true);
    try {
      await API.post('/reviews/', { message: formData.message, rating: formData.rating });
      await loadReviews();
      setFormData({ rating: 5, message: '' });
      setShowForm(false);
      toast.success('Review posted successfully!');
    } catch (error) {
      if (error.response?.status === 401) toast.error('Please login to post a review');
      else if (error.response?.data?.detail) toast.error(error.response.data.detail);
      else toast.error('Failed to post review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => (
    <div style={s.stars}>
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{ color: i < rating ? '#ffd60a' : '#333' }}>★</span>
      ))}
    </div>
  );

  const topReviews = reviews.slice(0, 4);

  const ReviewCard = ({ review }) => (
    <div style={s.reviewCard}>
      <div style={s.reviewHeader}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={s.reviewName}>
            <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {review.user_name}
            </span>
            <span style={s.verified}>✓</span>
          </h4>
          <p style={s.reviewDate}>{review.created_at}</p>
        </div>
        {renderStars(review.rating)}
      </div>
      <p style={s.reviewMessage}>{review.message}</p>
    </div>
  );

  if (loading) return (
    <section style={s.section}>
      <div style={s.container}>
        <h2 style={s.title}>Customer Reviews</h2>
        <div style={s.loadingMessage}>Loading reviews...</div>
      </div>
    </section>
  );

  return (
    <>
      <style>{`
        /* ── Modal ── */
        .modal-overlay {
          position:fixed; inset:0; background:rgba(0,0,0,0.85);
          display:flex; align-items:center; justify-content:center;
          z-index:9999; padding:16px; box-sizing:border-box;
        }
        .modal-box {
          background:#0e0e12; border:1px solid #1e1e2e; border-radius:20px;
          width:50vw; height:70vh; max-width:700px; min-width:280px;
          display:flex; flex-direction:column; overflow:hidden;
          box-sizing:border-box;
        }
        .modal-header {
          display:flex; justify-content:space-between; align-items:center;
          padding:16px 20px; border-bottom:1px solid #1e1e2e; flex-shrink:0;
        }
        .modal-title {
          color:#fff; font-size:18px; font-weight:700; margin:0;
          font-family:Georgia,serif;
        }
        .modal-close {
          background:#1a1a2e; border:1px solid #2a2a3a; color:#888;
          width:34px; height:34px; border-radius:50%; cursor:pointer;
          font-size:16px; display:flex; align-items:center; justify-content:center;
          flex-shrink:0;
        }
        .modal-close:hover { color:#fff; border-color:#7c5cfc; }
        .modal-body {
          flex:1; overflow-y:auto; padding:16px 20px;
          display:flex; flex-direction:column; gap:12px;
        }
        .modal-body::-webkit-scrollbar { width:5px; }
        .modal-body::-webkit-scrollbar-track { background:#111; }
        .modal-body::-webkit-scrollbar-thumb { background:#2a2a3a; border-radius:3px; }
        .modal-footer {
          padding:12px 20px; border-top:1px solid #1e1e2e; flex-shrink:0;
          text-align:center; color:#555; font-size:12px;
        }

        /* ── Reviews grid — 2 col desktop, 1 col mobile ── */
        .rv-grid {
          display:grid;
          grid-template-columns: repeat(2, 1fr);
          gap:16px;
        }

        /* ── Mobile ── */
        @media (max-width: 600px) {
          .modal-box {
            width: 95vw !important;
            height: 85vh !important;
            border-radius: 14px !important;
          }
          .modal-title { font-size:16px !important; }
          .rv-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <section style={s.section}>
        <div style={s.container}>
          <div style={s.header}>
            <h2 style={s.title}>Customer Reviews</h2>
            <p style={s.subtitle}>What our customers are saying about PrimeMarket</p>
          </div>

          {/* Review Form */}
          {user ? (
            <div style={s.formWrapper}>
              {!showForm ? (
                <button style={s.addReviewBtn} onClick={() => setShowForm(true)}>
                  ✍️ Write a Review
                </button>
              ) : (
                <form style={s.form} onSubmit={handleSubmitReview}>
                  <h3 style={s.formTitle}>Share Your Experience</h3>
                  <div style={s.formGroup}>
                    <label style={s.label}>Your Name</label>
                    <input type="text" value={user.first_name || user.username} disabled
                      style={{ ...s.input, opacity: 0.6 }} />
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Rating</label>
                    <div style={s.ratingSelect}>
                      {[1,2,3,4,5].map(star => (
                        <button key={star} type="button"
                          onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                          style={{
                            ...s.ratingOption,
                            background: formData.rating >= star ? '#ffd60a' : 'transparent',
                            color: formData.rating >= star ? '#000' : '#666',
                          }}>★</button>
                      ))}
                    </div>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Your Review</label>
                    <textarea name="message" value={formData.message} onChange={handleInputChange}
                      placeholder="Share your experience (minimum 10 characters)..."
                      style={s.textarea} rows="4" />
                    <small style={s.charCount}>{formData.message.length} characters (minimum 10)</small>
                  </div>
                  <div style={s.formButtons}>
                    <button type="submit" disabled={submitting} style={s.submitBtn}>
                      {submitting ? 'Posting...' : '✓ Post Review'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)}
                      disabled={submitting} style={s.cancelBtn}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div style={s.loginPrompt}>
              <p style={s.loginText}>👤 Please <strong>login</strong> to post a review</p>
            </div>
          )}

          {/* Top 4 Reviews */}
          <div className="rv-grid">
            {topReviews.length > 0 ? (
              topReviews.map(review => <ReviewCard key={review.id} review={review} />)
            ) : (
              <div style={s.noReviews}>
                <p>No reviews yet. Be the first to review! ⭐</p>
              </div>
            )}
          </div>

          {/* Load More Button */}
          {reviews.length > 4 && (
            <div style={{ textAlign:'center', marginTop:32 }}>
              <button style={s.loadMoreBtn} onClick={() => setShowAllModal(true)}>
                View All {reviews.length} Reviews →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── All Reviews Modal ── */}
      {showAllModal && (
        <div
          className="modal-overlay"
          onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setShowAllModal(false); }}
        >
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="modal-title">All Reviews ({reviews.length})</h2>
              <button className="modal-close" onClick={() => setShowAllModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
            </div>
            <div className="modal-footer">
              Press ESC or tap outside to close
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const s = {
  section: {
    background:'#060608', padding:'48px 16px',
    borderTop:'1px solid #1a1a2e', boxSizing:'border-box',
  },
  container: { maxWidth:1100, margin:'0 auto', width:'100%' },
  header: { textAlign:'center', marginBottom:40 },
  title: { fontSize:'clamp(24px, 5vw, 36px)', fontWeight:900, color:'#fff', margin:0, marginBottom:8 },
  subtitle: { fontSize:'clamp(13px, 3vw, 16px)', color:'#888', margin:0 },
  formWrapper: { marginBottom:40 },
  addReviewBtn: {
    width:'100%', maxWidth:360, display:'block', margin:'0 auto 32px',
    background:'#7c5cfc', border:'none', color:'#fff', padding:'13px 20px',
    fontSize:15, fontWeight:700, borderRadius:12, cursor:'pointer',
    boxSizing:'border-box',
  },
  form: {
    background:'#0e0e12', border:'1px solid #1a1a2e', borderRadius:16,
    padding:'24px 20px', maxWidth:560, margin:'0 auto', boxSizing:'border-box',
    width:'100%',
  },
  formTitle: { fontSize:18, fontWeight:700, color:'#fff', margin:'0 0 20px' },
  formGroup: { marginBottom:16, display:'flex', flexDirection:'column', gap:6 },
  label: { fontSize:13, fontWeight:600, color:'#ccc' },
  input: {
    background:'#1a1a2e', border:'1px solid #2a2a3a', borderRadius:8,
    padding:'11px 14px', color:'#fff', fontSize:14, width:'100%', boxSizing:'border-box',
  },
  ratingSelect: { display:'flex', gap:6, flexWrap:'wrap' },
  ratingOption: {
    fontSize:26, background:'transparent', border:'1px solid #2a2a3a',
    borderRadius:8, padding:'6px 10px', cursor:'pointer',
  },
  textarea: {
    background:'#1a1a2e', border:'1px solid #2a2a3a', borderRadius:8,
    padding:'11px 14px', color:'#fff', fontSize:14, resize:'vertical',
    width:'100%', boxSizing:'border-box', fontFamily:'inherit',
  },
  charCount: { fontSize:12, color:'#666' },
  formButtons: { display:'flex', gap:10, marginTop:20, flexWrap:'wrap' },
  submitBtn: {
    flex:1, minWidth:120, background:'#7c5cfc', border:'none', color:'#fff',
    padding:'12px 16px', fontSize:14, fontWeight:700, borderRadius:8, cursor:'pointer',
  },
  cancelBtn: {
    flex:1, minWidth:100, background:'transparent', border:'1px solid #2a2a3a',
    color:'#888', padding:'12px 16px', fontSize:14, fontWeight:700,
    borderRadius:8, cursor:'pointer',
  },
  loginPrompt: {
    background:'rgba(124,92,252,0.1)', border:'1px solid rgba(124,92,252,0.3)',
    borderRadius:12, padding:20, textAlign:'center', marginBottom:40,
    boxSizing:'border-box',
  },
  loginText: { fontSize:15, color:'#7c5cfc', margin:0 },
  reviewCard: {
    background:'#0e0e12', border:'1px solid #1a1a2e',
    borderRadius:12, padding:20, boxSizing:'border-box',
  },
  reviewHeader: {
    display:'flex', justifyContent:'space-between',
    alignItems:'flex-start', marginBottom:12, gap:8,
  },
  reviewName: {
    fontSize:15, fontWeight:700, color:'#fff', margin:0,
    display:'flex', alignItems:'center', gap:6,
  },
  verified: { color:'#00d4ff', fontSize:13, flexShrink:0 },
  reviewDate: { fontSize:12, color:'#666', margin:'4px 0 0' },
  stars: { fontSize:13, letterSpacing:1, flexShrink:0 },
  reviewMessage: { fontSize:14, color:'#bbb', lineHeight:1.6, margin:0 },
  noReviews: { textAlign:'center', padding:40, color:'#666', gridColumn:'1/-1' },
  loadingMessage: { textAlign:'center', color:'#666', padding:40 },
  loadMoreBtn: {
    background:'transparent', border:'2px solid #7c5cfc', color:'#7c5cfc',
    padding:'11px 28px', borderRadius:12, fontSize:14, fontWeight:700,
    cursor:'pointer',
  },
};