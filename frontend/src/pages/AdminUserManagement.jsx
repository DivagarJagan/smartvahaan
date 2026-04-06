import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import adminService from "../services/adminService";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminUserManagement() {
  const { colors } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminService.getAllUsers();
        setUsers(data);
      } catch (err) {
        setError("Failed to fetch users. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
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
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      backgroundColor: colors.card,
      color: colors.text,
      padding: "12px",
      textAlign: "left",
      borderBottom: `2px solid ${colors.border}`,
    },
    td: {
      padding: "12px",
      borderBottom: `1px solid ${colors.border}`,
    },
    premium: {
      color: "green",
      fontWeight: "bold",
    },
    standard: {
      color: colors.textSecondary,
    },
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>User Management</h1>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Full Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Subscription</th>
            <th style={styles.th}>Premium Until</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={styles.td}>{user.id}</td>
              <td style={styles.td}>{user.full_name}</td>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}>{user.role}</td>
              <td style={user.is_premium ? styles.premium : styles.standard}>
                {user.is_premium ? "Premium" : "Standard"}
              </td>
              <td style={styles.td}>
                {user.premium_until
                  ? new Date(user.premium_until).toLocaleDateString()
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
