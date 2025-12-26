const isDevelopment = import.meta.env.MODE === 'development';

const API_BASE_URL = isDevelopment 
  ? '' 
  : 'https://pulsegen.onrender.com/api';
export default API_BASE_URL;