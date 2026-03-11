import { useEffect, useState } from "react";
import aiService from "../services/aiService";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTheme } from "../context/ThemeContext";
import { trackActivity, ActivityTypes } from "../utils/activityTracker";

const MaintenanceSuggestions = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [daysProgressed, setDaysProgressed] = useState(0);
  const { colors } = useTheme();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const data = await aiService.getSuggestions();
      setResult(data);
      setDaysProgressed(0); // Reset days when fetching fresh data
      setError(null);
      
      // Track maintenance analysis activity
      trackActivity(
        ActivityTypes.ANALYSIS_REQUESTED,
        'Maintenance Analysis',
        `Analyzed vehicle health - Risk Score: ${data.risk_score}/5`,
        { riskScore: data.risk_score, severity: data.severity }
      );
    } catch (err) {
      setError("Failed to fetch maintenance suggestions. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const projectFutureCondition = (currentResult) => {
    if (!currentResult || currentResult.risk_score < 3) {
      // Not in danger zone, fetch fresh random scenario
      fetchSuggestions();
      return;
    }

    const newDays = daysProgressed + 15;
    setDaysProgressed(newDays);

    // Project deterioration based on current risk score
    let newRiskScore = currentResult.risk_score;
    let newHealthScore = currentResult.ai_summary?.health_score || 70;
    let newSeverity = currentResult.severity;

    // Deterioration logic
    if (currentResult.risk_score === 3) {
      newRiskScore = 4;
      newSeverity = "High";
      newHealthScore = Math.max(35, newHealthScore - 25);
    } else if (currentResult.risk_score === 4) {
      newRiskScore = 5;
      newSeverity = "Critical";
      newHealthScore = Math.max(15, newHealthScore - 20);
    } else if (currentResult.risk_score === 5) {
      // Already critical, keep worsening
      newHealthScore = Math.max(5, newHealthScore - 10);
    }

    // Create deteriorated scenario
    const deterioratedResult = {
      ...currentResult,
      risk_score: newRiskScore,
      severity: newSeverity,
      message: `🚨 PROJECTED ${newDays} DAYS AHEAD (IF NOT SERVICED): ${getDeterioratedMessage(newRiskScore)}`,
      ai_summary: {
        ...currentResult.ai_summary,
        health_score: newHealthScore,
        insights: currentResult.ai_summary?.insights.map(insight => ({
          ...insight,
          severity: newRiskScore >= 5 ? 'critical' : newRiskScore >= 4 ? 'high' : 'medium',
          value: getDeterioratedValue(insight.label, newRiskScore)
        })) || []
      },
      recommendations: (currentResult.recommendations || []).map(rec => ({
        ...rec,
        urgency: newRiskScore >= 5 ? 'Critical' : newRiskScore >= 4 ? 'High' : 'Medium',
        estimated_cost: increaseCost(rec.estimated_cost, newDays / 15),
        action_needed: `⚠️ DELAYED ${newDays} DAYS: ${getDeterioratedAction(rec.component, newRiskScore)}`
      }))
    };

    setResult(deterioratedResult);
  };

  const getDeterioratedMessage = (riskScore) => {
    if (riskScore >= 5) {
      return "CRITICAL FAILURE IMMINENT. Complete breakdown risk. Multiple systems compromised. DO NOT DRIVE.";
    } else if (riskScore >= 4) {
      return "Severe deterioration detected. Safety compromised. Immediate service required to avoid complete failure.";
    }
    return "Continued neglect causing accelerated damage. Repair costs increasing significantly.";
  };

  const getDeterioratedValue = (label, riskScore) => {
    if (riskScore >= 5) return 'Critical Failure';
    if (riskScore >= 4) return 'Severe Damage';
    return 'Deteriorated';
  };

  const getDeterioratedAction = (component, riskScore) => {
    if (riskScore >= 5) {
      return `Complete ${component.toLowerCase()} system failure. Requires immediate replacement. Vehicle unsafe to operate. Towing necessary.`;
    } else if (riskScore >= 4) {
      return `${component} damage accelerating rapidly. Emergency service required within 24-48 hours. Continuing to drive risks complete failure.`;
    }
    return `${component} condition worsening. Service now to prevent more expensive repairs.`;
  };

  const increaseCost = (costString, multiplier) => {
    // Extract numbers from cost string like "₹2,500 - ₹3,500"
    const matches = costString.match(/₹([\d,]+)/g);
    if (matches && matches.length >= 2) {
      const low = parseInt(matches[0].replace(/₹|,/g, ''));
      const high = parseInt(matches[1].replace(/₹|,/g, ''));
      const factor = 1 + (multiplier * 0.5); // 50% increase per 15 days
      const newLow = Math.round(low * factor);
      const newHigh = Math.round(high * factor);
      return `₹${newLow.toLocaleString('en-IN')} - ₹${newHigh.toLocaleString('en-IN')}`;
    }
    return costString;
  };

  const handleRefresh = () => {
    if (result && result.risk_score >= 3) {
      projectFutureCondition(result);
    } else {
      fetchSuggestions();
    }
  };

  const styles = getStyles(colors);

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.error}>
          <h2 style={{ marginBottom: 16 }}>⚠️ Unable to Load Maintenance Data</h2>
          <p>{error}</p>
          <button onClick={fetchSuggestions} style={styles.refreshButton}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
  if (!result) return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.info}>
          <h2 style={{ marginBottom: 16 }}>No Data Available</h2>
          <button onClick={fetchSuggestions} style={styles.refreshButton}>
            Load Maintenance Data
          </button>
        </div>
      </div>
    </div>
  );

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'critical': return '#dc3545';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>🔧 Complete Vehicle Health Analysis</h1>
          <div style={styles.buttonGroup}>
            <button onClick={handleRefresh} style={styles.refreshButton}>
              {daysProgressed > 0 ? `+15 More Days` : result?.risk_score >= 3 ? 'Project +15 Days' : 'Refresh Analysis'}
            </button>
            {daysProgressed > 0 && (
              <button onClick={fetchSuggestions} style={styles.resetButton}>
                Reset to Current
              </button>
            )}
          </div>
        </div>
        
        {/* User-Friendly Introduction */}
        <div style={styles.introCard}>
          <h2 style={styles.introTitle}>📊 What is this analysis?</h2>
          <p style={styles.introText}>
            We've carefully examined your vehicle's condition based on its age, mileage, usage patterns, 
            and the specific road conditions in your city. This analysis helps you understand what maintenance 
            your vehicle needs right now, what can wait, and approximately how much it will cost. 
            Think of it as a health checkup for your car!
          </p>
        </div>

        {/* Projection Warning Banner */}
        {daysProgressed > 0 && (
          <div style={styles.projectionBanner}>
            <div style={styles.projectionIcon}>⏰</div>
            <div style={styles.projectionContent}>
              <strong style={styles.projectionTitle}>FUTURE PROJECTION MODE</strong>
              <p style={styles.projectionText}>
                Showing projected condition <strong>{daysProgressed} days from now</strong> if vehicle is NOT serviced. 
                Costs and damage will increase further if maintenance is delayed.
              </p>
            </div>
          </div>
        )}

        {/* Status Overview */}
        <div style={styles.statusCard}>
          <h2 style={styles.cardTitle}>🚗 Current Vehicle Health Status</h2>
          <p style={styles.cardSubtitle}>
            Based on your vehicle's current condition, here's what you need to know:
          </p>
          <div style={styles.statusGrid}>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>SEVERITY LEVEL</span>
              <span style={{
                ...styles.statusValue,
                color: getSeverityColor(result.severity)
              }}>
                {result.severity}
              </span>
              <p style={styles.statusExplanation}>
                {result.severity === 'High' && 'Your vehicle needs immediate attention. Delaying maintenance could lead to safety issues or expensive repairs.'}
                {result.severity === 'Medium' && 'Some maintenance is needed soon. Schedule service within the next few weeks to prevent problems.'}
                {result.severity === 'Low' && 'Your vehicle is in good condition! Just follow regular maintenance schedules.'}
              </p>
            </div>
            <div style={styles.statusItem}>
              <span style={styles.statusLabel}>RISK ASSESSMENT</span>
              <span style={styles.statusValue}>{result.risk_score} out of 5</span>
              <p style={styles.statusExplanation}>
                {result.risk_score >= 4 && 'High risk - Multiple components need attention. Book service as soon as possible.'}
                {result.risk_score === 3 && 'Moderate risk - Some issues detected. Plan for service in the coming weeks.'}
                {result.risk_score <= 2 && 'Low risk - Vehicle is healthy. Maintain regular service intervals.'}
              </p>
            </div>
          </div>
          {result.message && (
            <div style={styles.mainMessage}>
              <div style={styles.messageIcon}>💡</div>
              <div>
                <h3 style={styles.messageTitle}>What this means for you:</h3>
                <p style={styles.statusMessage}>{result.message}</p>
              </div>
            </div>
          )}
          {result.next_service_date && (
            <div style={styles.nextServiceCard}>
              <span style={styles.nextServiceLabel}>📅 Recommended Service Date:</span>
              <span style={styles.nextServiceDate}>
                {new Date(result.next_service_date).toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <div style={styles.recommendationsSection}>
            <h2 style={styles.sectionTitle}>🔧 Detailed Maintenance Recommendations</h2>
            <p style={styles.sectionSubtitle}>
              Here's a breakdown of what your vehicle needs. Each item includes why it's needed, 
              how urgent it is, and estimated costs so you can plan your budget.
            </p>
            <div style={styles.recommendationsList}>
              {result.recommendations.map((rec, index) => (
                <div key={index} style={styles.recommendationCard}>
                  <div style={styles.recNumber}>#{index + 1}</div>
                  <div style={styles.recHeader}>
                    <h3 style={styles.componentName}>{rec.component}</h3>
                    <span style={{
                      ...styles.urgencyBadge,
                      backgroundColor: getUrgencyColor(rec.urgency)
                    }}>
                      {rec.urgency} PRIORITY
                    </span>
                  </div>
                  
                  <div style={styles.recSection}>
                    <h4 style={styles.recSectionTitle}>📝 Why is this needed?</h4>
                    <p style={styles.recReason}>{rec.reason}</p>
                  </div>
                  
                  {rec.severity_cause && (
                    <div style={styles.recSeverity}>
                      <strong style={styles.recLabel}>🔍 What's causing the problem:</strong>
                      <p style={styles.recText}>{rec.severity_cause}</p>
                    </div>
                  )}
                  
                  {rec.action_needed && (
                    <div style={styles.recAction}>
                      <strong style={styles.recLabel}>⚡ What you should do:</strong>
                      <p style={styles.recText}>{rec.action_needed}</p>
                    </div>
                  )}
                  
                  <div style={styles.recCostSection}>
                    <div style={styles.recCostLabel}>💰 Expected Cost Range:</div>
                    <div style={styles.recCostValue}>{rec.estimated_cost}</div>
                    <p style={styles.recCostNote}>
                      * Prices may vary based on your location and service center. This is an estimated range based on typical costs in Indian markets.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Analysis */}
        {result.ai_summary && (
          <div style={styles.aiSummarySection}>
            <h2 style={styles.sectionTitle}>AI Health Insights</h2>
            
            {/* Health Score */}
            <div style={styles.healthScoreCard}>
              <div style={styles.healthScoreLabel}>Vehicle Health Score</div>
              <div style={styles.healthScoreValue}>{result.ai_summary.health_score}/100</div>
              <div style={styles.healthScoreBar}>
                <div style={{
                  ...styles.healthScoreFill,
                  width: `${result.ai_summary.health_score}%`,
                  backgroundColor: result.ai_summary.health_score > 70 ? '#28a745' : 
                                   result.ai_summary.health_score > 40 ? '#ffc107' : '#dc3545'
                }}></div>
              </div>
            </div>

            {/* Insights Grid */}
            <div style={styles.insightsGrid}>
              {(result.ai_summary.insights || []).map((insight, index) => (
                <div key={index} style={styles.insightCard}>
                  <div style={styles.insightIcon}>{insight.icon}</div>
                  <div style={styles.insightLabel}>{insight.label}</div>
                  <div style={{
                    ...styles.insightValue,
                    color: insight.severity === 'high' ? '#dc3545' : 
                           insight.severity === 'medium' ? '#ff9800' : '#28a745'
                  }}>{insight.value}</div>
                </div>
              ))}
            </div>

            {/* Maintenance Timeline */}
            <div style={styles.timelineSection}>
              <h3 style={styles.timelineTitle}>Upcoming Maintenance Timeline</h3>
              <div style={styles.timelineContainer}>
                {(result.ai_summary.maintenance_timeline || []).map((item, index) => (
                  <div key={index} style={styles.timelineItem}>
                    <div style={{
                      ...styles.timelineDot,
                      backgroundColor: item.priority === 'high' ? '#dc3545' : 
                                       item.priority === 'medium' ? '#ffc107' : '#28a745'
                    }}></div>
                    <div style={styles.timelineContent}>
                      <div style={styles.timelineDate}>{item.date}</div>
                      <div style={styles.timelineTask}>{item.task}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detailed AI Analysis - Collapsible */}
        {result.ai_analysis && (
          <details style={styles.detailsSection}>
            <summary style={styles.detailsSummary}>
              📋 View Detailed Technical Analysis
            </summary>
            <div style={styles.aiAnalysisSection}>
              <div style={styles.aiContent}>
                <pre style={styles.aiText}>{result.ai_analysis}</pre>
              </div>
            </div>
          </details>
        )}

        {/* Indian Conditions Info */}
        <div style={styles.infoCard}>
          <h3 style={styles.infoTitle}>🌏 Why Indian Roads Are Different</h3>
          <p style={styles.infoIntro}>
            Our analysis takes into account the unique challenges of driving in India. Here's what we considered:
          </p>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <div style={styles.infoItemIcon}>🕳️</div>
              <div>
                <div style={styles.infoItemTitle}>Pothole Density</div>
                <div style={styles.infoItemDesc}>Rough roads can damage suspension and alignment faster</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoItemIcon}>🌧️</div>
              <div>
                <div style={styles.infoItemTitle}>Monsoon Impact</div>
                <div style={styles.infoItemDesc}>Heavy rains affect brakes and electrical components</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoItemIcon}>💨</div>
              <div>
                <div style={styles.infoItemTitle}>Dust & Pollution</div>
                <div style={styles.infoItemDesc}>Air filters and engine parts need more frequent cleaning</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <div style={styles.infoItemIcon}>🚗</div>
              <div>
                <div style={styles.infoItemTitle}>Traffic Congestion</div>
                <div style={styles.infoItemDesc}>Stop-and-go traffic puts extra stress on brakes and transmission</div>
              </div>
            </div>
          </div>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    color: colors.text,
    margin: 0,
    letterSpacing: '-0.5px',
  },
  // New styles for enhanced UI
  introCard: {
    backgroundColor: colors.card,
    padding: 32,
    borderRadius: 8,
    marginBottom: 32,
    boxShadow: `0 2px 8px ${colors.shadow}`,
    border: `1px solid ${colors.border}`,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 16,
    marginTop: 0,
  },
  introText: {
    fontSize: 16,
    lineHeight: 1.8,
    color: colors.textSecondary,
    margin: 0,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 600,
    color: colors.text,
    marginTop: 0,
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 1.6,
  },
  statusExplanation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
    lineHeight: 1.6,
    fontStyle: 'italic',
  },
  mainMessage: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
    marginTop: 24,
    padding: 20,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
  },
  messageIcon: {
    fontSize: 28,
    flexShrink: 0,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    marginTop: 0,
    marginBottom: 8,
  },
  nextServiceCard: {
    marginTop: 24,
    padding: 20,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    border: `2px solid ${colors.brand}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  nextServiceLabel: {
    fontSize: 15,
    fontWeight: 600,
    color: colors.text,
  },
  nextServiceDate: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.brand,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 1.7,
  },
  recNumber: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: colors.brand,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
  },
  recSection: {
    marginBottom: 16,
  },
  recSectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: colors.text,
    marginTop: 0,
    marginBottom: 8,
  },
  recCostSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 6,
    border: `1px solid ${colors.border}`,
  },
  recCostLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  recCostValue: {
    fontSize: 20,
    fontWeight: 700,
    color: colors.brand,
    marginBottom: 8,
  },
  recCostNote: {
    fontSize: 12,
    color: colors.textTertiary,
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1.5,
  },
  infoIntro: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 1.6,
  },
  infoItemIcon: {
    fontSize: 32,
    marginRight: 12,
    flexShrink: 0,
  },
  infoItemTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 6,
  },
  infoItemDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 1.5,
  },
  buttonGroup: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  refreshButton: {
    padding: '12px 24px',
    backgroundColor: colors.buttonPrimary,
    color: colors.buttonPrimaryText,
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    transition: 'opacity 0.2s',
  },
  resetButton: {
    padding: '12px 24px',
    backgroundColor: '#6c757d',
    color: '#ffffff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    transition: 'opacity 0.2s',
  },
  projectionBanner: {
    backgroundColor: '#fff3cd',
    border: '2px solid #ffc107',
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
  },
  projectionIcon: {
    fontSize: 32,
    flexShrink: 0,
  },
  projectionContent: {
    flex: 1,
  },
  projectionTitle: {
    fontSize: 16,
    color: '#856404',
    fontWeight: 600,
    display: 'block',
    marginBottom: 8,
  },
  projectionText: {
    fontSize: 14,
    color: '#856404',
    margin: 0,
    lineHeight: 1.6,
  },
  statusCard: {
    backgroundColor: colors.card,
    padding: 30,
    borderRadius: 4,
    marginBottom: 24,
    boxShadow: `0 1px 3px ${colors.shadow}`,
    border: `1px solid ${colors.border}`,
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 30,
    marginBottom: 20,
  },
  statusItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  statusLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 600,
    color: colors.text,
  },
  statusMessage: {
    fontSize: 16,
    lineHeight: 1.8,
    color: colors.text,
    margin: 0,
  },
  nextService: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 15,
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 16,
    marginTop: 0,
  },
  recommendationsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 16,
  },
  recommendationCard: {
    backgroundColor: colors.card,
    padding: 28,
    borderRadius: 8,
    boxShadow: `0 2px 8px ${colors.shadow}`,
    border: `1px solid ${colors.border}`,
    position: 'relative',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  recHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  componentName: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    margin: 0,
  },
  urgencyBadge: {
    padding: '4px 12px',
    borderRadius: 2,
    color: '#fff',
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  recReason: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 1.7,
    margin: 0,
  },
  recCost: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 500,
  },
  recSeverity: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
    borderLeft: '3px solid #ef4444',
    borderRadius: 4,
  },
  recAction: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
    borderLeft: '3px solid #3b82f6',
    borderRadius: 4,
  },
  recLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 6,
    display: 'block',
  },
  recText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 1.6,
    margin: 0,
  },
  aiAnalysisSection: {
    marginBottom: 24,
  },
  aiContent: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 4,
    border: `1px solid ${colors.border}`,
  },
  aiText: {
    fontFamily: '"SF Mono", "Monaco", "Courier New", monospace',
    fontSize: 13,
    lineHeight: 1.6,
    color: colors.text,
    whiteSpace: 'pre-wrap',
    margin: 0,
  },
  infoCard: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 4,
    border: `1px solid ${colors.border}`,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 16,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 20,
  },
  infoItem: {
    fontSize: 14,
    color: colors.textSecondary,
    padding: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'flex-start',
  },
  aiSummarySection: {
    marginBottom: 24,
  },
  healthScoreCard: {
    backgroundColor: colors.card,
    padding: 32,
    borderRadius: 8,
    marginBottom: 24,
    boxShadow: `0 2px 8px ${colors.shadow}`,
    border: `1px solid ${colors.border}`,
    textAlign: 'center',
  },
  healthScoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  healthScoreValue: {
    fontSize: 48,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 16,
  },
  healthScoreBar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    maxWidth: 400,
    margin: '0 auto',
  },
  healthScoreFill: {
    height: '100%',
    transition: 'width 0.5s ease',
    borderRadius: 6,
  },
  insightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  insightCard: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 8,
    boxShadow: `0 2px 6px ${colors.shadow}`,
    border: `1px solid ${colors.border}`,
    textAlign: 'center',
    transition: 'transform 0.2s',
    cursor: 'default',
  },
  insightIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  insightLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 600,
  },
  timelineSection: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 20,
  },
  timelineContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    paddingLeft: 8,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    marginTop: 4,
    flexShrink: 0,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  timelineTask: {
    fontSize: 15,
    fontWeight: 500,
    color: colors.text,
  },
  detailsSection: {
    backgroundColor: colors.card,
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    padding: 4,
    marginBottom: 24,
  },
  detailsSummary: {
    padding: 16,
    fontSize: 16,
    fontWeight: 500,
    color: colors.text,
    cursor: 'pointer',
    listStyle: 'none',
    userSelect: 'none',
  },
  error: {
    maxWidth: 600,
    margin: '50px auto',
    padding: 30,
    backgroundColor: colors.card,
    color: '#dc3545',
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 15,
    border: '1px solid #f5c6cb',
  },
  info: {
    maxWidth: 600,
    margin: '50px auto',
    padding: 30,
    backgroundColor: colors.card,
    color: colors.textSecondary,
    borderRadius: 4,
    textAlign: 'center',
    fontSize: 15,
    border: `1px solid ${colors.border}`,
  },
});

// Mobile responsive styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .refreshButton:hover {
      opacity: 0.9;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 20px 16px !important;
      }
      .header {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 16px !important;
      }
      .title {
        font-size: 24px !important;
      }
      .refreshButton {
        width: 100% !important;
      }
      .statusCard {
        padding: 20px !important;
      }
      .statusGrid {
        grid-template-columns: 1fr !important;
        gap: 20px !important;
      }
      .recommendationsList {
        grid-template-columns: 1fr !important;
      }
      .infoGrid {
        grid-template-columns: 1fr 1fr !important;
      }
    }
  `;
  if (!document.head.querySelector('[data-maintenance-styles]')) {
    styleSheet.setAttribute('data-maintenance-styles', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default MaintenanceSuggestions;