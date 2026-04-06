import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import vehicleService from "../services/vehicleService";
import serviceHistoryService from "../services/serviceHistoryService";
import AiAssistant from "./AiAssistant";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [checksCount, setChecksCount] = useState(0);
  const [aiOpen, setAiOpen] = useState(false);

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/home", icon: "🏠", label: "Home", color: colors.brand },
    ...(user.role === "user" ? [
      { path: "/vehicle", icon: "🚗", label: "My Vehicle", color: colors.brand },
      { path: "/maintenance", icon: "🔧", label: "Maintenance", color: colors.brand },
      { path: "/feedback", icon: "💬", label: "Feedback", color: colors.brand },
      { path: "/premium-features", icon: "⭐", label: "Premium", color: "#FFD700" },
    ] : []),
    ...(user.role === "admin" ? [
      { path: "/admin", icon: "📊", label: "Dashboard", color: colors.brand },
      { path: "/admin?tab=users", icon: "👥", label: "User Management", color: colors.brand },
      { path: "/admin?tab=vehicles", icon: "🚗", label: "Vehicle Management", color: colors.brand },
    ] : []),
  ];

  // Fetch vehicle and service history stats
  useEffect(() => {
    const fetchStats = async () => {
      if (user && user.role === "user") {
        try {
          // Fetch vehicles
          const vehicles = await vehicleService.getVehicles();
          setVehicleCount(vehicles.length);

          // Fetch service history (checks done)
          const serviceHistory = await serviceHistoryService.getServiceHistory();
          setChecksCount(serviceHistory.length);
        } catch (error) {
          console.error('Error fetching stats:', error);
        }
      }
    };

    fetchStats();
  }, [user]);

  const styles = getStyles(colors, collapsed);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          style={styles.overlay} 
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside style={{
        ...styles.sidebar,
        transform: mobileOpen ? 'translateX(0)' : undefined,
      }}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logoContainer}>
            <div style={styles.logoImageWrapper}>
              <img 
                src="/smartvahaan-logo.jpeg" 
                alt="SmartVahaan" 
                style={styles.logoImage}
              />
            </div>
            {!collapsed && (
              <div style={styles.logoText}>
                <div style={styles.logoTitle}>SmartVahaan</div>
              </div>
            )}
          </div>
          {/* Desktop collapse button */}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            style={{...styles.collapseButton, display: undefined}}
            className="collapseButton"
          >
            {collapsed ? '→' : '←'}
          </button>
          {/* Mobile close button */}
          <button 
            onClick={() => setMobileOpen(false)}
            style={styles.mobileCloseButton}
            className="mobileCloseButton"
          >
            ✕
          </button>
        </div>

        {/* User Info Card */}
        {!collapsed && (
          <div style={styles.userCard}>
            <div style={styles.userAvatar}>
              {user.first_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`.length > 20
                    ? `${user.first_name} ${user.last_name}`.substring(0, 20) + '...'
                    : `${user.first_name} ${user.last_name}`
                  : user.email?.split('@')[0] || 'User'}
              </div>
              <div style={styles.userRole}>
                {user.role === 'admin' ? 'Admin' : 'Vehicle Owner'}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav style={styles.menu}>
          <div style={styles.menuLabel}>
            {!collapsed && 'NAVIGATION'}
          </div>
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              style={{
                ...styles.menuItem,
                ...(isActive(item.path) ? styles.menuItemActive : {}),
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <span style={styles.menuIcon}>{item.icon}</span>
              {!collapsed && <span style={styles.menuItemLabel}>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Quick Stats */}
        {!collapsed && user.role === "user" && (
          <div style={styles.statsSection}>
            <div style={styles.statCard}>
              <div style={styles.statInfo}>
                <div style={styles.statValue}>{vehicleCount}</div>
                <div style={styles.statLabel}>Vehicles</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>✅</div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>{checksCount}</div>
              <div style={styles.statLabel}>Checks Done</div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      {!collapsed && (
        <div style={styles.helpSection}>
          <div style={styles.helpIcon}>💡</div>
          <div style={styles.helpTitle}>Need Help?</div>
          <div style={styles.helpText}>
            If you have any queries, please drop them in the feedback section.
          </div>
          <div style={styles.adminEmail}>
            📧 admin@smartvahaan.com
          </div>
        </div>
      )}
    </aside>
    {user && <AiAssistant isOpen={aiOpen} onClose={() => setAiOpen(false)} />}
    </>
  );
};

const getStyles = (colors, collapsed) => ({
  sidebar: {
    height: '100vh',
    background: colors.card,
    color: colors.text,
    padding: '25px 15px',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    boxShadow: `4px 0 20px ${colors.shadow}`,
    transition: 'all 0.3s ease',
    zIndex: 1000,
    overflowY: 'auto',
    overflowX: 'hidden',
    width: collapsed ? 80 : 250,
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 999,
    backdropFilter: 'blur(2px)',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
    borderBottom: `1px solid ${colors.border}`,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoImageWrapper: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid rgba(255, 215, 0, 0.8)',
    flexShrink: 0,
    position: 'relative',
    isolation: 'isolate',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
  },
  logoImage: {
    width: '110%',
    height: '110%',
    objectFit: 'cover',
    display: 'block',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    position: 'relative',
    left: '-5%',
    top: '-5%',
  },
  logo: {
    fontSize: 28,
    background: colors.brand,
    color: colors.brandInverse,
    width: 50,
    height: 50,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    boxShadow: `0 4px 15px ${colors.shadow}`,
  },
  logoText: {
    lineHeight: 1.3,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  collapseButton: {
    background: colors.backgroundSecondary,
    border: `1px solid ${colors.border}`,
    color: colors.text,
    width: 30,
    height: 30,
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    background: colors.backgroundSecondary,
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
  },
  userAvatar: {
    width: 45,
    height: 45,
    borderRadius: '50%',
    background: colors.brand,
    color: colors.brandInverse,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    boxShadow: `0 4px 15px ${colors.shadow}`,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  menu: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },
  menuLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 8,
    paddingLeft: 8,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: 10,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    borderLeft: `4px solid transparent`,
  },
  menuItemActive: {
    color: colors.text,
    background: colors.backgroundSecondary,
    borderLeft: `4px solid ${colors.brand}`,
    fontWeight: '600',
  },
  menuIcon: {
    fontSize: 20,
  },
  statsSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    paddingTop: 15,
    borderTop: `1px solid ${colors.border}`,
  },
  statCard: {
    background: colors.backgroundSecondary,
    padding: 12,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    border: `1px solid ${colors.border}`,
  },
  statIcon: {
    fontSize: 24,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  helpSection: {
    background: colors.backgroundSecondary,
    padding: 20,
    borderRadius: 12,
    textAlign: 'center',
    border: `1px solid ${colors.border}`,
  },
  helpIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 1.4,
    marginBottom: 15,
  },
  helpButton: {
    width: '100%',
    padding: '10px',
    background: colors.buttonPrimary,
    border: 'none',
    borderRadius: 8,
    color: colors.buttonPrimaryText,
    fontSize: 12,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  adminEmail: {
    marginTop: 10,
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  mobileCloseButton: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'inherit',
    width: 32,
    height: 32,
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: 16,
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    flexShrink: 0,
  },
});

// Inject hover and mobile styles
if (typeof document !== 'undefined' && !document.querySelector('[data-sidebar-styles]')) {
  const styleSheet = document.createElement("style");
  styleSheet.setAttribute('data-sidebar-styles', 'true');
  styleSheet.textContent = `
    .menuItem:hover {
      opacity: 0.8;
      transform: translateX(5px);
    }
    .collapseButton:hover {
      opacity: 0.8;
    }
    .helpButton:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }
    aside::-webkit-scrollbar {
      width: 6px;
    }
    aside::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 10px;
    }
    aside::-webkit-scrollbar-thumb {
      background: rgba(128,128,128,0.3);
      border-radius: 10px;
    }
    aside::-webkit-scrollbar-thumb:hover {
      background: rgba(128,128,128,0.5);
    }

    @media (max-width: 768px) {
      aside {
        transform: translateX(-100%);
        width: 280px !important;
        box-shadow: 4px 0 30px rgba(0,0,0,0.3) !important;
        z-index: 1001 !important;
      }
      aside[style*="translateX(0)"] {
        transform: translateX(0) !important;
      }
      .collapseButton {
        display: none !important;
      }
      .mobileCloseButton {
        display: flex !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Sidebar;