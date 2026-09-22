import { createContext, useContext, useState } from "react";
import authService from "../services/authService";
import emailService from "../services/emailService";
import userService from "../services/userService";
import { trackActivity, initializeMemberDate, ActivityTypes } from "../utils/activityTracker";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    
    // Fetch full user profile to get first_name and last_name
    try {
      const profile = await userService.getProfile();
      // Merge profile data with login data
      const fullUserData = {
        ...data,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        is_premium: profile.is_premium || false,
        premium_until: profile.premium_until || null
      };
      setUser(fullUserData);
      
      // Store user info in localStorage for feedback service
      localStorage.setItem('userEmail', fullUserData.email);
      localStorage.setItem('isPremium', fullUserData.is_premium.toString());
      
      // Generate full name or default from email
      const userName = fullUserData.first_name && fullUserData.last_name 
        ? `${fullUserData.first_name} ${fullUserData.last_name}` 
        : fullUserData.email.split('@')[0].replace(/[._-]/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      localStorage.setItem('userName', userName);
      
      // Check if this is first login (member since doesn't exist)
      const isFirstLogin = !localStorage.getItem('memberSince');
      
      // Initialize member date if first time
      initializeMemberDate();
      
      // Track login activity
      trackActivity(
        ActivityTypes.LOGIN,
        'Logged In',
        `Logged in as ${fullUserData.email}`,
        { email: fullUserData.email }
      );
      
      // Send welcome email on first login
      if (isFirstLogin) {
        emailService.sendWelcomeEmail(fullUserData.email, userName)
          .then(() => {
            console.log('Welcome email sent successfully');
          })
          .catch((error) => {
            console.error('Failed to send welcome email:', error);
            // Don't block login flow if email fails
          });
      }
    } catch (profileError) {
      // If profile fetch fails, use basic login data
      console.error('Failed to fetch profile:', profileError);
      setUser(data);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('isPremium', 'false');
      const defaultName = data.email.split('@')[0].replace(/[._-]/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      localStorage.setItem('userName', defaultName);
      initializeMemberDate();
      trackActivity(ActivityTypes.LOGIN, 'Logged In', `Logged in as ${data.email}`, { email: data.email });
    }
  };

  const updateUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    
    // Update localStorage if name changed
    if (updated.first_name && updated.last_name) {
      localStorage.setItem('userName', `${updated.first_name} ${updated.last_name}`);
    }
    if (updated.email) {
      localStorage.setItem('userEmail', updated.email);
    }
    if (updated.phone) {
      localStorage.setItem('userPhone', updated.phone);
    }
    if (updated.is_premium !== undefined) {
      localStorage.setItem('isPremium', String(updated.is_premium));
    }
    if (updated.premium_until !== undefined) {
      if (updated.premium_until) {
        localStorage.setItem('premiumUntil', updated.premium_until);
      } else {
        localStorage.removeItem('premiumUntil');
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);