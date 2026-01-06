import axios from 'axios';

// 1. Determine the Base URL
const BASE_URL = (import.meta.env.VITE_API_URL || '') + '/api';

// 2. Create the Axios Instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true 
});

// 3. Request Interceptor (MERGED: Debugging + Auth Token)
api.interceptors.request.use(
  (config) => {
    // A. Debugging: Log the full URL so you can see it in Android Studio
    console.log(`[API] Requesting: ${config.baseURL || ''}${config.url}`);

    // B. Authentication: Attach the token if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);


api.approveDesignQuote = (designId) => api.post(`/designs/${designId}/approve`);
api.declineDesignQuote = (designId) => api.post(`/designs/${designId}/decline`);
api.createOrderFromDesign = (orderData) => api.post(`/orders/design-to-order`, orderData);
// Utility to fetch a single design (needed for checkout page)
api.getDesignById = (designId) => api.get(`/designs/${designId}`);



export const shopAPI = {
    // GET /api/shop/me
    getMyShopProfile: () => api.get('/shop/me'), 

    // PUT /api/shop/me (for text fields: shopName, shopDescription, specialties, address, payoutInfo)
    updateShopTextProfile: (updateData) => api.put('/shop/me', updateData),

    /**
     * PUT /api/shop/me/logo - Updates the shop logo. Must be called with FormData.
     * @param {FormData} formData - Must contain the file under the key 'shopLogo'.
     */
    updateShopLogo: (formData) => api.put('/shop/me/logo', formData, {
    }),
};

export default api;