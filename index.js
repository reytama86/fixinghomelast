import './shim';
import 'react-native-reanimated';
import React from 'react';
import { AppRegistry } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './App';
import { AuthProvider } from './src/Context/AuthContext';
import { ControlProvider } from './src/Context/ControlContext';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

Ionicons.loadFont();

// ✅ CREATE CHANNEL FUNCTION (digunakan di banyak tempat)
const createNotificationChannel = async () => {
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
    console.log('✅ Notification channel created');
  } catch (error) {
    console.error('❌ Error creating channel:', error);
  }
};

// ✅ DISPLAY NOTIFICATION FUNCTION (reusable)
const displayNotification = async (remoteMessage) => {
  try {
    // Ensure channel exists first
    await createNotificationChannel();

    await notifee.displayNotification({
      title: remoteMessage.notification?.title || '⚠️ Notifikasi Sensor',
      body: remoteMessage.notification?.body || 'Ada update dari sensor',
      android: {
        channelId: 'sensor_alerts',
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_launcher', // ← Gunakan icon app default
        color: '#B4DC45',
        vibrationPattern: [300, 500, 300, 500],
        sound: 'default',
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
      },
      data: remoteMessage.data,
    });
    console.log('✅ Notification displayed successfully');
  } catch (error) {
    console.error('❌ Error displaying notification:', error);
  }
};

// ✅ BACKGROUND MESSAGE HANDLER (MUST BE TOP-LEVEL)
// This runs even when app is completely killed
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📬 Background notification received (app killed):', remoteMessage);
  
  await displayNotification(remoteMessage);
  
  return Promise.resolve();
});

// ✅ BACKGROUND EVENT HANDLER (untuk notifee)
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('🔔 Background event:', type);
  
  if (type === EventType.PRESS) {
    console.log('👆 User pressed notification (background):', detail.notification?.data);
    // Navigation akan di-handle oleh useNotificationHandler
  }
});

// ✅ Create channel immediately on app load
createNotificationChannel();

const Root = () => (
  <SafeAreaProvider>
    <AuthProvider>
      <ControlProvider>
        <App />
      </ControlProvider>
    </AuthProvider>
  </SafeAreaProvider>
);

AppRegistry.registerComponent(appName, () => Root);