import { useState, useEffect } from 'react';
import feedbackService from '../services/feedbackService';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { trackActivity, ActivityTypes } from '../utils/activityTracker';

const Feedback = () => {
  const { colors } = useTheme();
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [myFeedback, setMyFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const categories = ['UI', 'Performance', 'Features', 'Support', 'Other'];

  useEffect(() => {
    fetchMyFeedback();
  }, []);

  const fetchMyFeedback = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getMyFeedback();
      setMyFeedback(data.feedbacks || []);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (!category) {
      setError('Please select a category');
      return;
    }
    
    if (message.trim().length < 10) {
      setError('Please provide at least 10 characters of feedback');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await feedbackService.submitFeedback({ rating, category, message });
      
      // Track feedback submission activity
      trackActivity(
        ActivityTypes.FEEDBACK_SUBMITTED,
        'Feedback Submitted',
        `${rating}⭐ - ${category} feedback`,
        { rating, category, messageLength: message.length }
      );
      
      setSuccess('Thank you for your feedback!');
      setRating(0);
      setCategory('');
      setMessage('');
      fetchMyFeedback();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count, interactive = false) => {
    return (
      <div style={styles(colors).starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => interactive && setRating(star)}
            style={{
              ...styles(colors).star,
              color: star <= count ? '#ffc107' : colors.border,
              cursor: interactive ? 'pointer' : 'default',
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return '#28a745';
      case 'pending': return '#ffc107';
      case 'reviewed': return '#17a2b8';
      default: return colors.textSecondary;
    }
  };

  const mainStyles = styles(colors);

  if (loading && myFeedback.length === 0) return <LoadingSpinner />;

  return (
    <div style={mainStyles.container}>
      <div style={mainStyles.header}>
        <h1 style={mainStyles.title}>Feedback</h1>
        <p style={mainStyles.subtitle}>Help us improve SmartVahaan</p>
      </div>

      {/* Feedback Form */}
      <div style={mainStyles.card}>
        <h2 style={mainStyles.cardTitle}>Share Your Experience</h2>
        
        {success && (
          <div style={mainStyles.successMessage}>{success}</div>
        )}
        
        {error && (
          <div style={mainStyles.errorMessage}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={mainStyles.form}>
          <div style={mainStyles.formGroup}>
            <label style={mainStyles.label}>Rating *</label>
            {renderStars(rating, true)}
          </div>

          <div style={mainStyles.formGroup}>
            <label style={mainStyles.label}>Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={mainStyles.select}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={mainStyles.formGroup}>
            <label style={mainStyles.label}>Your Feedback *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={mainStyles.textarea}
              placeholder="Tell us what you think..."
              rows={5}
              required
              minLength={10}
            />
            <span style={mainStyles.charCount}>
              {message.length} characters
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...mainStyles.submitButton,
              opacity: submitting ? 0.6 : 1
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>

      {/* Previous Feedback */}
      {myFeedback.length > 0 && (
        <div style={mainStyles.card}>
          <h2 style={mainStyles.cardTitle}>Your Previous Feedback</h2>
          <div style={mainStyles.feedbackList}>
            {myFeedback.map((fb) => (
              <div key={fb.id} style={mainStyles.feedbackItem}>
                <div style={mainStyles.feedbackHeader}>
                  <div>
                    {renderStars(fb.rating, false)}
                    <span style={mainStyles.category}>{fb.category}</span>
                  </div>
                  <span
                    style={{
                      ...mainStyles.status,
                      color: getStatusColor(fb.status)
                    }}
                  >
                    {fb.status}
                  </span>
                </div>
                <p style={mainStyles.feedbackMessage}>{fb.message}</p>
                {fb.admin_response && (
                  <div style={mainStyles.adminResponse}>
                    <strong>Admin Response:</strong> {fb.admin_response}
                  </div>
                )}
                <span style={mainStyles.date}>
                  {new Date(fb.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = (colors) => ({
  container: {
    padding: '40px 48px',
    minHeight: '100vh',
    background: colors.background,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  card: {
    background: colors.card,
    padding: 32,
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    boxShadow: `0 1px 3px ${colors.shadow}`,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  starContainer: {
    display: 'flex',
    gap: 8,
  },
  star: {
    fontSize: 32,
    transition: 'all 0.2s ease',
  },
  select: {
    padding: '12px 16px',
    fontSize: 14,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    background: colors.backgroundSecondary,
    color: colors.text,
    outline: 'none',
  },
  textarea: {
    padding: '12px 16px',
    fontSize: 14,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    background: colors.backgroundSecondary,
    color: colors.text,
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  submitButton: {
    padding: '12px 24px',
    background: colors.buttonPrimary,
    color: colors.buttonPrimaryText,
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.3s ease',
  },
  successMessage: {
    padding: 12,
    background: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorMessage: {
    padding: 12,
    background: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: 8,
    marginBottom: 16,
  },
  feedbackList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  feedbackItem: {
    padding: 16,
    background: colors.backgroundSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
  },
  feedbackHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  category: {
    marginLeft: 12,
    padding: '4px 8px',
    background: colors.border,
    color: colors.text,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  feedbackMessage: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 1.6,
  },
  adminResponse: {
    padding: 12,
    background: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    fontSize: 13,
    color: colors.text,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

// Inject mobile styles
if (typeof document !== 'undefined' && !document.querySelector('[data-feedback-styles]')) {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('data-feedback-styles', 'true');
  styleSheet.textContent = `
    @media (max-width: 768px) {
      .feedback-container {
        padding: 20px 16px !important;
      }
      .feedback-title {
        font-size: 28px !important;
      }
      .feedback-card {
        padding: 20px !important;
      }
      .star {
        font-size: 28px !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Feedback;
