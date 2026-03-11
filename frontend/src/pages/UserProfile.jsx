import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import userService from "../services/userService";

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [profile, setProfile] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [originalProfile, setOriginalProfile] = useState({});

  useEffect(() => {
    // Load profile from localStorage
    const loadProfile = async () => {
      try {
        const profileData = await userService.getProfile();
        setProfile(profileData);
        setOriginalProfile(profileData);
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Fallback to user from context
        if (user) {
          const userProfile = {
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email || "",
            phone: user.phone || "",
          };
          setProfile(userProfile);
          setOriginalProfile(userProfile);
        }
      }
    };
    
    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      // Save to backend
      const updatedUser = await userService.updateProfile(profile);
      
      // Update user in context
      if (updateUser) {
        updateUser(updatedUser);
      }
      
      setOriginalProfile(profile);
      setIsEditing(false);
      
      // Show success message
      const successMsg = `Profile updated successfully!\n\n✓ Name: ${profile.first_name} ${profile.last_name}\n✓ Email: ${profile.email}\n✓ Phone: ${profile.phone || 'Not provided'}`;
      alert(successMsg);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const styles = getStyles(colors);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Profile</h1>
          <p style={styles.subtitle}>Manage your personal information</p>
        </div>
        {!isEditing && (
          <button 
            onClick={handleEdit} 
            onMouseEnter={() => setHoveredButton('edit')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              ...styles.editButton,
              ...(hoveredButton === 'edit' && styles.editButtonHover)
            }}
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div style={styles.card}>
        {/* Avatar Section */}
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            {profile.first_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={styles.roleInfo}>
            <div style={styles.roleBadge}>
              {user?.role === "admin" ? "👨‍💼 Administrator" : "🚗 Vehicle Owner"}
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div style={styles.formSection}>
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>First Name</label>
              <input
                type="text"
                name="first_name"
                value={profile.first_name}
                onChange={handleChange}
                disabled={!isEditing}
                style={{
                  ...styles.input,
                  ...(isEditing ? styles.inputEditing : styles.inputDisabled),
                }}
                placeholder="Enter first name"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={profile.last_name}
                onChange={handleChange}
                disabled={!isEditing}
                style={{
                  ...styles.input,
                  ...(isEditing ? styles.inputEditing : styles.inputDisabled),
                }}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!isEditing}
              style={{
                ...styles.input,
                ...(isEditing ? styles.inputEditing : styles.inputDisabled),
              }}
              placeholder="Enter email address"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isEditing}
              style={{
                ...styles.input,
                ...(isEditing ? styles.inputEditing : styles.inputDisabled),
              }}
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div style={styles.actionButtons}>
              <button 
                onClick={handleCancel} 
                onMouseEnter={() => setHoveredButton('cancel')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  ...styles.cancelButton,
                  ...(hoveredButton === 'cancel' && styles.cancelButtonHover)
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                onMouseEnter={() => setHoveredButton('save')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  ...styles.saveButton,
                  ...(hoveredButton === 'save' && styles.saveButtonHover)
                }}
              >
                💾 Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div style={styles.infoGrid}>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>🔐</div>
          <div style={styles.infoTitle}>Secure Data</div>
          <div style={styles.infoText}>
            Your information is encrypted and securely stored
          </div>
        </div>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>🛡️</div>
          <div style={styles.infoTitle}>Privacy Protected</div>
          <div style={styles.infoText}>
            We never share your data with third parties
          </div>
        </div>
        <div style={styles.infoCard}>
          <div style={styles.infoIcon}>📞</div>
          <div style={styles.infoTitle}>24/7 Support</div>
          <div style={styles.infoText}>
            Contact us anytime for assistance
          </div>
        </div>
      </div>
    </div>
  );
};

const getStyles = (colors) => ({
  container: {
    padding: "30px",
    maxWidth: "900px",
    margin: "0 auto",
    minHeight: "100vh",
    background: colors.background,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color: colors.text,
    marginBottom: "5px",
  },
  subtitle: {
    fontSize: "16px",
    color: colors.textSecondary,
  },
  editButton: {
    padding: "12px 24px",
    background: `linear-gradient(135deg, ${colors.brand} 0%, ${colors.brandDark} 100%)`,
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: `0 4px 15px ${colors.brand}50`,
    transition: "all 0.3s ease",
  },
  editButtonHover: {
    transform: "translateY(-2px)",
    boxShadow: `0 6px 20px ${colors.brand}70`,
  },
  card: {
    background: colors.card,
    borderRadius: "16px",
    boxShadow: `0 4px 20px ${colors.shadow}`,
    overflow: "hidden",
    marginBottom: "30px",
    border: `1px solid ${colors.border}`,
  },
  avatarSection: {
    background: `linear-gradient(135deg, ${colors.brand} 0%, ${colors.brandDark} 100%)`,
    padding: "40px",
    textAlign: "center",
    color: "white",
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "white",
    color: colors.brand,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
    fontWeight: "bold",
    margin: "0 auto 20px",
    border: "4px solid rgba(255, 255, 255, 0.3)",
  },
  roleInfo: {
    marginTop: "15px",
  },
  roleBadge: {
    display: "inline-block",
    padding: "8px 20px",
    background: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
  },
  formSection: {
    padding: "40px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: colors.text,
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    fontSize: "15px",
    borderRadius: "10px",
    border: `2px solid ${colors.border}`,
    fontFamily: "inherit",
    transition: "all 0.3s ease",
    background: colors.backgroundSecondary,
    color: colors.text,
  },
  inputEditing: {
    borderColor: colors.brand,
    background: colors.card,
  },
  inputDisabled: {
    background: colors.backgroundSecondary,
    color: colors.textSecondary,
    cursor: "not-allowed",
  },
  actionButtons: {
    display: "flex",
    gap: "15px",
    marginTop: "30px",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: "12px 30px",
    background: colors.backgroundSecondary,
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  cancelButtonHover: {
    background: colors.card,
    transform: "translateY(-2px)",
  },
  saveButton: {
    padding: "12px 30px",
    background: `linear-gradient(135deg, ${colors.brand} 0%, ${colors.brandDark} 100%)`,
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: `0 4px 15px ${colors.brand}50`,
    transition: "all 0.3s ease",
  },
  saveButtonHover: {
    transform: "translateY(-2px)",
    boxShadow: `0 6px 20px ${colors.brand}70`,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  infoCard: {
    background: colors.card,
    padding: "25px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: `0 4px 15px ${colors.shadow}`,
    border: `1px solid ${colors.border}`,
  },
  infoIcon: {
    fontSize: "36px",
    marginBottom: "15px",
  },
  infoTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: colors.text,
    marginBottom: "8px",
  },
  infoText: {
    fontSize: "14px",
    color: colors.textSecondary,
    lineHeight: "1.5",
  },
});

export default UserProfile;
