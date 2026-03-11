/**
 * Activity Tracker Utility
 * Tracks user activities in localStorage for User History page
 */

export const ActivityTypes = {
  LOGIN: 'login',
  VEHICLE_ADDED: 'vehicle_added',
  ANALYSIS_REQUESTED: 'analysis_requested',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  PROFILE_UPDATED: 'profile_updated',
};

/**
 * Track a user activity
 * @param {string} type - Activity type from ActivityTypes
 * @param {string} title - Activity title
 * @param {string} description - Activity description
 * @param {object} details - Additional details
 */
export const trackActivity = (type, title, description = '', details = null) => {
  try {
    // Get existing activity log
    const activityLog = JSON.parse(localStorage.getItem('userActivityLog') || '[]');
    
    // Create new activity entry
    const activity = {
      type,
      title,
      description,
      details,
      timestamp: new Date().toISOString(),
    };
    
    // Add to beginning of array (newest first)
    activityLog.unshift(activity);
    
    // Keep only last 50 activities
    const trimmedLog = activityLog.slice(0, 50);
    
    // Save back to localStorage
    localStorage.setItem('userActivityLog', JSON.stringify(trimmedLog));
    
    // Update counters
    updateActivityCounters(type);
    
    return true;
  } catch (error) {
    console.error('Error tracking activity:', error);
    return false;
  }
};

/**
 * Update activity counters
 * @param {string} type - Activity type
 */
const updateActivityCounters = (type) => {
  try {
    switch (type) {
      case ActivityTypes.LOGIN:
        const loginCount = parseInt(localStorage.getItem('loginCount') || '0');
        localStorage.setItem('loginCount', (loginCount + 1).toString());
        localStorage.setItem('lastLoginDate', new Date().toISOString());
        break;
        
      case ActivityTypes.VEHICLE_ADDED:
        const vehicleCount = parseInt(localStorage.getItem('vehicleCount') || '0');
        localStorage.setItem('vehicleCount', (vehicleCount + 1).toString());
        break;
        
      case ActivityTypes.ANALYSIS_REQUESTED:
        const analysisCount = parseInt(localStorage.getItem('analysisCount') || '0');
        localStorage.setItem('analysisCount', (analysisCount + 1).toString());
        break;
        
      case ActivityTypes.FEEDBACK_SUBMITTED:
        const feedbackCount = parseInt(localStorage.getItem('feedbackCount') || '0');
        localStorage.setItem('feedbackCount', (feedbackCount + 1).toString());
        break;
    }
  } catch (error) {
    console.error('Error updating counters:', error);
  }
};

/**
 * Initialize member since date if not exists
 */
export const initializeMemberDate = () => {
  try {
    if (!localStorage.getItem('memberSince')) {
      localStorage.setItem('memberSince', new Date().toISOString());
    }
  } catch (error) {
    console.error('Error initializing member date:', error);
  }
};

/**
 * Clear all activity history (for testing or reset)
 */
export const clearActivityHistory = () => {
  try {
    localStorage.removeItem('userActivityLog');
    localStorage.removeItem('loginCount');
    localStorage.removeItem('vehicleCount');
    localStorage.removeItem('analysisCount');
    localStorage.removeItem('feedbackCount');
    localStorage.removeItem('memberSince');
    localStorage.removeItem('lastLoginDate');
    return true;
  } catch (error) {
    console.error('Error clearing activity history:', error);
    return false;
  }
};

export default {
  trackActivity,
  initializeMemberDate,
  clearActivityHistory,
  ActivityTypes,
};
