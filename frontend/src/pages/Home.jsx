import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Home = () => {
  const navigate = useNavigate();
  const { colors, isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [hoveredUserFeature, setHoveredUserFeature] = useState(null);
  const [hoveredStep, setHoveredStep] = useState(null);
  const [hoveredContext, setHoveredContext] = useState(null);

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Diagnostics',
      description: 'Advanced machine learning algorithms analyze your vehicle data to predict maintenance needs before they become critical issues.',
    },
    {
      icon: '🔔',
      title: 'Predictive Maintenance Alerts',
      description: 'Get timely notifications about upcoming service requirements based on your vehicle usage patterns and Indian road conditions.',
    },
    {
      icon: '💰',
      title: 'Cost Optimization',
      description: 'Save money with intelligent recommendations that help you schedule maintenance at the right time, avoiding expensive emergency repairs.',
    },
    {
      icon: '📊',
      title: 'Detailed Analytics',
      description: 'Track your vehicle health with comprehensive dashboards showing maintenance history, costs, and performance trends over time.',
    },
    {
      icon: '🌧️',
      title: 'Indian Conditions Analysis',
      description: 'Specialized algorithms account for pothole density, monsoon impact, dust pollution, and traffic congestion unique to Indian roads.',
    },
    {
      icon: '🔧',
      title: 'Service History Tracking',
      description: 'Maintain complete digital records of all maintenance activities, making it easy to manage warranty claims and resale value.',
    },
  ];

  const userFriendlyFeatures = [
    {
      icon: '👆',
      title: 'Intuitive Interface',
      description: 'Clean, modern design that anyone can navigate without technical knowledge or training.',
    },
    {
      icon: '📱',
      title: 'Mobile Responsive',
      description: 'Access your vehicle data anywhere, anytime from your phone, tablet, or computer seamlessly.',
    },
    {
      icon: '🌐',
      title: 'Multi-Language Support',
      description: 'Available in English, Hindi, and regional languages to serve all Indian users comfortably.',
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Get instant AI recommendations in seconds. No waiting, no hassle, just quick insights.',
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your vehicle and personal data is encrypted and never shared with third parties.',
    },
    {
      icon: '💬',
      title: '24/7 Support',
      description: 'Dedicated customer support team ready to help you via chat, email, or phone anytime.',
    },
    {
      icon: '📧',
      title: 'Smart Notifications',
      description: 'Receive email and push notifications for important maintenance reminders automatically.',
    },
    {
      icon: '💳',
      title: 'Easy Payment',
      description: 'Integrated payment options for service bookings with UPI, cards, and digital wallets.',
    },
  ];

  const benefits = [
    {
      stat: '40%',
      label: 'Reduce Maintenance Costs',
      description: 'Predictive maintenance helps avoid costly emergency repairs',
    },
    {
      stat: '30%',
      label: 'Extend Vehicle Life',
      description: 'Timely service keeps your vehicle running longer',
    },
    {
      stat: '24/7',
      label: 'AI Monitoring',
      description: 'Continuous analysis of your vehicle health',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Add Your Vehicle',
      description: 'Register your vehicle with basic details like make, model, year, and current odometer reading.',
    },
    {
      step: '2',
      title: 'AI Analysis',
      description: 'Our AI engine analyzes your vehicle data along with Indian road conditions to provide personalized insights.',
    },
    {
      step: '3',
      title: 'Get Recommendations',
      description: 'Receive actionable maintenance suggestions with cost estimates and urgency levels.',
    },
    {
      step: '4',
      title: 'Track History',
      description: 'Log service activities and monitor your vehicle health over time with detailed analytics.',
    },
  ];

  const styles = getStyles(colors, isDark);

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.logoContainer}>
            <div style={styles.logoImageWrapper} className="hero-logo-animated">
              <img 
                src="/smartvahaan-logo.jpeg" 
                alt="SmartVahaan Logo" 
                style={styles.heroLogo}
              />
            </div>
          </div>
          <h1 style={styles.heroTitle}>
            Welcome to <span style={styles.brandName}>SmartVahaan</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Your Intelligent Vehicle Maintenance Companion
          </p>
          <p style={styles.heroDescription}>
            SmartVahaan uses cutting-edge AI technology to help Indian vehicle owners 
            maintain their vehicles efficiently, reduce costs, and extend vehicle lifespan 
            through predictive maintenance and intelligent analytics.
          </p>
          <button 
            style={isAuthenticated ? {...styles.ctaButton, ...styles.ctaButtonPrimary} : styles.ctaButton}
            onClick={() => navigate(isAuthenticated ? '/vehicle' : '/')}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {isAuthenticated ? '🚗 Start Vehicle Analysis' : 'Get Started Free'}
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Powerful Features</h2>
        <p style={styles.sectionSubtitle}>
          Everything you need to keep your vehicle in perfect condition
        </p>
        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div 
              key={index} 
              style={{
                ...styles.featureCard,
                ...(hoveredFeature === index ? styles.featureCardHover : {})
              }}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User-Friendly Features Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Designed for Everyone</h2>
        <p style={styles.sectionSubtitle}>
          User-friendly features that make vehicle maintenance simple and stress-free
        </p>
        <div style={styles.userFriendlyGrid}>
          {userFriendlyFeatures.map((feature, index) => (
            <div 
              key={index} 
              style={{
                ...styles.userFriendlyCard,
                ...(hoveredUserFeature === index ? styles.userFriendlyCardHover : {})
              }}
              onMouseEnter={() => setHoveredUserFeature(index)}
              onMouseLeave={() => setHoveredUserFeature(null)}
            >
              <div style={styles.userFriendlyIcon}>{feature.icon}</div>
              <h3 style={styles.userFriendlyTitle}>{feature.title}</h3>
              <p style={styles.userFriendlyDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div style={{...styles.section, ...styles.benefitsSection}}>
        <h2 style={styles.sectionTitle}>Why Choose SmartVahaan?</h2>
        <div style={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <div key={index} style={styles.benefitCard}>
              <div style={styles.benefitStat}>{benefit.stat}</div>
              <div style={styles.benefitLabel}>{benefit.label}</div>
              <p style={styles.benefitDescription}>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <p style={styles.sectionSubtitle}>
          Get started in 4 simple steps
        </p>
        <div style={styles.stepsContainer}>
          {howItWorks.map((item, index) => (
            <div 
              key={index} 
              style={{
                ...styles.stepCard,
                ...(hoveredStep === index ? styles.stepCardHover : {})
              }}
              onMouseEnter={() => setHoveredStep(index)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div style={styles.stepNumber}>{item.step}</div>
              <h3 style={styles.stepTitle}>{item.title}</h3>
              <p style={styles.stepDescription}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Indian Context Section */}
      <div style={{...styles.section, ...styles.contextSection}}>
        <div style={styles.contextContent}>
          <h2 style={styles.sectionTitle}>Built for Indian Roads</h2>
          <p style={styles.contextDescription}>
            SmartVahaan understands the unique challenges of Indian driving conditions. 
            Our AI algorithms factor in:
          </p>
          <div style={styles.contextGrid}>
            <div 
              style={{
                ...styles.contextItem,
                ...(hoveredContext === 0 ? styles.contextItemHover : {})
              }}
              onMouseEnter={() => setHoveredContext(0)}
              onMouseLeave={() => setHoveredContext(null)}
            >
              <span style={styles.contextIcon}>🕳️</span>
              <span style={styles.contextLabel}>Pothole Damage Analysis</span>
            </div>
            <div 
              style={{
                ...styles.contextItem,
                ...(hoveredContext === 1 ? styles.contextItemHover : {})
              }}
              onMouseEnter={() => setHoveredContext(1)}
              onMouseLeave={() => setHoveredContext(null)}
            >
              <span style={styles.contextIcon}>🌧️</span>
              <span style={styles.contextLabel}>Monsoon Season Impact</span>
            </div>
            <div 
              style={{
                ...styles.contextItem,
                ...(hoveredContext === 2 ? styles.contextItemHover : {})
              }}
              onMouseEnter={() => setHoveredContext(2)}
              onMouseLeave={() => setHoveredContext(null)}
            >
              <span style={styles.contextIcon}>💨</span>
              <span style={styles.contextLabel}>Dust & Pollution Effects</span>
            </div>
            <div 
              style={{
                ...styles.contextItem,
                ...(hoveredContext === 3 ? styles.contextItemHover : {})
              }}
              onMouseEnter={() => setHoveredContext(3)}
              onMouseLeave={() => setHoveredContext(null)}
            >
              <span style={styles.contextIcon}>🚗</span>
              <span style={styles.contextLabel}>Traffic Congestion Wear</span>
            </div>
            <div 
              style={{
                ...styles.contextItem,
                ...(hoveredContext === 4 ? styles.contextItemHover : {})
              }}
              onMouseEnter={() => setHoveredContext(4)}
              onMouseLeave={() => setHoveredContext(null)}
            >
              <span style={styles.contextIcon}>🌡️</span>
              <span style={styles.contextLabel}>Extreme Temperature Variations</span>
            </div>
            <div 
              style={{
                ...styles.contextItem,
                ...(hoveredContext === 5 ? styles.contextItemHover : {})
              }}
              onMouseEnter={() => setHoveredContext(5)}
              onMouseLeave={() => setHoveredContext(null)}
            >
              <span style={styles.contextIcon}>🛣️</span>
              <span style={styles.contextLabel}>Mixed Road Quality</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Transform Your Vehicle Maintenance?</h2>
        <p style={styles.ctaDescription}>
          Join thousands of smart vehicle owners who trust SmartVahaan for their maintenance needs.
        </p>
        <button 
          style={{...styles.ctaButton, ...styles.ctaButtonLarge}}
          onClick={() => navigate(isAuthenticated ? '/vehicle' : '/')}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          {isAuthenticated ? 'Go to My Vehicle' : 'Start Your Free Account'}
        </button>
      </div>

      {/* CSS Animations for Logo */}
      <style>{`
        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0px) translateZ(0);
          }
          50% {
            transform: translateY(-10px) translateZ(0);
          }
        }

        .hero-logo-animated {
          animation: logoFloat 3s ease-in-out infinite;
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translateZ(0);
        }

        .hero-logo-animated:hover {
          transform: scale(1.05) translateZ(0);
          transition: transform 0.3s ease;
        }
      `}</style>
    </div>
  );
};

const getStyles = (colors, isDark) => ({
  container: {
    minHeight: '100vh',
    backgroundColor: colors.background,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  hero: {
    background: `linear-gradient(135deg, ${isDark ? '#0a1628' : '#2563eb'} 0%, ${isDark ? '#1e3a8a' : '#3b82f6'} 100%)`,
    color: '#ffffff',
    padding: '80px 20px',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: 800,
    margin: '0 auto',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
    width: '100%',
  },
  logoImageWrapper: {
    width: 200,
    height: 200,
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid rgba(255, 215, 0, 0.9)',
    boxShadow: 'none',
    position: 'relative',
    isolation: 'isolate',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
    willChange: 'transform',
  },
  heroLogo: {
    width: '110%',
    height: '110%',
    objectFit: 'cover',
    objectPosition: 'center center',
    display: 'block',
    filter: 'none',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transition: 'all 0.4s ease',
    position: 'relative',
    left: '-5%',
    top: '-5%',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 700,
    marginBottom: 16,
    lineHeight: 1.2,
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3), -1px -1px 2px rgba(0, 0, 0, 0.2)',
  },
  brandName: {
    color: '#60a5fa',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), -1px -1px 2px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 0, 0, 0.4)',
  },
  heroSubtitle: {
    fontSize: 24,
    fontWeight: 500,
    marginBottom: 20,
    opacity: 0.95,
  },
  heroDescription: {
    fontSize: 18,
    lineHeight: 1.7,
    marginBottom: 32,
    opacity: 0.9,
  },
  ctaButton: {
    padding: '14px 32px',
    fontSize: 16,
    fontWeight: 600,
    backgroundColor: '#ffffff',
    color: '#2563eb',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  ctaButtonPrimary: {
    backgroundColor: '#60a5fa',
    color: '#ffffff',
    fontSize: 18,
    padding: '16px 40px',
    boxShadow: '0 6px 20px rgba(96, 165, 250, 0.4)',
  },
  ctaButtonLarge: {
    padding: '16px 48px',
    fontSize: 18,
  },
  section: {
    padding: '80px 20px',
    maxWidth: 1200,
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 700,
    textAlign: 'center',
    color: colors.text,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 48,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 32,
  },
  featureCard: {
    backgroundColor: colors.card,
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    boxShadow: isDark 
      ? '0 4px 12px rgba(37, 99, 235, 0.1)'
      : '0 4px 12px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  featureCardHover: {
    transform: 'translateY(-8px)',
    backgroundColor: colors.cardHover,
    boxShadow: isDark 
      ? '0 12px 24px rgba(59, 130, 246, 0.25)'
      : '0 12px 24px rgba(37, 99, 235, 0.15)',
    borderColor: colors.brandLight,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 1.6,
    color: colors.textSecondary,
    margin: 0,
  },
  userFriendlyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 24,
  },
  userFriendlyCard: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.border,
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  userFriendlyCardHover: {
    transform: 'scale(1.05)',
    backgroundColor: colors.cardHover,
    borderColor: colors.brand,
    boxShadow: isDark 
      ? '0 8px 20px rgba(59, 130, 246, 0.3)'
      : '0 8px 20px rgba(37, 99, 235, 0.15)',
  },
  userFriendlyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  userFriendlyTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 10,
  },
  userFriendlyDescription: {
    fontSize: 14,
    lineHeight: 1.5,
    color: colors.textSecondary,
    margin: 0,
  },
  benefitsSection: {
    backgroundColor: isDark 
      ? 'rgba(37, 99, 235, 0.05)'
      : 'rgba(37, 99, 235, 0.03)',
  },
  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 32,
  },
  benefitCard: {
    textAlign: 'center',
    padding: 32,
  },
  benefitStat: {
    fontSize: 56,
    fontWeight: 700,
    color: colors.brand,
    marginBottom: 12,
  },
  benefitLabel: {
    fontSize: 20,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 8,
  },
  benefitDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    margin: 0,
  },
  stepsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 24,
  },
  stepCard: {
    backgroundColor: colors.card,
    padding: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  stepCardHover: {
    transform: 'translateY(-6px) rotate(1deg)',
    backgroundColor: colors.cardHover,
    borderColor: colors.brand,
    boxShadow: isDark 
      ? '0 10px 24px rgba(59, 130, 246, 0.25)'
      : '0 10px 24px rgba(37, 99, 235, 0.15)',
  },
  stepNumber: {
    width: 56,
    height: 56,
    backgroundColor: colors.brand,
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 700,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 1.6,
    color: colors.textSecondary,
    margin: 0,
  },
  contextSection: {
    backgroundColor: isDark 
      ? 'rgba(37, 99, 235, 0.05)'
      : 'rgba(37, 99, 235, 0.03)',
  },
  contextContent: {
    maxWidth: 900,
    margin: '0 auto',
  },
  contextDescription: {
    fontSize: 18,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 40,
  },
  contextGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 24,
  },
  contextItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    textAlign: 'center',
  },
  contextItemHover: {
    transform: 'translateY(-8px)',
    backgroundColor: colors.cardHover,
    borderColor: colors.brandLight,
    boxShadow: isDark 
      ? '0 4px 16px rgba(59, 130, 246, 0.25)'
      : '0 4px 16px rgba(37, 99, 235, 0.12)',
  },
  contextIcon: {
    fontSize: 32,
  },
  contextLabel: {
    fontSize: 15,
    fontWeight: 500,
    color: colors.text,
  },
  ctaSection: {
    padding: '80px 20px',
    textAlign: 'center',
    background: `linear-gradient(135deg, ${isDark ? '#0a1628' : '#2563eb'} 0%, ${isDark ? '#1e3a8a' : '#3b82f6'} 100%)`,
    color: '#ffffff',
  },
  ctaTitle: {
    fontSize: 40,
    fontWeight: 700,
    marginBottom: 16,
  },
  ctaDescription: {
    fontSize: 18,
    marginBottom: 32,
    opacity: 0.9,
    maxWidth: 600,
    margin: '0 auto 32px',
  },
});

export default Home;
