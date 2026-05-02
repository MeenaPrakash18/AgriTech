const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://agritech-1-glto.onrender.com';

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/api/register`,
  LOGIN: `${API_BASE_URL}/api/login`,
  PROFILE: `${API_BASE_URL}/api/profile`,
  RECOMMEND_CROP: `${API_BASE_URL}/api/recommend-crop`,
  DETECT_DISEASE: `${API_BASE_URL}/api/detect-disease`,
  MARKET_PRICES: `${API_BASE_URL}/api/market-prices`,
  GOV_SCHEMES: `${API_BASE_URL}/api/gov-schemes`,
  WATER_RECOMMENDATIONS: `${API_BASE_URL}/api/water-recommendations`,
  WEATHER: `${API_BASE_URL}/api/weather`,
  UPDATE_PHONE: `${API_BASE_URL}/api/user/update-phone`,
  NEARBY_RESOURCES: `${API_BASE_URL}/api/nearby-resources`,
  SEND_SMS: `${API_BASE_URL}/api/send-alert-sms`,
};

export default API_BASE_URL;
