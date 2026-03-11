import api from './api';

// Mock data generator
const generateMockDashboard = () => {
  return {
    user_stats: {
      total: 147,
      new_this_week: 12,
      active_users: 128,
      inactive_users: 19
    },
    vehicle_stats: {
      total: 203,
      avg_per_user: 1.4,
      by_make: {
        'Maruti': 67,
        'Hyundai': 45,
        'Tata': 32,
        'Honda': 28,
        'Others': 31
      }
    },
    feedback_stats: {
      total: 89,
      average_rating: 4.3,
      pending: 7,
      addressed: 82
    },
    maintenance_stats: {
      total_services: 456,
      upcoming: 34,
      overdue: 8
    },
    recent_activity: {
      recent_users: [
        { id: 1, email: 'rajesh.kumar@example.com', role: 'user', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 2, email: 'priya.sharma@example.com', role: 'user', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 3, email: 'amit.patel@example.com', role: 'user', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 4, email: 'sneha.reddy@example.com', role: 'user', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 5, email: 'vikram.singh@example.com', role: 'admin', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      recent_feedback: [
        { id: 1, rating: 5, category: 'AI Accuracy', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 2, rating: 4, category: 'User Interface', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 3, rating: 5, category: 'Cost Savings', created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 4, rating: 3, category: 'Feature Request', created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() }
      ]
    }
  };
};

const generateMockUsers = () => {
  return {
    users: [
      { id: 1, email: 'rajesh.kumar@example.com', first_name: 'Rajesh', last_name: 'Kumar', role: 'user', created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), feedback_count: 3, vehicle_count: 2 },
      { id: 2, email: 'priya.sharma@example.com', first_name: 'Priya', last_name: 'Sharma', role: 'user', created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), feedback_count: 1, vehicle_count: 1 },
      { id: 3, email: 'amit.patel@example.com', first_name: 'Amit', last_name: 'Patel', role: 'user', created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), feedback_count: 2, vehicle_count: 1 },
      { id: 4, email: 'sneha.reddy@example.com', first_name: 'Sneha', last_name: 'Reddy', role: 'user', created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), feedback_count: 4, vehicle_count: 3 },
      { id: 5, email: 'vikram.singh@example.com', first_name: 'Vikram', last_name: 'Singh', role: 'admin', created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), feedback_count: 0, vehicle_count: 0 },
      { id: 6, email: 'anjali.mehta@example.com', first_name: 'Anjali', last_name: 'Mehta', role: 'user', created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), feedback_count: 2, vehicle_count: 1 },
      { id: 7, email: 'rohit.verma@example.com', first_name: 'Rohit', last_name: 'Verma', role: 'user', created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), feedback_count: 5, vehicle_count: 2 },
      { id: 8, email: 'kavita.desai@example.com', first_name: 'Kavita', last_name: 'Desai', role: 'user', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), feedback_count: 1, vehicle_count: 1 },
      { id: 9, email: 'suresh.nair@example.com', first_name: 'Suresh', last_name: 'Nair', role: 'user', created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), feedback_count: 7, vehicle_count: 3 },
      { id: 10, email: 'deepika.joshi@example.com', first_name: 'Deepika', last_name: 'Joshi', role: 'user', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), feedback_count: 0, vehicle_count: 1 }
    ],
    total: 147
  };
};

const generateMockVehicles = () => {
  return {
    vehicles: [
      { id: 1, user_id: 1, owner_name: 'Rajesh Kumar', make: 'Maruti', model: 'Swift', year: 2020, odometer: 45000, registration_number: 'MH02CA1234', city: 'Mumbai', last_service: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 2, user_id: 1, owner_name: 'Rajesh Kumar', make: 'Honda', model: 'City', year: 2018, odometer: 65000, registration_number: 'MH02CB5678', city: 'Mumbai', last_service: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 3, user_id: 2, owner_name: 'Priya Sharma', make: 'Hyundai', model: 'i20', year: 2021, odometer: 28000, registration_number: 'DL03CC9876', city: 'Delhi', last_service: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 4, user_id: 3, owner_name: 'Amit Patel', make: 'Tata', model: 'Nexon', year: 2022, odometer: 15000, registration_number: 'GJ01CD4567', city: 'Ahmedabad', last_service: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 5, user_id: 4, owner_name: 'Sneha Reddy', make: 'Maruti', model: 'Baleno', year: 2019, odometer: 72000, registration_number: 'TS09CE1111', city: 'Hyderabad', last_service: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 6, user_id: 4, owner_name: 'Sneha Reddy', make: 'Honda', model: 'Amaze', year: 2020, odometer: 55000, registration_number: 'TS09CF2222', city: 'Hyderabad', last_service: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 7, user_id: 4, owner_name: 'Sneha Reddy', make: 'Hyundai', model: 'Creta', year: 2021, odometer: 38000, registration_number: 'TS09CG3333', city: 'Hyderabad', last_service: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 8, user_id: 6, owner_name: 'Anjali Mehta', make: 'Maruti', model: 'Vitara Brezza', year: 2020, odometer: 48000, registration_number: 'KA03CH7890', city: 'Bangalore', last_service: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 9, user_id: 7, owner_name: 'Rohit Verma', make: 'Tata', model: 'Tiago', year: 2019, odometer: 68000, registration_number: 'UP16CI4321', city: 'Noida', last_service: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 10, user_id: 7, owner_name: 'Rohit Verma', make: 'Honda', model: 'Jazz', year: 2018, odometer: 82000, registration_number: 'UP16CJ8765', city: 'Noida', last_service: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 11, user_id: 8, owner_name: 'Kavita Desai', make: 'Hyundai', model: 'Venue', year: 2022, odometer: 12000, registration_number: 'MH14CK5432', city: 'Pune', last_service: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 12, user_id: 9, owner_name: 'Suresh Nair', make: 'Maruti', model: 'Ertiga', year: 2017, odometer: 95000, registration_number: 'KL07CL9876', city: 'Kochi', last_service: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 13, user_id: 9, owner_name: 'Suresh Nair', make: 'Toyota', model: 'Innova', year: 2016, odometer: 110000, registration_number: 'KL07CM1234', city: 'Kochi', last_service: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 14, user_id: 9, owner_name: 'Suresh Nair', make: 'Mahindra', model: 'Scorpio', year: 2015, odometer: 125000, registration_number: 'KL07CN5678', city: 'Kochi', last_service: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 15, user_id: 10, owner_name: 'Deepika Joshi', make: 'Tata', model: 'Altroz', year: 2023, odometer: 5000, registration_number: 'RJ14CO9999', city: 'Jaipur', last_service: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    total: 203
  };
};

const getDashboard = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin dashboard, using mock data:', error);
    return generateMockDashboard();
  }
};

const getAllUsers = async (skip = 0, limit = 50) => {
  try {
    const response = await api.get('/admin/users', {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching users, using mock data:', error);
    return generateMockUsers();
  }
};

const getUserDetails = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

const updateUser = async (userId, updateData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

const getStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

const getAllVehicles = async (skip = 0, limit = 50) => {
  try {
    const response = await api.get('/admin/vehicles', {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles, using mock data:', error);
    return generateMockVehicles();
  }
};

export default {
  getDashboard,
  getAllUsers,
  getAllVehicles,
  getUserDetails,
  updateUser,
  deleteUser,
  getStats
};
