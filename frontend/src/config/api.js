export const getApiUrl = (path = '') => {
  const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://${host}:3000/api${cleanPath}`;
};
