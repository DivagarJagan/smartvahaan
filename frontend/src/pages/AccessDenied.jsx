import { useNavigate } from "react-router-dom";

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.iconContainer}>
          <svg viewBox="0 0 200 200" style={styles.icon}>
            {/* Shield with X */}
            <defs>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#e74c3c', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#c0392b', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            {/* Shield */}
            <path d="M 100 20 L 160 40 L 160 100 Q 160 140 100 180 Q 40 140 40 100 L 40 40 Z" 
                  fill="url(#shieldGrad)" stroke="#c0392b" strokeWidth="3"/>
            {/* X Mark */}
            <line x1="70" y1="70" x2="130" y2="130" stroke="white" strokeWidth="12" strokeLinecap="round"/>
            <line x1="130" y1="70" x2="70" y2="130" stroke="white" strokeWidth="12" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 style={styles.title}>Access Denied</h1>
        <p style={styles.message}>
          You don't have permission to access this page.
        </p>

        <div style={styles.detailsCard}>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>🔐 Access Level:</span>
            <span style={styles.detailValue}>Vehicle Owner</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>📋 Required Level:</span>
            <span style={styles.detailValue}>Administrator</span>
          </div>
        </div>

        <div style={styles.infoBox}>
          <p style={styles.infoTitle}>Why am I seeing this?</p>
          <p style={styles.infoText}>
            This area is restricted to authorized administrators only. 
            The administrative dashboard contains sensitive system information 
            and management tools that are not available to regular users.
          </p>
        </div>

        <div style={styles.actions}>
          <button 
            onClick={() => navigate(-1)}
            style={styles.backButton}
          >
            ← Go Back
          </button>
          <button 
            onClick={() => navigate('/vehicle')}
            style={styles.homeButton}
          >
            🏠 Go to Dashboard
          </button>
        </div>

        <div style={styles.helpSection}>
          <p style={styles.helpText}>
            Need administrator access?
          </p>
          <p style={styles.adminEmail}>
            Contact: <a href="mailto:admin@smartvahaan.com" style={styles.emailLink}>
              admin@smartvahaan.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '20px',
  },
  content: {
    maxWidth: '600px',
    width: '100%',
    background: 'white',
    borderRadius: '20px',
    padding: '50px 40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: '30px',
  },
  icon: {
    width: '150px',
    height: '150px',
    animation: 'shake 0.5s ease-in-out',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '15px',
  },
  message: {
    fontSize: '18px',
    color: '#7f8c8d',
    marginBottom: '30px',
    lineHeight: '1.6',
  },
  detailsCard: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '25px',
    border: '2px solid #e9ecef',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #dee2e6',
  },
  detailLabel: {
    fontSize: '15px',
    color: '#495057',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: '15px',
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  infoBox: {
    background: '#fff3cd',
    border: '2px solid #ffc107',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px',
    textAlign: 'left',
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: '10px',
  },
  infoText: {
    fontSize: '14px',
    color: '#856404',
    lineHeight: '1.6',
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
    justifyContent: 'center',
  },
  backButton: {
    padding: '14px 30px',
    background: '#e9ecef',
    color: '#495057',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  homeButton: {
    padding: '14px 30px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    transition: 'all 0.3s ease',
  },
  helpSection: {
    borderTop: '2px solid #e9ecef',
    paddingTop: '25px',
  },
  helpText: {
    fontSize: '15px',
    color: '#7f8c8d',
    marginBottom: '10px',
  },
  adminEmail: {
    fontSize: '16px',
    color: '#2c3e50',
  },
  emailLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

// Add animation
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
    button:hover {
      transform: translateY(-2px);
    }
  `;
  document.head.appendChild(styleSheet);
}

export default AccessDenied;
