import api from './api';

/**
 * Get all service history records for the current user
 */
const getServiceHistory = async () => {
  try {
    const response = await api.get('/service-history/all');
    return response.data.services || [];
  } catch (error) {
    console.error('Error fetching service history:', error);
    return [];
  }
};

/**
 * Get service history for a specific vehicle
 */
const getVehicleServiceHistory = async (vehicleId) => {
  try {
    const response = await api.get(`/service-history/vehicle/${vehicleId}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching vehicle service history:', error);
    return [];
  }
};

/**
 * Add a new service record
 */
const addServiceRecord = async (serviceData) => {
  try {
    const response = await api.post('/service-history/add', serviceData);
    return response.data;
  } catch (error) {
    console.error('Error adding service record:', error);
    throw error;
  }
};

export default { 
  getServiceHistory, 
  getVehicleServiceHistory,
  addServiceRecord 
};
