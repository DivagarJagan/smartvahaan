import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import adminService from "../services/adminService";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminReports() {
  const { colors } = useTheme();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await adminService.getAdminDashboardData();
        setReports(data);
      } catch (err) {
        setError("Failed to fetch reports. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const styles = {
    container: {
      padding: "20px",
      backgroundColor: colors.background,
      color: colors.text,
    },
    title: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "20px",
      color: colors.text,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
    },
    card: {
      backgroundColor: colors.card,
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "10px",
      color: colors.textSecondary,
    },
    cardValue: {
      fontSize: "32px",
      fontWeight: "bold",
      color: colors.text,
    },
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Reports</h1>
      {reports && (
        <div style={styles.grid}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Total Users</h2>
            <p style={styles.cardValue}>{reports.total_users}</p>
          </div>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Premium Users</h2>
            <p style={styles.cardValue}>{reports.premium_users}</p>
          </div>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Total Vehicles</h2>
            <p style={styles.cardValue}>{reports.total_vehicles}</p>
          </div>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Total Service Records</h2>
            <p style={styles.cardValue}>{reports.total_service_history}</p>
          </div>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Total Feedback</h2>
            <p style={styles.cardValue}>{reports.total_feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}
