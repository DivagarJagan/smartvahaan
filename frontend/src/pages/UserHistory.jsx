import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';

const UserHistory = () => {
  const { colors } = useTheme();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalLogins: 0,
    totalVehiclesAdded: 0,
    totalAnalysisRequests: 0,
    totalFeedbackSubmitted: 0,
    memberSince: null,
    lastLoginDate: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserHistory();
  }, []);

  const loadUserHistory = () => {
    try {
      // Get user activity from localStorage
      const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
      const activityLog = JSON.parse(localStorage.getItem('userActivityLog') || '[]');
      
      // Get user stats
      const loginCount = parseInt(localStorage.getItem('loginCount') || '0');
      const vehicleCount = parseInt(localStorage.getItem('vehicleCount') || '0');
      const analysisCount = parseInt(localStorage.getItem('analysisCount') || '0');
      const feedbackCount = parseInt(localStorage.getItem('feedbackCount') || '0');
      const memberSince = localStorage.getItem('memberSince') || new Date().toISOString();
      const lastLogin = localStorage.getItem('lastLoginDate') || new Date().toISOString();
      
      setStats({
        totalLogins: loginCount,
        totalVehiclesAdded: vehicleCount,
        totalAnalysisRequests: analysisCount,
        totalFeedbackSubmitted: feedbackCount,
        memberSince: new Date(memberSince),
        lastLoginDate: new Date(lastLogin),
      });
      
      setHistory(activityLog);
      setLoading(false);
    } catch (error) {
      console.error('Error loading user history:', error);
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return '🔐';
      case 'vehicle_added': return '🚗';
      case 'analysis_requested': return '🔍';
      case 'feedback_submitted': return '💬';
      case 'profile_updated': return '👤';
      default: return '📝';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'login': return colors.brand;
      case 'vehicle_added': return colors.success;
      case 'analysis_requested': return colors.info;
      case 'feedback_submitted': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysSince = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffTime = Math.abs(now - then);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const styles = getStyles(colors);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>📊 My Activity History</h1>
            <p style={styles.subtitle}>Track your SmartVahaan journey and usage patterns</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🔐</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.totalLogins}</div>
              <div style={styles.statLabel}>Total Logins</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>🚗</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.totalVehiclesAdded}</div>
              <div style={styles.statLabel}>Vehicles Added</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>🔍</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.totalAnalysisRequests}</div>
              <div style={styles.statLabel}>Analysis Requests</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>💬</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{stats.totalFeedbackSubmitted}</div>
              <div style={styles.statLabel}>Feedback Submitted</div>
            </div>
          </div>
        </div>

        {/* Member Info */}
        <div style={styles.memberCard}>
          <div style={styles.memberInfo}>
            <div style={styles.memberItem}>
              <span style={styles.memberLabel}>👤 Member Since:</span>
              <span style={styles.memberValue}>
                {stats.memberSince && formatDate(stats.memberSince)}
                {stats.memberSince && ` (${getDaysSince(stats.memberSince)} days ago)`}
              </span>
            </div>
            <div style={styles.memberItem}>
              <span style={styles.memberLabel}>🕐 Last Login:</span>
              <span style={styles.memberValue}>
                {stats.lastLoginDate && formatDate(stats.lastLoginDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div style={styles.timelineSection}>
          <h2 style={styles.sectionTitle}>Recent Activity</h2>
          
          {history.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <h3 style={styles.emptyTitle}>No Activity Yet</h3>
              <p style={styles.emptyText}>
                Start using SmartVahaan to track your vehicle maintenance journey!
                Your activities will appear here.
              </p>
            </div>
          ) : (
            <div style={styles.timeline}>
              {history.map((activity, index) => (
                <div key={index} style={styles.timelineItem}>
                  <div 
                    style={{
                      ...styles.timelineDot,
                      backgroundColor: getActivityColor(activity.type)
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div style={styles.timelineContent}>
                    <div style={styles.activityHeader}>
                      <h3 style={styles.activityTitle}>{activity.title}</h3>
                      <span style={styles.activityTime}>{formatDate(activity.timestamp)}</span>
                    </div>
                    {activity.description && (
                      <p style={styles.activityDescription}>{activity.description}</p>
                    )}
                    {activity.details && (
                      <div style={styles.activityDetails}>
                        {Object.entries(activity.details).map(([key, value]) => (
                          <span key={key} style={styles.activityDetail}>
                            <strong>{key}:</strong> {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div style={styles.tipsCard}>
          <h3 style={styles.tipsTitle}>💡 Usage Tips</h3>
          <ul style={styles.tipsList}>
            <li style={styles.tipItem}>
              Regular vehicle analysis helps prevent costly repairs by catching issues early
            </li>
            <li style={styles.tipItem}>
              Your feedback helps us improve the app for all Indian vehicle owners
            </li>
            <li style={styles.tipItem}>
              Keep your vehicle details updated for more accurate maintenance predictions
            </li>
            <li style={styles.tipItem}>
              Check back regularly to track your vehicle's health over time
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const getStyles = (colors) => ({
  container: {
    minHeight: '100vh',
    backgroundColor: colors.background,
    padding: '40px 20px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  wrapper: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  header: {
    marginBottom: 40,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    color: colors.text,
    margin: 0,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 20,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    boxShadow: `0 2px 8px ${colors.shadow}`,
  },
  statIcon: {
    fontSize: 40,
    lineHeight: 1,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 700,
    color: colors.text,
    lineHeight: 1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  memberCard: {
    backgroundColor: colors.card,
    padding: 28,
    borderRadius: 8,
    border: `2px solid ${colors.brand}`,
    marginBottom: 32,
    boxShadow: `0 2px 8px ${colors.shadow}`,
  },
  memberInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 24,
  },
  memberItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  memberLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  memberValue: {
    fontSize: 16,
    fontWeight: 500,
    color: colors.text,
  },
  timelineSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 24,
    marginTop: 0,
  },
  timeline: {
    position: 'relative',
    paddingLeft: 40,
  },
  timelineItem: {
    position: 'relative',
    paddingBottom: 32,
    display: 'flex',
    gap: 20,
  },
  timelineDot: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    flexShrink: 0,
    border: `3px solid ${colors.background}`,
    boxShadow: `0 2px 8px ${colors.shadow}`,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    boxShadow: `0 2px 6px ${colors.shadow}`,
  },
  activityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 16,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
    margin: 0,
  },
  activityTime: {
    fontSize: 13,
    color: colors.textSecondary,
    whiteSpace: 'nowrap',
  },
  activityDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 1.6,
    margin: 0,
    marginBottom: 12,
  },
  activityDetails: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTop: `1px solid ${colors.border}`,
  },
  activityDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    backgroundColor: colors.backgroundSecondary,
    padding: '6px 12px',
    borderRadius: 4,
  },
  emptyState: {
    textAlign: 'center',
    padding: 60,
    backgroundColor: colors.card,
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 1.6,
    maxWidth: 500,
    margin: '0 auto',
  },
  tipsCard: {
    backgroundColor: colors.card,
    padding: 28,
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    boxShadow: `0 2px 8px ${colors.shadow}`,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: colors.text,
    marginTop: 0,
    marginBottom: 16,
  },
  tipsList: {
    margin: 0,
    padding: 0,
    paddingLeft: 20,
  },
  tipItem: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 1.8,
    marginBottom: 12,
  },
});

export default UserHistory;
