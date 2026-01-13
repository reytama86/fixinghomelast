import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

export const useNotificationHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    console.log('🔔 Setting up notification handlers...');

    const requestPermission = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('✅ Notification permission granted:', authStatus);
        } else {
          console.log('⚠️ Notification permission denied');
          Alert.alert(
            'Izin Notifikasi',
            'Aplikasi memerlukan izin notifikasi untuk memberitahu Anda tentang sensor yang tidak aktif.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('❌ Error requesting permission:', error);
      }
    };

    requestPermission();

    const ensureChannel = async () => {
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
          console.log('✅ Notification channel ensured');
        } catch (error) {
          console.error('❌ Error creating channel:', error);
        }
      }
    };

    ensureChannel();

    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('📱 FOREGROUND notification received:', remoteMessage);

      try {
        const notificationId = await notifee.displayNotification({
          title: remoteMessage.notification?.title || '⚠️ Sensor Alert',
          body: remoteMessage.notification?.body || 'Ada update dari sensor',
          android: {
            channelId: 'sensor_alerts',
            importance: AndroidImportance.HIGH,
            smallIcon: 'ic_launcher',
            color: '#B4DC45',
            vibrationPattern: [300, 500, 300, 500],
            pressAction: {
              id: 'default',
            },
          },
          data: remoteMessage.data,
        });
        
        console.log('✅ Foreground notification displayed:', notificationId);
      } catch (error) {
        console.error('❌ Error displaying foreground notification:', error);
      }
    });

    const unsubscribeNotificationOpen = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('🔔 BACKGROUND: Notification opened app:', remoteMessage);
        
        handleNotificationNavigation(remoteMessage.data);
      }
    );

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('🔔 QUIT STATE: Notification opened app:', remoteMessage);
          
          setTimeout(() => {
            handleNotificationNavigation(remoteMessage.data);
          }, 2000);
        }
      });

    const unsubscribeNotifeeEvent = notifee.onForegroundEvent(({ type, detail }) => {
      console.log('🔔 Notifee foreground event:', type);
      
      if (type === EventType.PRESS) {
        console.log('👆 User pressed notification (notifee):', detail.notification);
        
        handleNotificationNavigation(detail.notification?.data);
      }
    });

    const handleNotificationNavigation = (data: any) => {
      console.log('🧭 Handling navigation with data:', data);
      
      if (data?.sensor_id) {
        try {
          const sensorId = parseInt(data.sensor_id as string);
          const blockId = sensorId <= 3 ? 4 : 3;
          
          console.log(`📍 Navigating to DetailBlock with blockId: ${blockId}`);
          
          navigation.navigate('DetailBlock' as never, { blockId } as never);
        } catch (error) {
          console.error('❌ Error navigating:', error);
        }
      } else {
        console.log('⚠️ No sensor_id in notification data');
      }
    };

    return () => {
      console.log('🧹 Cleaning up notification handlers');
      unsubscribeForeground();
      unsubscribeNotificationOpen();
      unsubscribeNotifeeEvent();
    };
  }, [navigation]);
};