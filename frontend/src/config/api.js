const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://first-assist.onrender.com/api';

export const getApiUrl = (path = '') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
