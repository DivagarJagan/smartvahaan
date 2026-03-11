import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.body.style.backgroundColor = isDark ? '#0a1628' : '#FFFFFF';
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    isDark,
    colors: {
      // Professional Theme
      // Light Mode: Pure White background with Black text
      // Dark Mode: Dark Blue Navy background with White text (matches header)
      
      // Background colors
      background: isDark ? '#0a1628' : '#FFFFFF',
      backgroundSecondary: isDark ? '#0f1f38' : '#f8f8f8',
      
      // Text colors - High contrast
      text: isDark ? '#f1f5f9' : '#000000',
      textSecondary: isDark ? '#94a3b8' : '#4d4d4d',
      textTertiary: isDark ? '#64748b' : '#666666',
      
      // Border colors
      border: isDark ? '#1e3a5f' : '#e6e6e6',
      borderHover: isDark ? '#2563eb' : '#cccccc',
      
      // Brand colors - Blue accents
      brand: isDark ? '#3b82f6' : '#2563eb',
      brandLight: isDark ? '#60a5fa' : '#3b82f6',
      brandDark: isDark ? '#2563eb' : '#1e40af',
      brandInverse: isDark ? '#ffffff' : '#ffffff',
      
      // Button colors
      buttonPrimary: isDark ? '#3b82f6' : '#2563eb',
      buttonPrimaryHover: isDark ? '#2563eb' : '#1e40af',
      buttonPrimaryText: '#FFFFFF',
      buttonSecondary: isDark ? 'transparent' : 'transparent',
      buttonSecondaryText: isDark ? '#3b82f6' : '#2563eb',
      
      // Card colors
      card: isDark ? '#0f1f38' : '#FFFFFF',
      cardHover: isDark ? '#1a2942' : '#fafafa',
      
      // Accent colors
      accent: isDark ? '#3b82f6' : '#2563eb',
      accentLight: isDark ? '#60a5fa' : '#93c5fd',
      accentDark: isDark ? '#1e40af' : '#1e3a8a',
      
      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Shadow
      shadow: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      shadowMedium: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0, 0, 0, 0.12)',
      shadowLarge: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 0, 0, 0.16)',
    }
  };

  return (
    <ThemeContext.Provider value={{ ...theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
