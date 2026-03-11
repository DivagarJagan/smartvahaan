import api from './api';

const saveVehicle = async (data) => {
  try {
    // Map the frontend field names to backend schema
    const vehicleData = {
      make: data.make,
      model: data.model,
      year: parseInt(data.year),
      fuel_type: data.fuelType,
      city: data.city,
      mileage: parseInt(data.mileage) || 0,
      last_service_date: data.lastServiceDate || null,
      usage_pattern: data.usagePattern || "Regular",
      registration_number: data.registrationNumber || null,
      owner_name: data.ownerName || null
    };
    
    // Call the backend API
    const response = await api.post('/vehicles/', vehicleData);
    
    // Store vehicle info in localStorage for feedback service
    const vehicleInfo = `${data.year} ${data.make} ${data.model} (${data.fuelType})`;
    localStorage.setItem('userVehicle', vehicleInfo);
    
    return response.data;
  } catch (error) {
    console.error('Error saving vehicle:', error);
    
    // Fallback to localStorage if backend is unavailable
    const vehicleInfo = `${data.year} ${data.make} ${data.model} (${data.fuelType})`;
    localStorage.setItem('userVehicle', vehicleInfo);
    
    return data;
  }
};

const getVehicles = async () => {
  try {
    const response = await api.get('/vehicles/');
    return response.data.vehicles || [];
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
};

export default { saveVehicle, getVehicles };