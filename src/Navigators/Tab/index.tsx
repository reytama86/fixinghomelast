import { Buffer } from 'buffer';
import React, { useEffect, useState, useRef } from 'react';
import { View, Modal, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute, NavigatorScreenParams } from '@react-navigation/native';
import { Home, Chart, Scan } from 'iconsax-react-native';
import HomeStack, {HomeStackParamList} from '../../../HomeStack'
import ChartMain from '@Containers/Tab/ChartScreen/ChartMain';
import ImgLoadPortable from '@Assets/svg/ImgLoadPortable';
import ReadSoil from '@Containers/Tab/PortableSensorScreen/ReadSoil';
import styles from './styles';

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
      setIsVisible(false);
      Animated.timing(tabBarAnimation, {
        toValue: 60, 
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (!shouldHide && !isVisible) {
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

  const resetBLEState = async () => {
    console.log('Resetting BLE state...');
    
    try {
      if (monitoringSubscription.current) {
        monitoringSubscription.current.remove();
        monitoringSubscription.current = null;
      }
      
      if (isScanning.current) {
        bleManager.stopDeviceScan();
        isScanning.current = false;
      }
      
      if (connectedDevice) {
        try {
          await connectedDevice.cancelConnection();
          console.log('Device disconnected successfully');
        } catch (error) {
          console.log('Device already disconnected:', error);
        }
      }
      
      setConnectedDevice(null);
      setSensorData(null);
      setBleStatus('scanning');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error during BLE reset:', error);
    }
  };

  const convertCompactToFull = (compactData: CompactSensorData): SoilSensorData => {
    return {
      Humidity: compactData.H,
      Temp: compactData.T,
      EC: compactData.E,
      pH: compactData.P,
      Nitrogen: compactData.N,
      Phosphorus: compactData.K,  
      Kalium: compactData.L       
    };
  };

  const requestSensorData = async (device: Device) => {
    try {
      console.log('Requesting sensor data from ESP32...');
      
      try {
        const mtu = await device.requestMTU(200);
        console.log('MTU negotiated:', mtu);
      } catch (mtuError) {
        console.log('MTU negotiation failed, using default:', mtuError);
      }
      
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

  const startDataCollection = async (device: Device) => {
    try {
      console.log('Starting data collection...');
      
      if (monitoringSubscription.current) {
        monitoringSubscription.current.remove();
      }
      
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
              const jsonString = Buffer.from(characteristic.value, 'base64').toString('utf-8');
              console.log('Raw received data:', jsonString);
              console.log('Data length:', jsonString.length);
              
              if (!jsonString || jsonString.trim().length === 0) {
                console.error('Empty JSON string received');
                return;
              }
              
              const trimmedJson = jsonString.trim();
              if (!trimmedJson.startsWith('{') || !trimmedJson.endsWith('}')) {
                console.error('Invalid JSON format - not properly formatted:', trimmedJson);
                console.log('First 50 chars:', trimmedJson.substring(0, 50));
                console.log('Last 50 chars:', trimmedJson.substring(Math.max(0, trimmedJson.length - 50)));
                
                console.log('Data appears truncated, requesting again...');
                setTimeout(() => {
                  requestSensorData(device);
                }, 1000);
                return;
              }
              
              let data: SoilSensorData;
              try {
                const compactData: CompactSensorData = JSON.parse(trimmedJson);
                
                if (compactData.H !== undefined && compactData.T !== undefined) {
                  console.log('Received compact format data:', compactData);
                  data = convertCompactToFull(compactData);
                } else {
                  data = JSON.parse(trimmedJson) as SoilSensorData;
                }
              } catch (parseError) {
                console.error('JSON parsing failed:', parseError);
                console.error('Failed to parse:', trimmedJson);
                
                setTimeout(() => {
                  requestSensorData(device);
                }, 2000);
                return;
              }
              
              const requiredFields = ['Humidity', 'Temp', 'EC', 'pH', 'Nitrogen', 'Phosphorus', 'Kalium'];
              const missingFields = requiredFields.filter(field => data[field] === undefined || data[field] === null);
              
              if (missingFields.length > 0) {
                console.error('Missing fields in sensor data:', missingFields);
                console.error('Received data:', data);
                return;
              }
              
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
  
      await requestSensorData(device);
      
    } catch (error) {
      console.error('Error starting data collection:', error);
    }
  };

  useEffect(() => {
    if (!showPopup) return;
    
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const startBLEProcess = async () => {
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

  useEffect(() => {
    return () => {
      resetBLEState();
    };
  }, []);

  useEffect(() => {
    if (!showPopup) {
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

export default MainTabs;