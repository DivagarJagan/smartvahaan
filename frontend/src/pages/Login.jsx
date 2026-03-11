import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [role, setRole] = useState("user");
  const { login } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    
    if (pwd.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasUppercase) {
      return "Password must contain at least 1 uppercase letter";
    }
    if (!hasNumber) {
      return "Password must contain at least 1 number";
    }
    if (!hasSpecial) {
      return "Password must contain at least 1 special character";
    }
    return "";
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordTouched(true);
    if (newPassword) {
      setPasswordError(validatePassword(newPassword));
    } else {
      setPasswordError("");
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailTouched(true);
  };

  const isEmailValid = (email) => {
    return email.includes('@') && email.includes('.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password before submission
    const error = validatePassword(password);
    if (error) {
      setPasswordError(error);
      return;
    }
    
    await login({ email, password, role });
    navigate(role === 'admin' ? '/admin' : '/home');
  };

  const handleSocialLogin = (provider) => {
    // Show alert that OAuth is not implemented yet
    alert(`${provider} sign-in will be available soon! 

For now, please use email sign-in below.

Features coming soon:
✓ One-click ${provider} authentication
✓ Secure OAuth 2.0 integration
✓ Automatic profile sync
✓ Quick registration process

Stay tuned for updates!`);
  };

  const styles = getStyles(colors, isDark);

  return (
    <div style={styles.container}>
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        style={styles.themeToggleButton}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Left Panel - Branding */}
      <div style={styles.leftPanel}>
        <div style={styles.brandingContent}>
          <div style={styles.logoContainer}>
            <div style={styles.logoImageWrapper}>
              <img 
                src="/smartvahaan-logo.jpeg" 
                alt="SmartVahaan Logo" 
                style={styles.logoImage}
              />
            </div>
          </div>
          
          <h1 style={styles.tagline}>
            SmartVahaan
          </h1>
          
          <p style={styles.appSubtitle}>
            AI-Powered Vehicle Care
          </p>
          
          <p style={styles.appDescription}>
            Smart diagnostics, predictive maintenance, and cost optimization 
            for your vehicle—all powered by cutting-edge AI technology.
          </p>
          
          {/* Key Benefits */}
          <div style={styles.benefitsSection}>
            <h3 style={styles.sectionTitle}>Key Features</h3>
            
            <div style={styles.benefitItem}>
              <div style={styles.benefitIcon}>🤖</div>
              <div style={styles.benefitContent}>
                <h4 style={styles.benefitTitle}>AI Diagnostics</h4>
                <p style={styles.benefitText}>Advanced algorithms for accurate vehicle health assessments</p>
              </div>
            </div>
            
            <div style={styles.benefitItem}>
              <div style={styles.benefitIcon}>🔮</div>
              <div style={styles.benefitContent}>
                <h4 style={styles.benefitTitle}>Predictive Alerts</h4>
                <p style={styles.benefitText}>Early warnings tailored to Indian road conditions</p>
              </div>
            </div>
            
            <div style={styles.benefitItem}>
              <div style={styles.benefitIcon}>💰</div>
              <div style={styles.benefitContent}>
                <h4 style={styles.benefitTitle}>Save 40% Costs</h4>
                <p style={styles.benefitText}>Optimize maintenance and avoid expensive repairs</p>
              </div>
            </div>
            
            <div style={styles.benefitItem}>
              <div style={styles.benefitIcon}>📊</div>
              <div style={styles.benefitContent}>
                <h4 style={styles.benefitTitle}>Real-Time Analytics</h4>
                <p style={styles.benefitText}>Track performance and maintenance history</p>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div style={styles.statsSection}>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>10K+</div>
              <div style={styles.statLabel}>Active Users</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>95%</div>
              <div style={styles.statLabel}>Accuracy Rate</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>24/7</div>
              <div style={styles.statLabel}>AI Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <div style={styles.header}>
            <h2 style={styles.title}>Welcome Back</h2>
            <p style={styles.subtitle}>
              Sign in to your account
            </p>
          </div>

          {/* Social Login Buttons */}
          <div style={styles.socialButtons}>
            <button 
              type="button" 
              style={styles.socialButton}
              onClick={() => handleSocialLogin('Google')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" style={styles.socialIcon}>
                <path fill="#DB4437" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <button 
              type="button" 
              style={styles.socialButton}
              onClick={() => handleSocialLogin('Facebook')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" style={styles.socialIcon}>
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
            
            <button 
              type="button" 
              style={styles.socialButton}
              onClick={() => handleSocialLogin('Phone')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" style={styles.socialIcon}>
                <path fill={colors.brand} d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z"/>
                <path fill={colors.brand} d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zm3.422 5.443a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1.001 1.001 0 0 0-1.391-.087l-2.17 1.861a1 1 0 0 0-.29.649c-.015.25-.301 6.172 4.291 10.766C11.305 20.707 16.323 21 17.705 21c.202 0 .326-.006.359-.008a.992.992 0 0 0 .648-.291l1.86-2.171a1 1 0 0 0-.086-1.391l-4.064-3.696z"/>
              </svg>
              Continue with Phone
            </button>
          </div>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>OR</span>
            <div style={styles.dividerLine}></div>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>EMAIL <span style={{color: colors.error}}>*</span></label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={handleEmailChange}
                required
                style={styles.input}
              />
              {emailTouched && email && !isEmailValid(email) && (
                <div style={styles.instruction}>* Please include an '@' in the email address</div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>PASSWORD <span style={{color: colors.error}}>*</span></label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  style={{
                    ...styles.input,
                    ...(passwordError ? styles.inputError : {}),
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {passwordTouched && passwordError && (
                <div style={styles.instruction}>* Must contain: 8+ characters, 1 uppercase letter, 1 number, 1 special character</div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>ROLE</label>
              <div style={styles.roleGrid}>
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  style={{
                    ...styles.roleButton,
                    ...(role === "user" ? styles.roleButtonActive : {}),
                  }}
                >
                  Owner
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  style={{
                    ...styles.roleButton,
                    ...(role === "admin" ? styles.roleButtonActive : {}),
                  }}
                >
                  Admin
                </button>
              </div>
            </div>

            <button type="submit" style={styles.submitButton}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const getStyles = (colors, isDark) => ({
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    position: 'relative',
  },
  themeToggleButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: colors.backgroundSecondary,
    border: `1px solid ${colors.border}`,
    cursor: 'pointer',
    fontSize: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transition: 'all 0.2s',
    boxShadow: `0 2px 8px ${colors.shadowMedium}`,
  },
  leftPanel: {
    flex: 1,
    background: colors.brand,
    color: colors.brandInverse,
    padding: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  },
  brandingContent: {
    maxWidth: "500px",
    width: "100%",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "32px",
  },
  logoImageWrapper: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "3px solid rgba(255, 215, 0, 0.8)",
    position: "relative",
    isolation: "isolate",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    transform: "translateZ(0)",
  },
  logoImage: {
    width: "110%",
    height: "110%",
    objectFit: "cover",
    objectPosition: "center center",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    filter: "none",
    transition: "all 0.3s ease",
    display: "block",
    position: "relative",
    left: "-5%",
    top: "-5%",
  },
  tagline: {
    fontSize: "36px",
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: "10px",
    color: colors.brandInverse,
    textAlign: "center",
    letterSpacing: "-0.5px",
    textShadow: isDark 
      ? "2px 2px 4px rgba(0, 0, 0, 0.5), -1px -1px 2px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 0, 0, 0.3)"
      : "2px 2px 4px rgba(0, 0, 0, 0.3), -1px -1px 2px rgba(0, 0, 0, 0.2), 0 0 15px rgba(0, 0, 0, 0.2)",
  },
  appSubtitle: {
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: 1.4,
    marginBottom: "18px",
    color: colors.brandInverse,
    textAlign: "center",
    opacity: 0.95,
    letterSpacing: "0.3px",
    textShadow: isDark
      ? "1px 1px 3px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 0, 0, 0.2)"
      : "1px 1px 3px rgba(0, 0, 0, 0.3), 0 0 8px rgba(0, 0, 0, 0.15)",
  },
  appDescription: {
    fontSize: "14px",
    lineHeight: 1.6,
    marginBottom: "28px",
    color: colors.brandInverse,
    textAlign: "center",
    opacity: 0.85,
    padding: "0 10px",
    textShadow: isDark
      ? "1px 1px 2px rgba(0, 0, 0, 0.5), 0 0 8px rgba(0, 0, 0, 0.15)"
      : "1px 1px 2px rgba(0, 0, 0, 0.3), 0 0 6px rgba(0, 0, 0, 0.1)",
  },
  benefitsSection: {
    marginTop: "24px",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "17px",
    fontWeight: 600,
    color: colors.brandInverse,
    marginBottom: "16px",
    textAlign: "center",
    letterSpacing: "0.3px",
    textShadow: isDark
      ? "1px 1px 3px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 0, 0, 0.2)"
      : "1px 1px 3px rgba(0, 0, 0, 0.3), 0 0 8px rgba(0, 0, 0, 0.15)",
  },
  benefitItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    marginBottom: "16px",
    padding: "12px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
  },
  benefitIcon: {
    fontSize: "24px",
    flexShrink: 0,
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: colors.brandInverse,
    marginBottom: "4px",
    lineHeight: 1.3,
    letterSpacing: "0.2px",
    textShadow: isDark
      ? "1px 1px 2px rgba(0, 0, 0, 0.5), 0 0 8px rgba(0, 0, 0, 0.15)"
      : "1px 1px 2px rgba(0, 0, 0, 0.3), 0 0 6px rgba(0, 0, 0, 0.1)",
  },
  benefitText: {
    fontSize: "12px",
    lineHeight: 1.5,
    color: colors.brandInverse,
    opacity: 0.85,
    margin: 0,
    textShadow: isDark
      ? "1px 1px 2px rgba(0, 0, 0, 0.4)"
      : "1px 1px 2px rgba(0, 0, 0, 0.25)",
  },
  statsSection: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginTop: "24px",
    padding: "18px 0",
    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
  },
  statItem: {
    textAlign: "center",
  },
  statNumber: {
    fontSize: "24px",
    fontWeight: 700,
    color: colors.brandInverse,
    marginBottom: "4px",
    letterSpacing: "-0.5px",
    textShadow: isDark
      ? "1px 1px 3px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 0, 0, 0.2)"
      : "1px 1px 3px rgba(0, 0, 0, 0.3), 0 0 8px rgba(0, 0, 0, 0.15)",
  },
  statLabel: {
    fontSize: "11px",
    fontWeight: 500,
    color: colors.brandInverse,
    opacity: 0.8,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    textShadow: isDark
      ? "1px 1px 2px rgba(0, 0, 0, 0.4)"
      : "1px 1px 2px rgba(0, 0, 0, 0.25)",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: colors.backgroundSecondary,
    padding: "40px",
  },
  formContainer: {
    width: "100%",
    maxWidth: "400px",
  },
  header: {
    marginBottom: "32px",
    textAlign: "center",
  },
  title: {
    fontSize: "32px",
    fontWeight: 700,
    color: isDark ? '#f1f5f9' : colors.text,
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "15px",
    color: isDark ? '#cbd5e1' : colors.textSecondary,
  },
  socialButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px",
  },
  socialButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: 500,
    border: `1px solid ${colors.border}`,
    borderRadius: "6px",
    background: colors.backgroundSecondary,
    color: isDark ? '#e2e8f0' : colors.text,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  socialIcon: {
    flexShrink: 0,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: colors.border,
  },
  dividerText: {
    fontSize: "13px",
    fontWeight: 500,
    color: isDark ? '#94a3b8' : colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 500,
    color: isDark ? '#e2e8f0' : colors.text,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "12px 16px",
    fontSize: "15px",
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    transition: "border-color 0.2s",
    outline: "none",
    background: colors.backgroundSecondary,
    color: isDark ? '#f1f5f9' : colors.text,
    width: "100%",
    boxSizing: "border-box",
  },
  passwordContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  passwordToggle: {
    position: "absolute",
    right: "12px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
    transition: "opacity 0.2s",
  },
  inputError: {
    borderColor: colors.error,
  },
  errorMessage: {
    color: colors.error,
    fontSize: "12px",
    marginTop: "6px",
    fontWeight: 500,
  },
  instruction: {
    color: colors.error,
    fontSize: "12px",
    marginTop: "6px",
    fontWeight: 400,
    lineHeight: "1.4",
  },
  roleGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  roleButton: {
    padding: "12px",
    fontSize: "14px",
    fontWeight: 500,
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    background: colors.backgroundSecondary,
    color: isDark ? '#e2e8f0' : colors.text,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  roleButtonActive: {
    background: colors.brand,
    color: colors.brandInverse,
    borderColor: colors.brand,
  },
  submitButton: {
    padding: "14px",
    fontSize: "15px",
    fontWeight: 500,
    color: colors.brandInverse,
    background: colors.brand,
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "opacity 0.2s",
    marginTop: "8px",
  },
});

// Hover effects and mobile styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    input:focus {
      border-color: #3b82f6 !important;
    }
    button[type="submit"]:hover {
      opacity: 0.9;
    }
    button[type="button"]:hover {
      background: rgba(59, 130, 246, 0.1) !important;
      border-color: #60a5fa !important;
    }
    button[type="button"]:hover:not([style*="position: absolute"]) {
      background: rgba(59, 130, 246, 0.1) !important;
      border-color: #60a5fa !important;
    }
    .themeToggleButton:hover {
      transform: scale(1.05);
    }
    
    @media (max-width: 968px) {
      .container {
        flex-direction: column !important;
      }
      .leftPanel {
        padding: 60px 30px !important;
        min-height: 60vh !important;
      }
      .brandingContent {
        max-width: 100% !important;
      }
      .logoImage {
        width: 120px !important;
        height: 120px !important;
      }
      .tagline {
        font-size: 30px !important;
      }
      .appSubtitle {
        font-size: 14px !important;
      }
      .appDescription {
        font-size: 13px !important;
      }
      .sectionTitle {
        font-size: 15px !important;
      }
      .benefitItem {
        padding: 10px !important;
        margin-bottom: 14px !important;
        gap: 12px !important;
      }
      .benefitIcon {
        font-size: 22px !important;
        width: 32px !important;
        height: 32px !important;
      }
      .benefitTitle {
        font-size: 13px !important;
      }
      .benefitText {
        font-size: 11px !important;
      }
      .statsSection {
        gap: 10px !important;
        padding: 16px 0 !important;
      }
      .statNumber {
        font-size: 20px !important;
      }
      .statLabel {
        font-size: 10px !important;
      }
      .rightPanel {
        padding: 60px 30px !important;
      }
      .formContainer {
        max-width: 100% !important;
      }
      .themeToggleButton {
        width: 44px !important;
        height: 44px !important;
        font-size: 18px !important;
      }
    }
    
    @media (max-width: 480px) {
      .leftPanel {
        padding: 40px 20px !important;
        min-height: 50vh !important;
      }
      .logoImage {
        width: 110px !important;
        height: 110px !important;
      }
      .tagline {
        font-size: 26px !important;
      }
      .appSubtitle {
        font-size: 13px !important;
      }
      .appDescription {
        font-size: 12px !important;
        padding: 0 10px !important;
      }
      .sectionTitle {
        font-size: 14px !important;
      }
      .benefitItem {
        padding: 8px !important;
        margin-bottom: 12px !important;
      }
      .benefitIcon {
        font-size: 20px !important;
        width: 28px !important;
        height: 28px !important;
      }
      .benefitTitle {
        font-size: 12px !important;
      }
      .benefitText {
        font-size: 11px !important;
      }
      .statsSection {
        gap: 8px !important;
        padding: 14px 0 !important;
      }
      .statNumber {
        font-size: 18px !important;
      }
      .statLabel {
        font-size: 9px !important;
      }
      .rightPanel {
        padding: 40px 20px !important;
      }
      .title {
        font-size: 26px !important;
      }
      .socialButton {
        font-size: 13px !important;
        padding: 10px 16px !important;
      }
    }
  `;
  if (!document.head.querySelector('[data-login-styles]')) {
    styleSheet.setAttribute('data-login-styles', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default Login;
