import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

type User = {
  id: number;
  username: string;
  role: string;
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

const BASE_URL = 'https://iot-vanili-api.permataindonesia.com';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const requestUserPermission = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ Authorization status:', authStatus);
        return true;
      }
      console.log('⚠️ Notification permission denied');
      return false;
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      return false;
    }
  };

  const getFCMToken = async (userId: number) => {
    try {
      const hasPermission = await requestUserPermission();
      if (!hasPermission) {
        console.log('⚠️ Notification permission denied, skipping FCM token');
        return;
      }

      const fcmToken = await messaging().getToken();
      console.log('📱 FCM Token obtained:', fcmToken.substring(0, 20) + '...');

      // Kirim token ke backend
      const response = await fetch(`${BASE_URL}/auth/update-fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          fcmToken: fcmToken,
        }),
      });

      if (!response.ok) {
        console.warn('⚠️ Failed to update FCM token on server');
      } else {
        console.log('✅ FCM token updated on server');
      }
    } catch (error) {
      console.error('❌ Error getting/updating FCM token:', error);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      console.log('🔐 Attempting login for:', username);

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

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Server returned non-JSON response');
        setIsLoading(false);
        return { success: false, message: 'Server error: Invalid response format' };
      }

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        console.log('✅ Login successful for user:', data.user.username);
        
        setUserToken(data.token);
        setUser(data.user);
        
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));

        // Get FCM token jika user adalah developer
        if (data.user.role === 'developer') {
          console.log('👨‍💻 User is developer, getting FCM token...');
          await getFCMToken(data.user.id);
        }

        setIsLoading(false);
        return { success: true, message: 'Login berhasil' };
      } else {
        console.log('❌ Login failed:', data.error);
        setIsLoading(false);
        return { success: false, message: data.error || 'Login gagal' };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setIsLoading(false);
      return { success: false, message: 'Koneksi ke server gagal' };
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log('🚪 Logging out...');
      
      setUserToken(null);
      setUser(null);
      
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
      console.log('✅ Logout successful');
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Logout error:', error);
      setIsLoading(false);
    }
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Checking login status...');
      
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');

      if (!token || !userData) {
        console.log('⚠️ No stored credentials found');
        setIsLoading(false);
        return;
      }

      let parsedUser: User;
      try {
        parsedUser = JSON.parse(userData);
      } catch (parseError) {
        console.error('❌ Failed to parse stored user data:', parseError);
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        setIsLoading(false);
        return;
      }

      // Try to verify token with server
      try {
        console.log('🔐 Verifying token with server...');
        
        const response = await fetch(`${BASE_URL}/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        
        if (response.ok && contentType && contentType.includes('application/json')) {
          const verifyData = await response.json();
          
          if (verifyData.valid) {
            console.log('✅ Token verified successfully');
            setUserToken(token);
            setUser(parsedUser);

            // Get FCM token jika user adalah developer
            if (parsedUser.role === 'developer') {
              await getFCMToken(parsedUser.id);
            }
          } else {
            console.log('⚠️ Token invalid, clearing storage');
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
          }
        } else {
          // Server verification failed, but use local token anyway
          console.log('⚠️ Server verification failed, using local token');
          setUserToken(token);
          setUser(parsedUser);

          // Get FCM token jika user adalah developer
          if (parsedUser.role === 'developer') {
            await getFCMToken(parsedUser.id);
          }
        }
      } catch (verifyError) {
        // Network error or server down, use local token
        console.log('⚠️ Cannot reach server, using local token:', verifyError);
        setUserToken(token);
        setUser(parsedUser);

        // Get FCM token jika user adalah developer
        if (parsedUser.role === 'developer') {
          await getFCMToken(parsedUser.id);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('❌ isLoggedIn error:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();

    // Handle foreground notifications
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📱 Foreground notification received:', remoteMessage);
      // Notifikasi akan di-handle oleh useNotificationHandler
    });

    return unsubscribe;
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