import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import { BrowserRouter } from "react-router-dom";
import RoutesConfig from "./routes";
import Navbar from "./components/Navbar";
import { useLocation } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";

// Mobile hamburger button — sits as a FAB on mobile to open Sidebar
const MobileMenuFab = ({ onClick, colors }) => (
  <button
    onClick={onClick}
    className="mobile-fab-menu"
    aria-label="Open menu"
    style={{
      position: 'fixed',
      bottom: 24,
      left: 20,
      zIndex: 1200,
      width: 50,
      height: 50,
      borderRadius: '50%',
      background: colors.brand || '#1976d2',
      color: '#fff',
      border: 'none',
      fontSize: 22,
      cursor: 'pointer',
      display: 'none',           // shown via CSS media query
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}
  >
    ☰
  </button>
);

const AppContent = () => {
  const location = useLocation();
  const { colors } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoginPage = location.pathname === '/' || location.pathname === '/login';

  if (isLoginPage) {
    return <RoutesConfig />;
  }

  const styles = getStyles(colors);

  return (
    <div style={styles.appContainer}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div style={styles.mainContent} className="main-content">
        <Navbar />
        <div style={styles.pageContent}>
          <RoutesConfig />
        </div>
      </div>
      <MobileMenuFab onClick={() => setMobileOpen(true)} colors={colors} />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

const getStyles = (colors) => ({
  appContainer: {
    display: 'flex',
    minHeight: '100vh',
    background: colors.background,
  },
  mainContent: {
    flex: 1,
    marginLeft: '250px',
    transition: 'margin-left 0.3s ease',
    minWidth: 0,
  },
  pageContent: {
    minHeight: 'calc(100vh - 70px)',
  },
});

// Inject global mobile responsive styles
if (typeof document !== 'undefined' && !document.querySelector('[data-app-styles]')) {
  const styleSheet = document.createElement("style");
  styleSheet.setAttribute('data-app-styles', 'true');
  styleSheet.textContent = `
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0 !important;
      }
      .mobile-fab-menu {
        display: flex !important;
      }
    }
    @media (min-width: 769px) {
      .mobile-fab-menu {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default App;