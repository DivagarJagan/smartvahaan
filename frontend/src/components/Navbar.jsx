import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{ ...styles.nav, background: colors.backgroundSecondary, borderBottomColor: colors.border }}>
      <div style={styles.leftSection}>
        <div style={styles.brandContainer} onClick={() => navigate("/home")}>
          <div style={styles.logoWrapper}>
            <img 
              src="/smartvahaan-logo.jpeg" 
              alt="SmartVahaan" 
              style={styles.logoImage}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{ ...styles.logoFallback, display: 'none', background: colors.primary }}>SV</div>
          </div>
          <div style={{ ...styles.brandTitle, color: colors.text }}>SmartVahaan</div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button 
        style={{ ...styles.mobileMenuButton, color: colors.text }}
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        ☰
      </button>

      {/* Desktop Navigation */}
      <div style={{ ...styles.centerSection, display: showMobileMenu ? 'flex' : undefined }}>
        <button 
          onClick={() => navigate("/home")} 
          style={{
            ...styles.navButton,
            color: isActive('/home') ? colors.text : colors.textSecondary,
            background: isActive('/home') ? colors.cardHover : 'transparent',
          }}
        >
          Home
        </button>
        
        {user.role === "user" && (
          <>
            <button 
              onClick={() => navigate("/vehicle")} 
              style={{
                ...styles.navButton,
                color: isActive('/vehicle') ? colors.text : colors.textSecondary,
                background: isActive('/vehicle') ? colors.cardHover : 'transparent',
              }}
            >
              My Vehicle
            </button>
            
            <button 
              onClick={() => navigate("/maintenance")} 
              style={{
                ...styles.navButton,
                color: isActive('/maintenance') ? colors.text : colors.textSecondary,
                background: isActive('/maintenance') ? colors.cardHover : 'transparent',
              }}
            >
              Maintenance
            </button>

            <button 
              onClick={() => navigate("/feedback")} 
              style={{
                ...styles.navButton,
                color: isActive('/feedback') ? colors.text : colors.textSecondary,
                background: isActive('/feedback') ? colors.cardHover : 'transparent',
              }}
            >
              Feedback
            </button>

            <button 
              onClick={() => navigate("/history")} 
              style={{
                ...styles.navButton,
                color: isActive('/history') ? colors.text : colors.textSecondary,
                background: isActive('/history') ? colors.cardHover : 'transparent',
              }}
            >
              My History
            </button>

            <button 
              onClick={() => { navigate("/premium-features"); setShowMobileMenu(false); }} 
              style={{
                ...styles.navButton,
                ...styles.premiumNavButton,
                color: isActive('/premium-features') ? '#FFD700' : '#FFA000',
                background: isActive('/premium-features') ? 'rgba(255,215,0,0.15)' : 'transparent',
                border: '1px solid rgba(255,215,0,0.4)',
              }}
            >
              ⭐ Premium
            </button>
          </>
        )}
        
        {user.role === "admin" && (
          <button 
            onClick={() => navigate("/admin")} 
            style={{
              ...styles.navButton,
              color: isActive('/admin') ? colors.text : colors.textSecondary,
              background: isActive('/admin') ? colors.cardHover : 'transparent',
            }}
          >
            Admin
          </button>
        )}
      </div>

      <div style={styles.rightSection}>
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          style={{ ...styles.themeToggle, color: colors.text, border: `1px solid ${colors.border}` }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        <div 
          style={{ ...styles.profileContainer, background: colors.cardHover }}
          onClick={() => setShowProfile(!showProfile)}
        >
          <div style={{ ...styles.avatar, background: colors.brand, color: colors.brandInverse }}>
            {user.first_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={styles.profileInfo}>
            <div style={{ ...styles.profileName, color: colors.text }}>
              {user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}`.length > 18
                  ? `${user.first_name} ${user.last_name}`.substring(0, 18) + '...'
                  : `${user.first_name} ${user.last_name}`
                : user.email?.split('@')[0] || 'User'}
            </div>
            <div style={{ ...styles.profileRole, color: colors.textSecondary }}>
              {user.role === 'admin' ? 'Administrator' : 'Vehicle Owner'}
            </div>
          </div>
          <span style={{ ...styles.dropdownArrow, color: colors.textSecondary }}>▼</span>
        </div>

        {showProfile && (
          <div style={{ ...styles.dropdown, background: colors.backgroundSecondary, borderColor: colors.border, boxShadow: `0 2px 8px ${colors.shadowMedium}` }}>
            <button style={{ ...styles.dropdownItem, color: colors.text }} onClick={() => navigate('/profile')}>
              My Profile
            </button>
            <button style={{ ...styles.dropdownItem, color: colors.text }} onClick={() => navigate('/settings')}>
              Settings
            </button>
            <div style={{ ...styles.dropdownDivider, background: colors.border }}></div>
            <button 
              style={{...styles.dropdownItem, ...styles.logoutItem}} 
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    borderBottom: '1px solid',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(10px)',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: 8,
    transition: 'all 0.2s ease',
  },
  logoWrapper: {
    position: 'relative',
    width: 38,
    height: 38,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid rgba(255, 215, 0, 0.7)',
    isolation: 'isolate',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
  },
  logoImage: {
    width: '110%',
    height: '110%',
    objectFit: 'cover',
    filter: 'none',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transition: 'transform 0.2s ease',
    position: 'relative',
    left: '-5%',
    top: '-5%',
  },
  logoFallback: {
    width: 38,
    height: 38,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
  },
  brandMark: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    borderRadius: '4px',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 600,
  },
  mobileMenuButton: {
    display: 'none',
    fontSize: 24,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
  },
  centerSection: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  navButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  premiumNavButton: {
    fontWeight: 600,
    letterSpacing: 0.3,
  },
  rightSection: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  themeToggle: {
    width: 36,
    height: 36,
    borderRadius: 4,
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  profileContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '6px 12px',
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 600,
  },
  profileInfo: {
    textAlign: 'left',
  },
  profileName: {
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.3,
  },
  profileRole: {
    fontSize: 11,
  },
  dropdownArrow: {
    fontSize: 10,
    marginLeft: 5,
  },
  dropdown: {
    position: 'absolute',
    top: '50px',
    right: 0,
    borderRadius: 4,
    boxShadow: '0 2px 8px',
    minWidth: 180,
    overflow: 'hidden',
    border: '1px solid',
  },
  dropdownItem: {
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    textAlign: 'left',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  dropdownDivider: {
    height: 1,
    margin: '4px 0',
  },
  logoutItem: {
    color: '#dc3545',
  },
};

// Inject hover styles and mobile responsive CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .navButton:hover {
      opacity: 0.8;
    }
    .themeToggle:hover {
      opacity: 0.8;
    }
    .profileContainer:hover {
      opacity: 0.9;
    }
    .dropdownItem:hover {
      opacity: 0.8;
    }
    nav .brandContainer:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    nav .brandContainer:hover img {
      transform: scale(1.05);
    }
    nav .brandContainer:active {
      transform: scale(0.98);
    }
    
    @media (max-width: 768px) {
      nav {
        padding: 12px 16px !important;
        flex-wrap: wrap;
        position: sticky !important;
        top: 0 !important;
        z-index: 200 !important;
      }
      .mobileMenuButton {
        display: flex !important;
        align-items: center;
        justify-content: center;
        order: 3;
      }
      .centerSection {
        display: none !important;
        width: 100%;
        flex-direction: column;
        order: 5;
        margin-top: 8px;
        gap: 4px !important;
        padding-bottom: 8px;
      }
      .centerSection[style*="flex"] {
        display: flex !important;
      }
      .centerSection button {
        width: 100%;
        text-align: left !important;
        padding: 12px 16px !important;
        border-radius: 8px !important;
        font-size: 15px !important;
      }
      .profileInfo {
        display: none !important;
      }
      .dropdownArrow {
        display: none !important;
      }
      .brandTitle {
        font-size: 16px !important;
      }
      .brandMark {
        width: 32px !important;
        height: 32px !important;
        font-size: 12px !important;
      }
    }
  `;
  if (!document.head.querySelector('[data-navbar-styles]')) {
    styleSheet.setAttribute('data-navbar-styles', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default Navbar;