import api from "./api";

// Get user profile from API (always fetch live data to get accurate is_premium status)
const getProfile = async () => {
  try {
    // Always call the API to get live premium status
    const response = await api.get("/users/profile");
    const apiData = response.data;

    // Also persist name/phone to localStorage for offline use
    if (apiData.first_name || apiData.last_name) {
      localStorage.setItem('userName', `${apiData.first_name} ${apiData.last_name}`.trim());
    }
    if (apiData.phone) {
      localStorage.setItem('userPhone', apiData.phone);
    }
    if (apiData.is_premium !== undefined) {
      localStorage.setItem('isPremium', String(apiData.is_premium));
    }
    if (apiData.premium_until) {
      localStorage.setItem('premiumUntil', apiData.premium_until);
    } else if (apiData.premium_until === null) {
      localStorage.removeItem('premiumUntil');
    }

    return apiData;
  } catch (error) {
    console.error('Failed to get profile from API, falling back to localStorage:', error);
    // Fallback: reconstruct from localStorage
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    let first_name = '';
    let last_name = '';
    if (userName) {
      const nameParts = userName.split(' ');
      first_name = nameParts[0] || '';
      last_name = nameParts.slice(1).join(' ') || '';
    }
    return {
      email: userEmail || '',
      first_name,
      last_name,
      phone: localStorage.getItem('userPhone') || '',
      is_premium: localStorage.getItem('isPremium') === 'true',
      premium_until: localStorage.getItem('premiumUntil') || null
    };
  }
};

// Update user profile in localStorage and return updated data
const updateProfile = async (profileData) => {
  // Update localStorage with new values
  if (profileData.email) {
    localStorage.setItem('userEmail', profileData.email);
  }
  
  if (profileData.first_name || profileData.last_name) {
    const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
    localStorage.setItem('userName', fullName);
  }
  
  if (profileData.phone) {
    localStorage.setItem('userPhone', profileData.phone);
  }
  
  // Try to update via API as well (if backend is available)
  try {
    const response = await api.put("/users/profile", profileData);
    return response.data;
  } catch (apiError) {
    // If API fails, return the profileData as success (localStorage is already updated)
    console.log('API not available, using localStorage only');
  }
  
  // Return the updated profile data
  return {
    email: profileData.email,
    first_name: profileData.first_name,
    last_name: profileData.last_name,
    phone: profileData.phone
  };
};

export default {
  getProfile,
  updateProfile,
};
