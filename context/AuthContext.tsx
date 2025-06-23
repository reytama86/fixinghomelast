// context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: number;
  username: string;
};

type AuthContextType = {
  isLoading: boolean;
  userToken: string | null;
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  userToken: null,
  user: null,
  login: async () => ({ success: false, message: '' }),
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

// Base URL backend - sesuaikan dengan IP/domain server Anda
const BASE_URL = 'http://10.0.2.2:4646' // atau 'http://192.168.1.100:4646' jika menggunakan device fisik

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserToken(data.token);
        setUser(data.user);
        
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        
        setIsLoading(false);
        return { success: true, message: 'Login berhasil' };
      } else {
        setIsLoading(false);
        return { success: false, message: data.error || 'Login gagal' };
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, message: 'Koneksi ke server gagal' };
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setUserToken(null);
      setUser(null);
      
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      setIsLoading(false);
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const response = await fetch(`${BASE_URL}/auth/verify`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            setUserToken(token);
            setUser(JSON.parse(userData));
          } else {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
          }
        } catch (verifyError) {
          console.log('Token verification failed, using local token');
          setUserToken(token);
          setUser(JSON.parse(userData));
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.log(`isLoggedIn error: ${error}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isLoading, 
      userToken, 
      user, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};