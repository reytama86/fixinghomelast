import { storage } from '@Hooks/useMmkv';
import StackNavigator from './src/Navigators/Stack';
import React, { useEffect } from 'react';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

function App(): React.JSX.Element {
  useEffect(() => {
    const createNotificationChannel = async () => {
      if (Platform.OS === 'android') {
        try {
          await notifee.createChannel({
            id: 'sensor_alerts',
            name: 'Sensor Alerts',
            description: 'Notifikasi untuk alert sensor tidak aktif',
            importance: AndroidImportance.HIGH,
            vibration: true,
            vibrationPattern: [300, 500, 300, 500],
            sound: 'default',
          });
          console.log('✅ Notification channel "sensor_alerts" created');
        } catch (error) {
          console.error('❌ Error creating notification channel:', error);
        }
      }
    };
    
    createNotificationChannel();
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StackNavigator />
    </SafeAreaProvider>
  );
}

export default App;