// MainTabs.tsx - Fixed BLE reset issue with animated tab bar
import { Buffer } from 'buffer';
import React, { useEffect, useState, useRef } from 'react';
import { View, Modal, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, NavigatorScreenParams } from '@react-navigation/native';
import { Home, Chart, Scan } from 'iconsax-react-native';
import HomeStack, { HomeStackParamList } from './HomeStack';
import ChartMain from './components/Main/Chart/ChartMain';
import ImgLoadPortable from './assets/svg/ImgLoadPortable';
import ReadSoil from './components/Main/ReadSoil/ReadSoil';

import { BleManager, Device } from 'react-native-ble-plx';
const SERVICE_UUID = '5900f86c-57d7-422c-8aa8-fd6216fa496b';
const CHARACTERISTIC_UUID = 'a0863556-7065-46e6-96ee-99e3f693cb7f';
const REQUEST_CHAR_UUID = 'b1974667-8166-57f7-a7bb-0e7327ab507c';

export type SoilSensorData = {
  Humidity: number;
  Temp: number;
  EC: number;
  pH: number;
  Nitrogen: number;
  Phosphorus: number;
  Kalium: number;
};

// Compact JSON mapping untuk data yang dikirim ESP32
type CompactSensorData = {
  H: number;  // Humidity
  T: number;  // Temperature
  E: number;  // EC
  P: number;  // pH
  N: number;  // Nitrogen
  K: number;  // Phosphorus
  L: number;  // Kalium
};

export type MainTabParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  ReadSoil: { 
    bleStatus: 'scanning'|'connecting'|'connected'|'disconnected';
    sensorData?: SoilSensorData;
  };
  ChartMain: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom Tab Bar Component with Animation
const AnimatedTabBar = (props: any) => {
  const tabBarAnimation = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const { state, descriptors } = props;
    const currentRoute = state.routes[state.index];
    const routeName = getFocusedRouteNameFromRoute(currentRoute) ?? currentRoute.name;
    const hideTabScreens = ['ReadSoil', 'DetailBlockOne', 'DetailBlockTwo', 'ReadSoilDetail', 'ChartMain', 'AllPortableTools', 'AllBlock'];
    
    const shouldHide = hideTabScreens.includes(routeName);
    
    if (shouldHide && isVisible) {
      // Hide animation - slide down
      setIsVisible(false);
      Animated.timing(tabBarAnimation, {
        toValue: 60, // Tab bar height
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (!shouldHide && !isVisible) {
      // Show animation - slide up
      setIsVisible(true);
      Animated.timing(tabBarAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [props.state]);

  const { state, descriptors, navigation } = props;

  return (
    <Animated.View
      style={[
        styles.animatedTabBar,
        {
          transform: [{ translateY: tabBarAnimation }],
        },
      ]}
    >
      <View style={styles.tabBarContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const Icon = options.tabBarIcon;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabBarItem}
            >
              <Icon 
                focused={isFocused} 
                color={isFocused ? '#B4DC45' : 'gray'} 
                size={24} 
              />
              {route.name !== 'ReadSoil' && (
                <Text style={[
                  styles.tabBarLabel, 
                  { color: isFocused ? '#B4DC45' : 'gray' }
                ]}>
                  {label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
};

const MainTabs: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [dotCount, setDotCount] = useState(0);
  const [navigation, setNavigation] = useState<any>(null);

  const [bleStatus, setBleStatus] = useState<'scanning'|'connecting'|'connected'|'disconnected'>('scanning');
  const [bleManager] = useState(() => new BleManager());
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [sensorData, setSensorData] = useState<SoilSensorData | null>(null);
  
  // Ref untuk tracking monitoring subscription
  const monitoringSubscription = useRef<any>(null);
  const isScanning = useRef(false);

  useEffect(() => {
    let dotInterval;
    if (showPopup) {
      dotInterval = setInterval(() => {
        setDotCount(prev => (prev + 1) % 4);
      }, 500);
    } else {
      setDotCount(0);
    }
    return () => clearInterval(dotInterval);
  }, [showPopup]);

  // Function to completely reset BLE state
  const resetBLEState = async () => {
    console.log('Resetting BLE state...');
    
    try {
      // Stop monitoring jika ada
      if (monitoringSubscription.current) {
        monitoringSubscription.current.remove();
        monitoringSubscription.current = null;
      }
      
      // Stop scan jika sedang berjalan
      if (isScanning.current) {
        bleManager.stopDeviceScan();
        isScanning.current = false;
      }
      
      // Disconnect device jika masih terhubung
      if (connectedDevice) {
        try {
          await connectedDevice.cancelConnection();
          console.log('Device disconnected successfully');
        } catch (error) {
          console.log('Device already disconnected:', error);
        }
      }
      
      // Reset semua state
      setConnectedDevice(null);
      setSensorData(null);
      setBleStatus('scanning');
      
      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error during BLE reset:', error);
    }
  };

  // Function to convert compact data to full format
  const convertCompactToFull = (compactData: CompactSensorData): SoilSensorData => {
    return {
      Humidity: compactData.H,
      Temp: compactData.T,
      EC: compactData.E,
      pH: compactData.P,
      Nitrogen: compactData.N,
      Phosphorus: compactData.K,  // K adalah Phosphorus di compact format
      Kalium: compactData.L       // L adalah Kalium di compact format
    };
  };

  // Function to request sensor data from ESP32
  const requestSensorData = async (device: Device) => {
    try {
      console.log('Requesting sensor data from ESP32...');
      
      // Request MTU yang lebih besar untuk transfer data
      try {
        const mtu = await device.requestMTU(200);
        console.log('MTU negotiated:', mtu);
      } catch (mtuError) {
        console.log('MTU negotiation failed, using default:', mtuError);
      }
      
      // Kirim request "READ_SENSOR" ke ESP32
      await device.writeCharacteristicWithoutResponseForService(
        SERVICE_UUID,
        REQUEST_CHAR_UUID,
        Buffer.from('READ_SENSOR').toString('base64')
      );
      
      console.log('Sensor data request sent');
    } catch (error) {
      console.error('Error sending sensor data request:', error);
    }
  };

  // Function to start monitoring sensor data
  const startDataCollection = async (device: Device) => {
    try {
      console.log('Starting data collection...');
      
      // Stop previous monitoring jika ada
      if (monitoringSubscription.current) {
        monitoringSubscription.current.remove();
      }
      
      // Monitor characteristic for data changes
      monitoringSubscription.current = device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error, characteristic) => {
          // if (error) {
          //   console.error('Monitor error:', error);
          //   return;
          // }
          
          if (characteristic?.value) {
            try {
              // Decode base64 data
              const jsonString = Buffer.from(characteristic.value, 'base64').toString('utf-8');
              console.log('Raw received data:', jsonString);
              console.log('Data length:', jsonString.length);
              
              // Validasi string JSON sebelum parsing
              if (!jsonString || jsonString.trim().length === 0) {
                console.error('Empty JSON string received');
                return;
              }
              
              // Cek apakah string JSON valid
              const trimmedJson = jsonString.trim();
              if (!trimmedJson.startsWith('{') || !trimmedJson.endsWith('}')) {
                console.error('Invalid JSON format - not properly formatted:', trimmedJson);
                console.log('First 50 chars:', trimmedJson.substring(0, 50));
                console.log('Last 50 chars:', trimmedJson.substring(Math.max(0, trimmedJson.length - 50)));
                
                // Jika data terpotong, coba request ulang
                console.log('Data appears truncated, requesting again...');
                setTimeout(() => {
                  requestSensorData(device);
                }, 1000);
                return;
              }
              
              // Parse JSON data (coba compact format dulu)
              let data: SoilSensorData;
              try {
                const compactData: CompactSensorData = JSON.parse(trimmedJson);
                
                // Cek apakah ini format compact (ada field H, T, E, dll)
                if (compactData.H !== undefined && compactData.T !== undefined) {
                  console.log('Received compact format data:', compactData);
                  data = convertCompactToFull(compactData);
                } else {
                  // Coba parse sebagai format lengkap
                  data = JSON.parse(trimmedJson) as SoilSensorData;
                }
              } catch (parseError) {
                console.error('JSON parsing failed:', parseError);
                console.error('Failed to parse:', trimmedJson);
                
                // Coba request ulang jika parsing gagal
                setTimeout(() => {
                  requestSensorData(device);
                }, 2000);
                return;
              }
              
              // Validasi data yang diterima
              const requiredFields = ['Humidity', 'Temp', 'EC', 'pH', 'Nitrogen', 'Phosphorus', 'Kalium'];
              const missingFields = requiredFields.filter(field => data[field] === undefined || data[field] === null);
              
              if (missingFields.length > 0) {
                console.error('Missing fields in sensor data:', missingFields);
                console.error('Received data:', data);
                return;
              }
              
              // Validasi nilai numerik
              const invalidFields = requiredFields.filter(field => 
                typeof data[field] !== 'number' || isNaN(data[field])
              );
              
              if (invalidFields.length > 0) {
                console.error('Invalid numeric values:', invalidFields);
                console.error('Received data:', data);
                return;
              }
              
              setSensorData(data);
              console.log('Successfully parsed sensor data:', data);
              
            } catch (error) {
              console.error('Error processing sensor data:', error);
              
              // Retry mechanism
              setTimeout(() => {
                console.log('Retrying sensor data request...');
                requestSensorData(device);
              }, 1500);
            }
          } else {
            console.log('No data received from characteristic');
          }
        }
      );
  
      // Request sensor data from ESP32
      await requestSensorData(device);
      
    } catch (error) {
      console.error('Error starting data collection:', error);
    }
  };

  // Effect untuk BLE scanning dan connection
  useEffect(() => {
    if (!showPopup) return;
    
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const startBLEProcess = async () => {
      // Reset BLE state sebelum mulai scan baru
      await resetBLEState();
      
      console.log('Starting fresh BLE scan...');
      setBleStatus('scanning');
      setSensorData(null);
      isScanning.current = true;
      
      bleManager.startDeviceScan([SERVICE_UUID], null, (error, device) => {
        if (error) {
          console.warn('Scan error:', error);
          setBleStatus('disconnected');
          isScanning.current = false;
          return;
        }
        
        console.log('Found device:', device?.name, device?.id);
        
        if (device?.name?.includes('Smart-Soil-Sensor')) {
          console.log('Found target device, stopping scan...');
          bleManager.stopDeviceScan();
          isScanning.current = false;
          setBleStatus('connecting');
          
          device.connect()
            .then(connectedDevice => {
              console.log('Device connected, discovering services...');
              setConnectedDevice(connectedDevice);
              return connectedDevice.discoverAllServicesAndCharacteristics();
            })
            .then(deviceWithServices => {
              console.log('Services discovered, starting data collection...');
              setBleStatus('connected');
              return startDataCollection(deviceWithServices);
            })
            .catch(connectError => {
              console.error('Connection error:', connectError);
              setBleStatus('disconnected');
              setConnectedDevice(null);
            });
        }
      });

      // Timeout fallback
      timeoutId = setTimeout(() => {
        if (bleStatus === 'scanning' || bleStatus === 'connecting') {
          console.log('Connection timeout');
          bleManager.stopDeviceScan();
          isScanning.current = false;
          setBleStatus('disconnected');
        }
      }, 15000);
    };

    startBLEProcess();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (isScanning.current) {
        bleManager.stopDeviceScan();
        isScanning.current = false;
      }
    };
  }, [showPopup]);

  useEffect(() => {
    if (!showPopup) return;
    
    if (bleStatus === 'connected') {
      // Wait for sensor data to be received
      const checkDataInterval = setInterval(() => {
        if (sensorData) {
          clearInterval(checkDataInterval);
          setTimeout(() => {
            setShowPopup(false);
            navigation.navigate('ReadSoil', { 
              bleStatus,
              sensorData 
            });
          }, 1000);
        }
      }, 500);

      // Timeout jika data tidak diterima dalam 10 detik setelah connected
      const dataTimeout = setTimeout(() => {
        clearInterval(checkDataInterval);
        console.log('Data timeout - proceeding without data');
        setShowPopup(false);
        navigation.navigate('ReadSoil', { 
          bleStatus: 'disconnected',
          sensorData: null 
        });
      }, 10000);

      return () => {
        clearInterval(checkDataInterval);
        clearTimeout(dataTimeout);
      };

    } else if (bleStatus === 'disconnected') {
      setTimeout(() => {
        setShowPopup(false);
        navigation.navigate('ReadSoil', { 
          bleStatus,
          sensorData: null 
        });
      }, 800);
    }
  }, [bleStatus, showPopup, navigation, sensorData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetBLEState();
    };
  }, []);

  // Reset BLE ketika popup ditutup (user cancel atau navigasi kembali)
  useEffect(() => {
    if (!showPopup) {
      // Reset BLE state ketika popup ditutup
      setTimeout(() => {
        resetBLEState();
      }, 500);
    }
  }, [showPopup]);

  const loadingText = `Gathering Data${'.'.repeat(dotCount)}`;
  
  return (
    <>
      <Tab.Navigator
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => {
            if (route.name === 'HomeStack') {
              return <Home color={focused ? '#B4DC45' : color} variant="Bold" size={size} />;
            }
            if (route.name === 'ReadSoil') {
              return (
                <View style={styles.readIconContainer}>
                  <Scan color="white" variant="Linear" size={20} />
                </View>
              );
            }
            return <Chart color={focused ? '#B4DC45' : color} variant="Linear" size={size} />;
          },
        })}
      >
        <Tab.Screen
          name="HomeStack"
          component={HomeStack}
          options={{ tabBarLabel: 'Home' }}
          listeners={({ navigation }) => ({
            tabPress: e => {
              e.preventDefault();
              navigation.navigate('HomeStack', { screen: 'HomeFix' });
            },
          })}
        />
        <Tab.Screen
          name="ReadSoil"
          component={ReadSoil}
          options={{ tabBarLabel: '' }}
          listeners={({ navigation: nav }) => ({
            tabPress: e => {
              e.preventDefault();
              setNavigation(nav);
              setShowPopup(true);
            },
          })}
        />
        <Tab.Screen name="ChartMain" component={ChartMain} options={{ tabBarLabel: 'History' }} />
      </Tab.Navigator>

      <Modal
        visible={showPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.containerImage}>
              <ImgLoadPortable/>
            </View>
            <View style={styles.containerText}>
            <Text style={styles.modalText}>{loadingText}</Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  readIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#B4DC45',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Animated Tab Bar Styles
  animatedTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabBarContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    fontFamily: 'SpaceGrotesk-Regular'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: 141,
    height: 121,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  modalText: {
    fontSize: 14,
    fontWeight: 400,
    fontFamily: 'SpaceGrotesk-Regular',
    marginTop: 13,
  },
  closeIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconText: {
    fontSize: 16,
    lineHeight: 16,
    fontWeight: '600',
  },
  containerImage: {
    alignItems: "center",
    width: 67,
    height: 53,
  },
  containerText: {
    width: 141,
    borderRadius: 1,
    alignItems: "center",
  }
});

export default MainTabs;