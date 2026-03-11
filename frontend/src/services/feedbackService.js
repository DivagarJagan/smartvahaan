import api from './api';

// LocalStorage key for feedback
const FEEDBACK_STORAGE_KEY = 'smartvahaan_feedback';

// Get all feedback from localStorage
const getFeedbackFromStorage = () => {
  try {
    const storedFeedback = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return storedFeedback ? JSON.parse(storedFeedback) : [];
  } catch (error) {
    console.error('Error reading feedback from storage:', error);
    return [];
  }
};

// Save feedback to localStorage
const saveFeedbackToStorage = (feedback) => {
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedback));
  } catch (error) {
    console.error('Error saving feedback to storage:', error);
  }
};

const submitFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/feedback/submit', feedbackData);
    return response.data;
  } catch (error) {
    console.error('Backend unavailable, saving to localStorage:', error);
    
    // Get current user info from localStorage
    const userEmail = localStorage.getItem('userEmail') || 'anonymous@example.com';
    const userName = localStorage.getItem('userName') || 'Anonymous User';
    const userVehicle = localStorage.getItem('userVehicle') || null;
    
    // Create feedback entry
    const newFeedback = {
      id: Date.now(),
      user_id: Date.now(),
      user_name: userName,
      user_email: userEmail,
      vehicle_info: userVehicle,
      rating: feedbackData.rating,
      category: feedbackData.category,
      message: feedbackData.message,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Get existing feedback and add new one
    const allFeedback = getFeedbackFromStorage();
    allFeedback.unshift(newFeedback); // Add to beginning
    saveFeedbackToStorage(allFeedback);
    
    return {
      message: 'Feedback submitted successfully',
      feedback: newFeedback
    };
  }
};

const getMyFeedback = async () => {
  try {
    const response = await api.get('/feedback/my-feedback');
    return response.data;
  } catch (error) {
    console.error('Backend unavailable, reading from localStorage:', error);
    
    const userEmail = localStorage.getItem('userEmail') || 'anonymous@example.com';
    const allFeedback = getFeedbackFromStorage();
    
    // Filter feedback for current user
    const myFeedback = allFeedback.filter(fb => fb.user_email === userEmail);
    
    return {
      feedbacks: myFeedback
    };
  }
};

const getAllFeedback = async (skip = 0, limit = 50) => {
  try {
    const response = await api.get('/feedback/all', {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Backend unavailable, reading all feedback from localStorage:', error);
    
    const allFeedback = getFeedbackFromStorage();
    
    // Sort by created_at descending (newest first)
    const sortedFeedback = allFeedback.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    return {
      feedbacks: sortedFeedback.slice(skip, skip + limit),
      total: sortedFeedback.length
    };
  }
};

const updateFeedback = async (feedbackId, updateData) => {
  try {
    const response = await api.put(`/feedback/${feedbackId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }
};

const getFeedbackStats = async () => {
  try {
    const response = await api.get('/feedback/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    throw error;
  }
};

export default {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
  updateFeedback,
  getFeedbackStats
};
