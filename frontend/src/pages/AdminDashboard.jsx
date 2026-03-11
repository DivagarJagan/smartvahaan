import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import adminService from '../services/adminService';
import feedbackService from '../services/feedbackService';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  const { colors } = useTheme();
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, vehicles, feedback

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashData, usersData, vehiclesData, feedbackData] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAllUsers(0, 10),  // Get first 10 users
        adminService.getAllVehicles(0, 15),  // Get first 15 vehicles
        feedbackService.getAllFeedback(0, 10)  // Get first 10 feedback
      ]);
      setDashboard(dashData);
      setUsers(usersData.users || []);
      setVehicles(vehiclesData.vehicles || []);
      setFeedback(feedbackData.feedbacks || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color }) => (
    <div style={styles(colors).statCard}>
      <div style={{...styles(colors).statIcon, background: color}}>{icon}</div>
      <div style={styles(colors).statInfo}>
        <div style={styles(colors).statValue}>{value}</div>
        <div style={styles(colors).statTitle}>{title}</div>
        {subtitle && <div style={styles(colors).statSubtitle}>{subtitle}</div>}
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (!dashboard) return <div style={styles(colors).container}>No data available</div>;

  return (
    <div style={styles(colors).container} className="admin-container">
      <div style={styles(colors).header}>
        <h1 style={styles(colors).title} className="admin-title">Admin Dashboard</h1>
        <p style={styles(colors).subtitle}>Monitor and manage SmartVahaan</p>
      </div>

      {/* Tabs */}
      <div style={styles(colors).tabs}>
        {['overview', 'users', 'vehicles', 'feedback'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles(colors).tab,
              ...(activeTab === tab ? styles(colors).tabActive : {})
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div style={styles(colors).statsGrid}>
            <StatCard
              icon="👥"
              title="Total Users"
              value={dashboard.user_stats?.total || 0}
              subtitle={`${dashboard.user_stats?.new_this_week || 0} new this week`}
              color="#667eea"
            />
            <StatCard
              icon="🚗"
              title="Vehicles"
              value={dashboard.vehicle_stats?.total || 0}
              subtitle={`Avg: ${dashboard.vehicle_stats?.avg_per_user || 0} per user`}
              color="#f093fb"
            />
            <StatCard
              icon="⭐"
              title="Avg Rating"
              value={dashboard.feedback_stats?.average_rating || 0}
              subtitle={`${dashboard.feedback_stats?.total || 0} total feedback`}
              color="#ffc107"
            />
            <StatCard
              icon="📋"
              title="Pending Feedback"
              value={dashboard.feedback_stats?.pending || 0}
              subtitle="Needs attention"
              color="#dc3545"
            />
          </div>

          {/* Recent Activity */}
          <div style={styles(colors).activitySection}>
            <div style={styles(colors).card} className="admin-card">
              <h2 style={styles(colors).cardTitle}>Recent Users</h2>
              <div style={styles(colors).activityList}>
                {dashboard.recent_activity?.recent_users?.map((user) => (
                  <div key={user.id} style={styles(colors).activityItem}>
                    <div style={styles(colors).activityIcon}>👤</div>
                    <div style={styles(colors).activityInfo}>
                      <div style={styles(colors).activityTitle}>{user.email}</div>
                      <div style={styles(colors).activityDate}>
                        {new Date(user.created_at).toLocaleDateString()} • {user.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles(colors).card} className="admin-card">
              <h2 style={styles(colors).cardTitle}>Recent Feedback</h2>
              <div style={styles(colors).activityList}>
                {dashboard.recent_activity?.recent_feedback?.map((fb) => (
                  <div key={fb.id} style={styles(colors).activityItem}>
                    <div style={styles(colors).activityIcon}>💬</div>
                    <div style={styles(colors).activityInfo}>
                      <div style={styles(colors).activityTitle}>
                        {'⭐'.repeat(fb.rating)} • {fb.category}
                      </div>
                      <div style={styles(colors).activityDate}>
                        {new Date(fb.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div style={styles(colors).card} className="admin-card">
          <h2 style={styles(colors).cardTitle}>User Management</h2>
          <div style={styles(colors).table}>
            <div style={styles(colors).tableHeader}>
              <div style={styles(colors).tableCell}>Email</div>
              <div style={styles(colors).tableCell}>Name</div>
              <div style={styles(colors).tableCell}>Role</div>
              <div style={styles(colors).tableCell}>Joined</div>
              <div style={styles(colors).tableCell}>Feedback</div>
            </div>
            {users.map((user) => (
              <div key={user.id} style={styles(colors).tableRow}>
                <div style={styles(colors).tableCell}>{user.email}</div>
                <div style={styles(colors).tableCell}>
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : '-'}
                </div>
                <div style={styles(colors).tableCell}>
                  <span style={{
                    ...styles(colors).badge,
                    background: user.role === 'admin' ? '#3b82f6' : '#64748b'
                  }}>
                    {user.role}
                  </span>
                </div>
                <div style={styles(colors).tableCell}>
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
                <div style={styles(colors).tableCell}>{user.feedback_count || 0}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicles Tab */}
      {activeTab === 'vehicles' && (
        <div style={styles(colors).card} className="admin-card">
          <h2 style={styles(colors).cardTitle}>Vehicle Management</h2>
          <div style={styles(colors).vehicleGrid}>
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} style={styles(colors).vehicleCard}>
                <div style={styles(colors).vehicleHeader}>
                  <div style={styles(colors).vehicleMake}>
                    {vehicle.make} {vehicle.model}
                  </div>
                  <div style={styles(colors).vehicleYear}>{vehicle.year}</div>
                </div>
                <div style={styles(colors).vehicleDetails}>
                  <div style={styles(colors).vehicleDetailRow}>
                    <span style={styles(colors).vehicleLabel}>Owner:</span>
                    <span style={styles(colors).vehicleValue}>{vehicle.owner_name}</span>
                  </div>
                  <div style={styles(colors).vehicleDetailRow}>
                    <span style={styles(colors).vehicleLabel}>Registration:</span>
                    <span style={styles(colors).vehicleValue}>{vehicle.registration_number}</span>
                  </div>
                  <div style={styles(colors).vehicleDetailRow}>
                    <span style={styles(colors).vehicleLabel}>Odometer:</span>
                    <span style={styles(colors).vehicleValue}>{vehicle.odometer.toLocaleString()} km</span>
                  </div>
                  <div style={styles(colors).vehicleDetailRow}>
                    <span style={styles(colors).vehicleLabel}>City:</span>
                    <span style={styles(colors).vehicleValue}>{vehicle.city}</span>
                  </div>
                  <div style={styles(colors).vehicleDetailRow}>
                    <span style={styles(colors).vehicleLabel}>Last Service:</span>
                    <span style={styles(colors).vehicleValue}>
                      {new Date(vehicle.last_service).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div style={styles(colors).card} className="admin-card">
          <h2 style={styles(colors).cardTitle}>Feedback Management</h2>
          {feedback.length === 0 ? (
            <div style={styles(colors).emptyState}>
              <div style={styles(colors).emptyIcon}>💬</div>
              <p style={styles(colors).emptyText}>No feedback submitted yet</p>
            </div>
          ) : (
            <div style={styles(colors).feedbackList}>
              {feedback.map((fb) => (
                <div key={fb.id} style={styles(colors).feedbackCard}>
                  <div style={styles(colors).feedbackHeader}>
                    <div>
                      <div style={styles(colors).feedbackRating}>
                        {'⭐'.repeat(fb.rating)}
                      </div>
                      <div style={styles(colors).feedbackUserInfo}>
                        <strong>{fb.user_name}</strong> • {fb.user_email}
                      </div>
                      {fb.vehicle_info && (
                        <div style={styles(colors).feedbackVehicle}>
                          🚗 {fb.vehicle_info}
                        </div>
                      )}
                    </div>
                    <span style={{
                      ...styles(colors).badge,
                      background: fb.status === 'pending' ? '#ffc107' : fb.status === 'resolved' ? '#28a745' : '#17a2b8'
                    }}>
                      {fb.status}
                    </span>
                  </div>
                  <div style={styles(colors).feedbackCategory}>
                    <span style={styles(colors).categoryBadge}>{fb.category}</span>
                  </div>
                  <div style={styles(colors).feedbackMessage}>{fb.message}</div>
                  <div style={styles(colors).feedbackDate}>
                    {new Date(fb.created_at).toLocaleDateString()} at {new Date(fb.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
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
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    borderBottom: `1px solid ${colors.border}`,
  },
  tab: {
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  tabActive: {
    color: colors.brand,
    borderBottomColor: colors.brand,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 20,
    marginBottom: 32,
  },
  statCard: {
    background: colors.card,
    padding: 24,
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    boxShadow: `0 1px 3px ${colors.shadow}`,
    display: 'flex',
    gap: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    color: '#fff',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activitySection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 20,
  },
  card: {
    background: colors.card,
    padding: 24,
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    boxShadow: `0 1px 3px ${colors.shadow}`,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    margin: 0,
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  activityItem: {
    display: 'flex',
    gap: 12,
    padding: 12,
    background: colors.backgroundSecondary,
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    background: colors.brand,
    color: colors.brandInverse,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.5fr',
    gap: 16,
    padding: 12,
    background: colors.backgroundSecondary,
    borderRadius: 8,
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 13,
    color: colors.text,
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.5fr',
    gap: 16,
    padding: 12,
    borderBottom: `1px solid ${colors.border}`,
    fontSize: 14,
    color: colors.text,
  },
  tableCell: {
    display: 'flex',
    alignItems: 'center',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  feedbackList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  feedbackCard: {
    padding: 20,
    background: colors.backgroundSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    transition: 'all 0.3s ease',
  },
  feedbackHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  feedbackRating: {
    fontSize: 18,
    marginBottom: 8,
  },
  feedbackUserInfo: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  feedbackVehicle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  feedbackCategory: {
    marginBottom: 12,
  },
  categoryBadge: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand,
    background: colors.isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.1)',
    padding: '4px 12px',
    borderRadius: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  feedbackMessage: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 1.6,
    fontStyle: 'italic',
  },
  feedbackDate: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  vehicleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 20,
  },
  vehicleCard: {
    padding: 20,
    background: colors.backgroundSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  vehicleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: `2px solid ${colors.brand}`,
  },
  vehicleMake: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  vehicleYear: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brand,
    padding: '4px 12px',
    background: colors.background,
    borderRadius: 8,
  },
  vehicleDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  vehicleDetailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 14,
  },
  vehicleLabel: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  vehicleValue: {
    color: colors.text,
    fontWeight: '600',
  },
});

// Inject mobile styles
if (typeof document !== 'undefined' && !document.querySelector('[data-admin-styles]')) {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('data-admin-styles', 'true');
  styleSheet.textContent = `
    @media (max-width: 768px) {
      .admin-container {
        padding: 20px 16px !important;
      }
      .admin-title {
        font-size: 28px !important;
      }
      .admin-card {
        padding: 16px !important;
      }
      .stats-grid {
        grid-template-columns: 1fr !important;
      }
      .activity-section {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default AdminDashboard;