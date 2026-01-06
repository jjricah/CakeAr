import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { nanoid } from 'nanoid';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedDesigns, setSavedDesigns] = useState([]);

  const getDesignsKey = (userId) => `saved_designs_${userId}`;

  // Helper to load designs based on user presence
  const loadDesignsForUser = (userData) => {
    let loadedDesigns = [];
    const key = userData ? getDesignsKey(userData._id) : 'saved_designs_guest';
    
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        loadedDesigns = JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved designs", e);
      }
    }
    return loadedDesigns;
  };

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      let loadedUser = null;
      let loadedDesigns = [];

      if (token) {
        try {
          const response = await api.get('/auth/me');
          loadedUser = response.data;

          loadedDesigns = loadDesignsForUser(loadedUser);
        } catch (error) {
          localStorage.removeItem('token');
          // loadedUser remains null
        }
      }

      setUser(loadedUser);
      
      // If no user loaded (guest), load guest designs
      if (!loadedUser) {
        setSavedDesigns(loadDesignsForUser(null));
      } else {
        setSavedDesigns(loadedDesigns);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Save to User Key OR Guest Key
    if (user && user._id) {
      localStorage.setItem(getDesignsKey(user._id), JSON.stringify(savedDesigns));
    } else {
      localStorage.setItem('saved_designs_guest', JSON.stringify(savedDesigns));
    }
  }, [savedDesigns, user]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    // Also save userInfo to match updateUser logic (optional but good for consistency)
    localStorage.setItem('userInfo', JSON.stringify(response.data));
    setSavedDesigns(loadDesignsForUser(response.data)); // Load this user's designs
    setUser(response.data);
    return response.data;
  };

  const register = async (name, email, password) => {
    // The backend now sends a success message, not a token.
    // The component will handle displaying the message.
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    // Clear the specific user's designs on logout
    if (user?._id) localStorage.removeItem(getDesignsKey(user._id)); 
    setUser(null);
    setSavedDesigns(loadDesignsForUser(null)); // Switch back to guest designs
  };
  const saveDesign = (designConfig) => {
    const designToSave = { ...designConfig, id: designConfig.id || nanoid() };
    setSavedDesigns(prev => [designToSave, ...prev]); // Add new design to the beginning
  };

  const deleteDesign = (id) => {
    setSavedDesigns(prev => prev.filter(d => d.id !== id));
  };
  // --- UPDATED FUNCTION ---
  const updateUser = (userData) => {
    // 1. Calculate the new user object by merging current state with updates
    // (This handles updates like adding a Shop ID to the 'following' array)
    const updatedUser = { ...user, ...userData };

    // 2. Update React State (UI updates immediately)
    setUser(updatedUser);

    // 3. Update LocalStorage (Persist data across refreshing if needed)
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser, savedDesigns, saveDesign, deleteDesign }}>
      {children}
    </AuthContext.Provider>
  );
};