import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('ecommerce_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'demo@example.com' && password === 'demo123') {
        const mockUser = {
          id: 1,
          name: 'Demo User',
          email: email,
          firstName: 'Demo',
          lastName: 'User',
        };
        setUser(mockUser);
        localStorage.setItem('ecommerce_user', JSON.stringify(mockUser));
        return { success: true };
      } else {
        const mockUser = {
          id: Date.now(),
          name: email.split('@')[0],
          email: email,
          firstName: email.split('@')[0],
          lastName: 'User',
        };
        setUser(mockUser);
        localStorage.setItem('ecommerce_user', JSON.stringify(mockUser));
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: Date.now(),
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      };
      
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ecommerce_user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
