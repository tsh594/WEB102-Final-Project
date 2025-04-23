import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth'; // Replace with your backend API

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};