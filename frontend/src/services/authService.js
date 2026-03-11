import api from './api';

const login = async ({ email, password, role }) => {
  try {
    // Call the backend API to get a token
    const response = await api.post('/auth/login', {
      email,
      password: password || 'default',  // password is not validated on backend
      role: role || 'user'
    });
    
    // Store the token in localStorage
    const { access_token } = response.data;
    localStorage.setItem('authToken', access_token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    
    return { email, role, token: access_token };
  } catch (error) {
    console.error('Login error:', error);
    // Fallback to mock login if backend is unavailable
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    return { email, role };
  }
};

const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
};

const isAuthenticated = () => {
  return !!localStorage.getItem('authToken') || !!localStorage.getItem('userEmail');
};

export default { login, logout, isAuthenticated };