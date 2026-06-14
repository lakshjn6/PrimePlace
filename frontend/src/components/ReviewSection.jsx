import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../api/client';

export default function ReviewSection() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    rating: 5,
    message: '',
  });

  // Load reviews on mount
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      // ✅ NEW ENDPOINT: /api/reviews/ (from isolated app)
      const response = await API.get('/reviews/latest/');
      setReviews(response.data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // Check if logged in
    if (!user) {
      toast.error('Please login to post a review');
      setShowForm(false);
      return;
    }

    // Validate
    if (!formData.message.trim()) {
      toast.error('Please write a review');
      return;
    }

    if (formData.message.length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    setSubmitting(true);

    try {
      // ✅ NEW ENDPOINT: /api/reviews/ (from isolated app)
      await API.post('/reviews/', {
        message: formData.message,
        rating: formData.rating,
      });

      // Reload reviews
      await loadReviews();

      // Reset form
      setFormData({
        rating: 5,
        message: '',
      });

      setShowForm(false);
      toast.success('Review posted successfully!');
    } catch (error) {
      console.error('Error posting review:', error);
      
      if (error.response?.status === 401) {
        toast.error('Please login to post a review');
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to post review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div style={s.stars}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: i < rating ? '#ffd60a' : '#333' }}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section style={s.section}>
        <div style={s.container}>
          <h2 style={s.title}>Customer Reviews</h2>
          <div style={s.loadingMessage}>Loading reviews...</div>
        </div>
      </section>
    );
  }

  return (
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
              <button
                style={s.addReviewBtn}
                onClick={() => setShowForm(true)}
              >
                ✍️ Write a Review
              </button>
            ) : (
              <form style={s.form} onSubmit={handleSubmitReview}>
                <h3 style={s.formTitle}>Share Your Experience</h3>

                {/* Name (Read-only) */}
                <div style={s.formGroup}>
                  <label style={s.label}>Your Name</label>
                  <input
                    type="text"
                    value={user.first_name || user.username}
                    disabled
                    style={{ ...s.input, opacity: 0.6 }}
                  />
                </div>

                {/* Rating */}
                <div style={s.formGroup}>
                  <label style={s.label}>Rating</label>
                  <div style={s.ratingSelect}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        style={{
                          ...s.ratingOption,
                          background: formData.rating >= star ? '#ffd60a' : 'transparent',
                          color: formData.rating >= star ? '#000' : '#666',
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div style={s.formGroup}>
                  <label style={s.label}>Your Review</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Share your experience (minimum 10 characters)..."
                    style={s.textarea}
                    rows="4"
                  />
                  <small style={s.charCount}>
                    {formData.message.length} characters (minimum 10)
                  </small>
                </div>

                {/* Buttons */}
                <div style={s.formButtons}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={s.submitBtn}
                  >
                    {submitting ? 'Posting...' : '✓ Post Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    disabled={submitting}
                    style={s.cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div style={s.loginPrompt}>
            <p style={s.loginText}>
              👤 Please <strong>login</strong> to post a review
            </p>
          </div>
        )}

        {/* Reviews List */}
        <div style={s.reviewsList}>
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} style={s.reviewCard}>
                <div style={s.reviewHeader}>
                  <div>
                    <h4 style={s.reviewName}>
                      {review.user_name}
                      <span style={s.verified}>✓</span>
                    </h4>
                    <p style={s.reviewDate}>{review.created_at}</p>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <p style={s.reviewMessage}>{review.message}</p>
              </div>
            ))
          ) : (
            <div style={s.noReviews}>
              <p>No reviews yet. Be the first to review! ⭐</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const s = {
  section: {
    background: '#060608',
    padding: '60px 24px',
    borderTop: '1px solid #1a1a2e',
  },
  container: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 900,
    color: '#fff',
    margin: 0,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    margin: 0,
  },
  formWrapper: {
    marginBottom: 48,
  },
  addReviewBtn: {
    width: '100%',
    maxWidth: 400,
    display: 'block',
    margin: '0 auto 32px',
    background: '#7c5cfc',
    border: 'none',
    color: '#fff',
    padding: '14px 24px',
    fontSize: 16,
    fontWeight: 700,
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  form: {
    background: '#0e0e12',
    border: '1px solid #1a1a2e',
    borderRadius: 16,
    padding: 32,
    maxWidth: 600,
    margin: '0 auto',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 24px',
  },
  formGroup: {
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: '#ccc',
  },
  input: {
    background: '#1a1a2e',
    border: '1px solid #2a2a3a',
    borderRadius: 8,
    padding: '12px 16px',
    color: '#fff',
    fontSize: 14,
    fontFamily: 'inherit',
    cursor: 'not-allowed',
  },
  ratingSelect: {
    display: 'flex',
    gap: 8,
  },
  ratingOption: {
    fontSize: 28,
    background: 'transparent',
    border: '1px solid #2a2a3a',
    borderRadius: 8,
    padding: '8px 12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  textarea: {
    background: '#1a1a2e',
    border: '1px solid #2a2a3a',
    borderRadius: 8,
    padding: '12px 16px',
    color: '#fff',
    fontSize: 14,
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
  },
  formButtons: {
    display: 'flex',
    gap: 12,
    marginTop: 24,
  },
  submitBtn: {
    flex: 1,
    background: '#7c5cfc',
    border: 'none',
    color: '#fff',
    padding: '12px 20px',
    fontSize: 14,
    fontWeight: 700,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  cancelBtn: {
    flex: 1,
    background: 'transparent',
    border: '1px solid #2a2a3a',
    color: '#888',
    padding: '12px 20px',
    fontSize: 14,
    fontWeight: 700,
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  loginPrompt: {
    background: 'rgba(124, 92, 252, 0.1)',
    border: '1px solid rgba(124, 92, 252, 0.3)',
    borderRadius: 12,
    padding: 24,
    textAlign: 'center',
    marginBottom: 48,
  },
  loginText: {
    fontSize: 16,
    color: '#7c5cfc',
    margin: 0,
  },
  reviewsList: {
    display: 'grid',
    gap: 16,
  },
  reviewCard: {
    background: '#0e0e12',
    border: '1px solid #1a1a2e',
    borderRadius: 12,
    padding: 24,
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  reviewName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  verified: {
    color: '#00d4ff',
    fontSize: 14,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    margin: '4px 0 0',
  },
  stars: {
    fontSize: 14,
    letterSpacing: 2,
  },
  reviewMessage: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 1.6,
    margin: 0,
  },
  noReviews: {
    textAlign: 'center',
    padding: 40,
    color: '#666',
  },
  loadingMessage: {
    textAlign: 'center',
    color: '#666',
    padding: 40,
  },
};