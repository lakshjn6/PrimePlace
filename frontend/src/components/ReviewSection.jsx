import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../api/client';

export default function ReviewSection({ onStatsUpdate }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
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
      const response = await API.get('/reviews/');
      const data = response.data;
      const list = Array.isArray(data) ? data : (data.results || []);
      setReviews(list);
      if (onStatsUpdate && list.length > 0) {
        const sum = list.reduce((acc, r) => acc + (r.rating || 5), 0);
        const avg = (sum / list.length).toFixed(1);
        onStatsUpdate({ avg, count: list.length });
      }
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
    if (!user) {
      toast.error('Please login to post a review');
      return;
    }
    const trimmed = formData.message.trim();
    if (!trimmed) {
      toast.error('Please write a review');
      return;
    }
    if (trimmed.length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }
    setSubmitting(true);
    try {
      await API.post('/reviews/', { message: trimmed, rating: formData.rating || 5 });
      await loadReviews();
      setFormData({ rating: 5, message: '' });
      toast.success('Review posted successfully!');
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please login to post a review');
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else if (error.response?.data?.message) {
        toast.error(Array.isArray(error.response.data.message) ? error.response.data.message[0] : error.response.data.message);
      } else {
        toast.error('Failed to post review');
      }
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

  const homeReviews = reviews.slice(0, 6);

  const ReviewCard = ({ review }) => (
    <div style={s.reviewCard} className="pm-review-card">
      <div style={s.reviewHeader}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={s.reviewName} className="pm-review-name">
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {review.user_name}
            </span>
            <span style={s.verified}>✓</span>
          </h4>
          <p style={s.reviewDate}>{review.created_at}</p>
        </div>
        {renderStars(review.rating)}
      </div>
      <p style={s.reviewMessage} className="pm-review-msg">{review.message}</p>
    </div>
  );

  if (loading) return (
    <section id="reviews" style={s.section}>
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

        /* ── Reviews grid — 2 per line on desktop & mobile ── */
        .rv-grid {
          display:grid;
          grid-template-columns: repeat(2, 1fr);
          gap:16px;
        }

        .rv-modal-grid {
          display:grid;
          grid-template-columns: repeat(2, 1fr);
          gap:14px;
        }

        .pm-review-card {
          height: 140px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          overflow: hidden;
        }

        .pm-review-msg {
          font-size: 13.5px;
          color: #bbb;
          line-height: 1.5;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-word;
        }

        /* ── Mobile ── */
        @media (max-width: 600px) {
          .modal-box {
            width: 95vw !important;
            height: 85vh !important;
            border-radius: 14px !important;
          }
          .modal-title { font-size:16px !important; }
          .rv-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .rv-modal-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .pm-review-card {
            height: 130px !important;
            padding: 12px !important;
          }
          .pm-review-name {
            font-size: 13px !important;
          }
          .pm-review-msg {
            font-size: 12px !important;
            line-height: 1.4 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 3 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
        }
      `}</style>

      <section id="reviews" style={s.section}>
        <div style={s.container}>
          <div style={s.header}>
            <h2 style={s.title}>Customer Reviews</h2>
            <p style={s.subtitle}>What our customers are saying about PrimeMarket</p>
          </div>

          {/* 6 Reviews on Home Screen (2 per line, fixed card height & 3-line text clamp) */}
          <div className="rv-grid">
            {homeReviews.length > 0 ? (
              homeReviews.map(review => <ReviewCard key={review.id} review={review} />)
            ) : (
              <div style={s.noReviews}>
                <p>No reviews yet. Be the first to review! ⭐</p>
              </div>
            )}
          </div>

          {/* See All Button */}
          {reviews.length > 6 && (
            <div style={{ textAlign:'center', marginTop:24 }}>
              <button style={s.loadMoreBtn} onClick={() => setShowAllModal(true)}>
                See All {reviews.length} Reviews →
              </button>
            </div>
          )}

          {/* ── Down to all reviews: Typing box & Send button ── */}
          <div style={s.postBoxWrapper}>
            <div style={s.postBoxCard}>
              <div style={s.postBoxHeader}>
                <div style={s.ratingSelectRow}>
                  <span style={s.ratingLabel}>Your Rating:</span>
                  <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        disabled={!user}
                        onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: user ? 'pointer' : 'not-allowed',
                          fontSize: 22,
                          lineHeight: 1,
                          color: star <= formData.rating ? '#ffd60a' : '#333344',
                          padding: '0 2px',
                          transition: 'transform 0.15s, color 0.15s',
                        }}
                        title={`${star} Star${star > 1 ? 's' : ''}`}
                      >
                        ★
                      </button>
                    ))}
                    <span style={{ fontSize: 13, color: '#ffd60a', fontWeight: 700, marginLeft: 6 }}>
                      {formData.rating}.0
                    </span>
                  </div>
                </div>
              </div>

              {/* Typing box form with Send button */}
              <form onSubmit={handleSubmitReview} style={s.inputBarWrap}>
                <input
                  type="text"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={user ? "write review" : "please login to wrote review"}
                  disabled={!user || submitting}
                  style={{
                    ...s.typingInput,
                    cursor: user ? 'text' : 'not-allowed',
                    opacity: user ? 1 : 0.65,
                  }}
                />
                <button
                  type="submit"
                  disabled={!user || submitting || !formData.message.trim()}
                  style={{
                    ...s.sendButton,
                    opacity: (!user || submitting || !formData.message.trim()) ? 0.45 : 1,
                    cursor: (!user || submitting || !formData.message.trim()) ? 'not-allowed' : 'pointer',
                  }}
                  title={user ? "Post Review" : "Please login to write a review"}
                >
                  {submitting ? (
                    <span style={{ fontSize: 13 }}>Posting...</span>
                  ) : (
                    <>
                      <span style={{ fontSize: 13.5, fontWeight: 700 }}>Send</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {user && formData.message.length > 0 && formData.message.length < 10 && (
                <div style={{ fontSize: 11.5, color: '#f59e0b', marginTop: 6, marginLeft: 4 }}>
                  Minimum 10 characters required ({formData.message.length}/10)
                </div>
              )}
            </div>
          </div>
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
              <h2 className="modal-title">All Customer Reviews ({reviews.length})</h2>
              <button className="modal-close" onClick={() => setShowAllModal(false)}>✕</button>
            </div>
            <div className="modal-body rv-modal-grid">
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
    background: '#060608', padding: '48px 16px',
    borderTop: '1px solid #1a1a2e', boxSizing: 'border-box',
    scrollMarginTop: 80,
  },
  container: { maxWidth: 1100, margin: '0 auto', width: '100%' },
  header: { textAlign: 'center', marginBottom: 36 },
  title: { fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, color: '#fff', margin: 0, marginBottom: 8 },
  subtitle: { fontSize: 'clamp(13px, 3vw, 16px)', color: '#888', margin: 0 },
  reviewCard: {
    background: '#0e0e12', border: '1px solid #1a1a2e',
    borderRadius: 14, padding: '16px 18px', boxSizing: 'border-box',
    height: 140, display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  reviewHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 8, gap: 8, flexShrink: 0,
  },
  reviewName: {
    fontSize: 14.5, fontWeight: 700, color: '#fff', margin: 0,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  verified: { color: '#00d4ff', fontSize: 13, flexShrink: 0 },
  reviewDate: { fontSize: 11.5, color: '#666', margin: '2px 0 0' },
  stars: { fontSize: 13, letterSpacing: 1, flexShrink: 0 },
  reviewMessage: {
    fontSize: 13.5, color: '#bbb', lineHeight: 1.5, margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'break-word',
  },
  noReviews: { textAlign: 'center', padding: 40, color: '#666', gridColumn: '1/-1' },
  loadingMessage: { textAlign: 'center', color: '#666', padding: 40 },
  loadMoreBtn: {
    background: 'transparent', border: '2px solid #7c5cfc', color: '#7c5cfc',
    padding: '10px 24px', borderRadius: 12, fontSize: 13.5, fontWeight: 700,
    cursor: 'pointer', transition: 'all 0.2s',
  },
  postBoxWrapper: {
    marginTop: 36,
    width: '100%',
    maxWidth: 720,
    margin: '36px auto 0',
  },
  postBoxCard: {
    background: '#0e0e12',
    border: '1px solid #1e1e2e',
    borderRadius: 16,
    padding: '16px 20px',
    boxSizing: 'border-box',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
  },
  postBoxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingSelectRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#aaa',
  },
  inputBarWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#14141e',
    border: '1px solid #28283c',
    borderRadius: 12,
    padding: '6px 8px 6px 14px',
    transition: 'border-color 0.2s',
  },
  typingInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: 14,
    fontFamily: 'inherit',
    minWidth: 0,
  },
  sendButton: {
    background: '#7c5cfc',
    border: 'none',
    color: '#fff',
    borderRadius: 8,
    padding: '8px 16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontWeight: 700,
    fontSize: 13.5,
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
};