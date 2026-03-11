import React from "react";
import Sidebar from "./components/Sidebar";
import { BrowserRouter } from "react-router-dom";
import RoutesConfig from "./routes";
import Navbar from "./components/Navbar";
import { useLocation } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";

const AppContent = () => {
  const location = useLocation();
  const { colors } = useTheme();
  const isLoginPage = location.pathname === '/' || location.pathname === '/login';

  if (isLoginPage) {
    return <RoutesConfig />;
  }

  const styles = getStyles(colors);

  return (
    <div style={styles.appContainer}>
      <Sidebar />
      <div style={styles.mainContent} className="main-content">
        <Navbar />
        <div style={styles.pageContent}>
          <RoutesConfig />
        </div>
      </div>
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
  },
  pageContent: {
    minHeight: 'calc(100vh - 70px)',
  },
});

// Inject mobile styles
if (typeof document !== 'undefined' && !document.querySelector('[data-app-styles]')) {
  const styleSheet = document.createElement("style");
  styleSheet.setAttribute('data-app-styles', 'true');
  styleSheet.textContent = `
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0 !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default App;