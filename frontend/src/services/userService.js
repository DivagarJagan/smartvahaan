import api from "./api";

// Get user profile from localStorage or API
const getProfile = async () => {
  try {
    // Try to get from localStorage first
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    if (userEmail) {
      // Parse name if available
      let first_name = '';
      let last_name = '';
      if (userName) {
        const nameParts = userName.split(' ');
        first_name = nameParts[0] || '';
        last_name = nameParts.slice(1).join(' ') || '';
      }
      
      return {
        email: userEmail,
        first_name,
        last_name,
        phone: localStorage.getItem('userPhone') || ''
      };
    }
    
    // Fallback to API call
    const response = await api.get("/users/profile");
    return response.data;
  } catch (error) {
    console.error('Failed to get profile:', error);
    // Return empty profile
    return {
      email: '',
      first_name: '',
      last_name: '',
      phone: ''
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
