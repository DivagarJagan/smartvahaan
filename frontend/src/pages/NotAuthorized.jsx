import React from 'react';
import { useTheme } from '../context/ThemeContext';

const NotAuthorized = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🚫</div>
        <h2 style={styles.title}>Access Denied</h2>
        <p style={styles.message}>
          You don't have permission to access this page.
        </p>
        <button
          style={styles.button}
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

const getStyles = (colors) => ({
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.background,
    padding: 20,
  },
  card: {
    background: colors.card,
    padding: 48,
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    boxShadow: `0 4px 12px ${colors.shadow}`,
    textAlign: 'center',
    maxWidth: 400,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 1.6,
  },
  button: {
    padding: '12px 24px',
    background: colors.buttonPrimary,
    color: colors.buttonPrimaryText,
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
});

// Inject mobile styles
if (typeof document !== 'undefined' && !document.querySelector('[data-notauth-styles]')) {
  const styleSheet = document.createElement('style');
  styleSheet.setAttribute('data-notauth-styles', 'true');
  styleSheet.textContent = `
    @media (max-width: 768px) {
      .notauth-card {
        padding: 32px 24px !important;
      }
      .notauth-icon {
        font-size: 48px !important;
      }
      .notauth-title {
        font-size: 24px !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default NotAuthorized;