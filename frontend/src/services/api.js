import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add auth token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  signup: (mobileNumber) => API.post('/auth/signup', { mobile: mobileNumber }),
  login: (mobileNumber) => API.post('/auth/login', { mobile: mobileNumber }),
  verifyOtp: (mobileNumber, otp) => API.post('/auth/verify-otp', { mobile: mobileNumber, otp })
};

// User services
export const userService = {
  findByMobile: (mobile) => API.get(`/users/${mobile}`),
  getChats: () => API.get('/users/chats')
};

// Message services
export const messageService = {
  sendMessage: (receiverMobile, text) => API.post('/messages', { receiver: receiverMobile, text }),
  getMessages: (otherUserMobile) => API.get(`/messages/${otherUserMobile}`)
};

export default API;