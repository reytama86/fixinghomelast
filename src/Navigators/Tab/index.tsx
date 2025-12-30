import { Buffer } from 'buffer';
import React, { useEffect, useState, useRef } from 'react';
import { View, Modal, Text, Pressable, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Home, Chart, Scan } from 'iconsax-react-native';
import HomeScreen from '@Containers/Tab/HomeScreen';
import ChartMain from '@Containers/Tab/ChartScreen/ChartMain';
import ImgLoadPortable from '@Assets/svg/ImgLoadPortable';
import PortableSensorScreen from '@Containers/Tab/PortableSensorScreen';
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
  H: number;
  T: number;
  E: number;
  P: number;
  N: number;
  K: number;
  L: number;
};

export type MainTabParamList = {
  Home: undefined;
  PortableHistory: {
    bleStatus?: 'scanning' | 'connecting' | 'connected' | 'disconnected';
    sensorData?: SoilSensorData;
    portableData?: any; // tambahkan ini
    isHistoryMode?: boolean; // tambahkan ini
  };
  ChartMain: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Animated Tab Bar Component
const AnimatedTabBar = (props: any) => {
  const tabBarAnimation = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const { state } = props;
    const currentRoute = state.routes[state.index];
    const routeName = currentRoute.name;
    
    // Screens di mana tab bar harus disembunyikan
    const hideTabScreens = ['PortableHistory'];

    const shouldHide = hideTabScreens.includes(routeName);

    if (shouldHide && isVisible) {
      setIsVisible(false);
      Animated.timing(tabBarAnimation, {
        toValue: 100,
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
              {route.name !== 'PortableHistory' && (
                <Text
                  style={[
                    styles.tabBarLabel,
                    { color: isFocused ? '#B4DC45' : 'gray' }
                  ]}
                >
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

const TabNavigator: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [dotCount, setDotCount] = useState(0);
  const [navigation, setNavigation] = useState<any>(null);
  const [bleStatus, setBleStatus] = useState<'scanning' | 'connecting' | 'connected' | 'disconnected'>('scanning');
  const [bleManager] = useState(() => new BleManager());
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [sensorData, setSensorData] = useState<SoilSensorData | null>(null);

  const monitoringSubscription = useRef<any>(null);
  const isScanning = useRef(false);

  // Animated dots untuk loading
  useEffect(() => {
    let dotInterval: NodeJS.Timeout;
    if (showPopup) {
      dotInterval = setInterval(() => {
        setDotCount(prev => (prev + 1) % 4);
      }, 500);
    } else {
      setDotCount(0);
    }
    return () => clearInterval(dotInterval);
  }, [showPopup]);

  // BLE Functions
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
      console.log('Requesting sensor data...');
      try {
        const mtu = await device.requestMTU(200);
        console.log('MTU negotiated:', mtu);
      } catch (mtuError) {
        console.log('MTU negotiation failed:', mtuError);
      }
      await device.writeCharacteristicWithoutResponseForService(
        SERVICE_UUID,
        REQUEST_CHAR_UUID,
        Buffer.from('READ_SENSOR').toString('base64')
      );
      console.log('Sensor data request sent');
    } catch (error) {
      console.error('Error sending request:', error);
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
          if (characteristic?.value) {
            try {
              const jsonString = Buffer.from(characteristic.value, 'base64').toString('utf-8');
              console.log('Raw data:', jsonString);
              
              if (!jsonString || jsonString.trim().length === 0) {
                console.error('Empty JSON received');
                return;
              }
              
              const trimmedJson = jsonString.trim();
              if (!trimmedJson.startsWith('{') || !trimmedJson.endsWith('}')) {
                console.error('Invalid JSON format');
                setTimeout(() => requestSensorData(device), 1000);
                return;
              }
              
              let data: SoilSensorData;
              try {
                const compactData: CompactSensorData = JSON.parse(trimmedJson);
                if (compactData.H !== undefined && compactData.T !== undefined) {
                  data = convertCompactToFull(compactData);
                } else {
                  data = JSON.parse(trimmedJson) as SoilSensorData;
                }
              } catch (parseError) {
                console.error('Parse failed:', parseError);
                setTimeout(() => requestSensorData(device), 2000);
                return;
              }
              
              const requiredFields = ['Humidity', 'Temp', 'EC', 'pH', 'Nitrogen', 'Phosphorus', 'Kalium'];
              const missingFields = requiredFields.filter(field => 
                data[field] === undefined || data[field] === null
              );
              
              if (missingFields.length > 0) {
                console.error('Missing fields:', missingFields);
                return;
              }
              
              setSensorData(data);
              console.log('Sensor data received:', data);
              
            } catch (error) {
              console.error('Error processing data:', error);
              setTimeout(() => requestSensorData(device), 1500);
            }
          }
        }
      );

      await requestSensorData(device);
    } catch (error) {
      console.error('Error starting collection:', error);
    }
  };

  // BLE Scanning Effect
  useEffect(() => {
    if (!showPopup) return;
    
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const startBLEProcess = async () => {
      await resetBLEState();
      
      console.log('Starting BLE scan...');
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
        
        if (device?.name?.includes('Smart-Soil-Sensor')) {
          console.log('Found device:', device.name);
          bleManager.stopDeviceScan();
          isScanning.current = false;
          setBleStatus('connecting');
          
          device.connect()
            .then(connectedDevice => {
              console.log('Device connected');
              setConnectedDevice(connectedDevice);
              return connectedDevice.discoverAllServicesAndCharacteristics();
            })
            .then(deviceWithServices => {
              console.log('Services discovered');
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

  // Navigate when data ready or timeout
  useEffect(() => {
    if (!showPopup) return;
    
    if (bleStatus === 'connected') {
      const checkDataInterval = setInterval(() => {
        if (sensorData) {
          clearInterval(checkDataInterval);
          setTimeout(() => {
            setShowPopup(false);
            navigation.navigate('PortableHistory', { 
              bleStatus,
              sensorData 
            });
          }, 1000);
        }
      }, 500);

      const dataTimeout = setTimeout(() => {
        clearInterval(checkDataInterval);
        console.log('Data timeout');
        setShowPopup(false);
        navigation.navigate('PortableHistory', { 
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
        navigation.navigate('PortableHistory', { 
          bleStatus,
          sensorData: null 
        });
      }, 800);
    }
  }, [bleStatus, showPopup, navigation, sensorData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => resetBLEState();
  }, []);

  // Reset when popup closes
  useEffect(() => {
    if (!showPopup) {
      setTimeout(() => resetBLEState(), 500);
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
            if (route.name === 'Home') {
              return <Home color={focused ? '#B4DC45' : color} variant="Bold" size={size} />;
            }
            if (route.name === 'PortableHistory') {
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
          name="Home"
          component={HomeScreen}
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen
          name="PortableHistory"
          component={PortableSensorScreen}
          options={{ tabBarLabel: '' }}
          listeners={({ navigation: nav }) => ({
            tabPress: e => {

              e.preventDefault();
              setNavigation(nav);
              // setSensorData(null);
              setShowPopup(true);
            },
          })}
        />
        <Tab.Screen
          name="ChartMain"
          component={ChartMain}
          options={{ tabBarLabel: 'History' }}
        />
      </Tab.Navigator>

      {/* BLE Loading Modal */}
      <Modal
        visible={showPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.containerImage}>
              <ImgLoadPortable />
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

export default TabNavigator;