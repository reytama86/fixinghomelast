// ReadSoil.tsx - Modified with rescan functionality and consistent modal styling
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  TextInput,
  PermissionsAndroid, Platform
} from 'react-native';
import {Animated} from 'react-native';
import {BleManager, Device} from 'react-native-ble-plx';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {HomeStackParamList} from '../../../HomeStack';
import {ArrowLeft2} from 'iconsax-react-native';
import {MainTabParamList, SoilSensorData} from '../../../MainTabs';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Buffer } from 'buffer';
// Import your loading component
import ImgLoadPortable from '../../../assets/svg/ImgLoadPortable';
import { useControl } from '../../../context/ControlContext';

// BLE Constants (same as MainTabs)
const SERVICE_UUID = '5900f86c-57d7-422c-8aa8-fd6216fa496b';
const CHARACTERISTIC_UUID = 'a0863556-7065-46e6-96ee-99e3f693cb7f';
const REQUEST_CHAR_UUID = 'b1974667-8166-57f7-a7bb-0e7327ab507c';

type CompactSensorData = {
  H: number;  // Humidity
  T: number;  // Temperature
  E: number;  // EC
  P: number;  // pH
  N: number;  // Nitrogen
  K: number;  // Phosphorus
  L: number;  // Kalium
};

type ReadSoilRouteProp = RouteProp<MainTabParamList, 'ReadSoil'>;
type Props = BottomTabScreenProps<MainTabParamList, 'ReadSoil'>;

const ReadSoil: React.FC<Props> = ({navigation}) => {
  const route = useRoute<ReadSoilRouteProp>();
  const { bleStatus: initialBleStatus, sensorData: initialSensorData } = route.params;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRescanPopupVisible, setIsRescanPopupVisible] = useState(false);
  const modalAnimation = useState(new Animated.Value(0))[0];
  const [currentSensorData, setCurrentSensorData] = useState<SoilSensorData | null>(initialSensorData || null);

  // Rescan states
  const [dotCount, setDotCount] = useState(0);
  const [bleStatus, setBleStatus] = useState<'scanning'|'connecting'|'connected'|'disconnected'>(initialBleStatus);
  const { publish, isConnected } = useControl();
  const [bleManager] = useState(() => new BleManager());
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [resultName, setResultName] = useState(''); 
  const [isSaving, setIsSaving] = useState(false);
  const PORTABLE_TOPIC = 'data/portable';
  
  // Ref untuk tracking monitoring subscription
  const monitoringSubscription = useRef<any>(null);
  const isScanning = useRef(false);

  // Function to publish saved result to MQTT
  const publishSavedResult = (sensorData: SoilSensorData, resultName: string, deviceId?: string) => {
    if (!isConnected) {
      console.warn('MQTT not connected, cannot publish saved result');
      return;
    }

    const id_portable = "4"

    const payload = {
      // id_portable: id_portable,
      resultName: resultName.trim(),
      timestamp: new Date().toISOString(),
      deviceId: deviceId || connectedDevice?.id || 'portable_sensor',
      sensorData: {
        temperature: sensorData.Temp,
        humidity: sensorData.Humidity,
        ph: sensorData.pH,
        ec: sensorData.EC,
        nitrogen: sensorData.Nitrogen,
        phosphorus: sensorData.Phosphorus,
        kalium: sensorData.Kalium
      },
      metadata: {
        source: 'portable_sensor',
        savedAt: Date.now(),
        location: 'field',
        readingType: 'saved'
      }
    };

    try {
      publish(`${PORTABLE_TOPIC}/saved`, payload);
      console.log('Saved result published to MQTT:', payload);
    } catch (error) {
      console.error('Error publishing saved result to MQTT:', error);
    }
  };

  // Function to get status indicator based on value ranges
  const getStatusIndicator = (value: number, type: string) => {
    let status = 'Low';
    let color = 'red';
    let icon = 'arrow-down';

    switch (type) {
      case 'temperature':
        if (value >= 20 && value <= 30) {
          status = 'Good';
          color = 'green';
          icon = 'arrow-up';
        }
        break;
      case 'humidity':
        if (value >= 40 && value <= 60) {
          status = 'Good';
          color = 'green';
          icon = 'arrow-up';
        }
        break;
      case 'ph':
        if (value >= 6.0 && value <= 7.5) {
          status = 'Good';
          color = 'green';
          icon = 'arrow-up';
        }
        break;
      case 'ec':
        if (value >= 0.5 && value <= 2.0) {
          status = 'Good';
          color = 'green';
          icon = 'arrow-up';
        }
        break;
      case 'nitrogen':
      case 'phosphorus':
      case 'kalium':
        if (value >= 10 && value <= 50) {
          status = 'Good';
          color = 'green';
          icon = 'arrow-up';
        }
        break;
    }

    return { status, color, icon };
  };

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
      Phosphorus: compactData.K,
      Kalium: compactData.L
    };
  };
  

  // Function to request sensor data from ESP32
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

  // Function to start monitoring sensor data
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
              console.log('Raw received data:', jsonString);
              
              if (!jsonString || jsonString.trim().length === 0) {
                console.error('Empty JSON string received');
                return;
              }
              
              const trimmedJson = jsonString.trim();
              if (!trimmedJson.startsWith('{') || !trimmedJson.endsWith('}')) {
                console.error('Invalid JSON format');
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
                setTimeout(() => {
                  requestSensorData(device);
                }, 2000);
                return;
              }
              
              const requiredFields = ['Humidity', 'Temp', 'EC', 'pH', 'Nitrogen', 'Phosphorus', 'Kalium'];
              const missingFields = requiredFields.filter(field => data[field] === undefined || data[field] === null);
              
              if (missingFields.length > 0) {
                console.error('Missing fields in sensor data:', missingFields);
                return;
              }
              
              const invalidFields = requiredFields.filter(field => 
                typeof data[field] !== 'number' || isNaN(data[field])
              );
              
              if (invalidFields.length > 0) {
                console.error('Invalid numeric values:', invalidFields);
                return;
              }
              
              setCurrentSensorData(data);
              console.log('Successfully parsed sensor data:', data);
              
            } catch (error) {
              console.error('Error processing sensor data:', error);
              setTimeout(() => {
                requestSensorData(device);
              }, 1500);
            }
          }
        }
      );
  
      await requestSensorData(device);
      
    } catch (error) {
      console.error('Error starting data collection:', error);
    }
  };

  // Handle rescan functionality
  const handleRescan = () => {
    setIsRescanPopupVisible(true);
    setDotCount(0);
  };

  // Dot animation effect for rescan popup
  useEffect(() => {
    let dotInterval;
    if (isRescanPopupVisible) {
      dotInterval = setInterval(() => {
        setDotCount(prev => (prev + 1) % 4);
      }, 500);
    } else {
      setDotCount(0);
    }
    return () => clearInterval(dotInterval);
  }, [isRescanPopupVisible]);

  // BLE scanning effect for rescan
  useEffect(() => {
    if (!isRescanPopupVisible) return;
    
    let timeoutId: NodeJS.Timeout;
    
    const startBLEProcess = async () => {
      await resetBLEState();
      
      console.log('Starting fresh BLE scan...');
      setBleStatus('scanning');
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
  }, [isRescanPopupVisible]);

  // Handle rescan completion
  useEffect(() => {
    if (!isRescanPopupVisible) return;
    
    if (bleStatus === 'connected') {
      const checkDataInterval = setInterval(() => {
        if (currentSensorData) {
          clearInterval(checkDataInterval);
          setTimeout(() => {
            setIsRescanPopupVisible(false);
            // Data sudah diupdate di state, tidak perlu navigate
          }, 1000);
        }
      }, 500);

      const dataTimeout = setTimeout(() => {
        clearInterval(checkDataInterval);
        console.log('Data timeout - closing popup');
        setIsRescanPopupVisible(false);
        setBleStatus('disconnected');
      }, 10000);

      return () => {
        clearInterval(checkDataInterval);
        clearTimeout(dataTimeout);
      };

    } else if (bleStatus === 'disconnected') {
      setTimeout(() => {
        setIsRescanPopupVisible(false);
      }, 800);
    }
  }, [bleStatus, isRescanPopupVisible, currentSensorData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetBLEState();
    };
  }, []);

  const openModal = () => {
    setIsModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 900,
      useNativeDriver: true,
    }).start(() => setIsModalVisible(false));
  };

  const handleGoBack = async () => {
    await resetBLEState();
    navigation.navigate('HomeStack', { screen: 'HomeFix' });
  };

  const modalTranslateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  useEffect(() => {
    setCurrentSensorData(initialSensorData || null);
  }, [initialSensorData]);

  useEffect(() => {
    async function requestPermissions() {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
      }
    }
    requestPermissions();
  }, []);

  // Handle save result
  const handleSaveResult = async () => {
    if (!currentSensorData) {
      Alert.alert('Error', 'No sensor data available to save');
      return;
    }

    if (!resultName.trim()) {
      Alert.alert('Error', 'Please enter a result name');
      return;
    }

    setIsSaving(true);

    try {
      // Publish saved result to MQTT
      publishSavedResult(currentSensorData, resultName, connectedDevice?.id);
      
      // Show success message
      Alert.alert(
        'Success', 
        'Result saved and published successfully!',
        [{ text: 'OK', onPress: () => closeModal() }]
      );
      
      console.log('Result saved:', {
        name: resultName,
        data: currentSensorData,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error saving result:', error);
      Alert.alert('Error', 'Failed to save result. Please try again.');
    } finally {
      setIsSaving(false);
      setResultName('');
    }
  };


  // Get indicators for each sensor value
  const tempIndicator = currentSensorData ? getStatusIndicator(currentSensorData.Temp, 'temperature') : { status: 'No Data', color: 'gray', icon: 'remove' };
  const humidityIndicator = currentSensorData ? getStatusIndicator(currentSensorData.Humidity, 'humidity') : { status: 'No Data', color: 'gray', icon: 'remove' };
  const phIndicator = currentSensorData ? getStatusIndicator(currentSensorData.pH, 'ph') : { status: 'No Data', color: 'gray', icon: 'remove' };
  const ecIndicator = currentSensorData ? getStatusIndicator(currentSensorData.EC, 'ec') : { status: 'No Data', color: 'gray', icon: 'remove' };
  const nitrogenIndicator = currentSensorData ? getStatusIndicator(currentSensorData.Nitrogen, 'nitrogen') : { status: 'No Data', color: 'gray', icon: 'remove' };
  const phosphorusIndicator = currentSensorData ? getStatusIndicator(currentSensorData.Phosphorus, 'phosphorus') : { status: 'No Data', color: 'gray', icon: 'remove' };
  const kaliumIndicator = currentSensorData ? getStatusIndicator(currentSensorData.Kalium, 'kalium') : { status: 'No Data', color: 'gray', icon: 'remove' };

  const loadingText = `Gathering Data${'.'.repeat(dotCount)}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}>
          <ArrowLeft2
            color="black"
            variant="Linear"
            size={24}
            style={{transform: [{rotate: '360deg'}]}}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 600,
            fontFamily: 'SpaceGrotesk-Regular',
            right: 5,
          }}>
          Portable Tools Result
        </Text>
        <ArrowLeft2
          color="black"
          variant="Linear"
          size={24}
          style={{transform: [{rotate: '360deg'}]}}
          opacity={0}
        />
      </View>
      
      <View style={styles.cardTwo}>
        <Text style={styles.soilTitle}>Soil Statistic</Text>
        
        <View style={styles.soilStatisticOne}>
          <View style={styles.detailStatisticOne}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Soil Temperature</Text>
              <Text style={styles.statValue}>
                {currentSensorData ? `${currentSensorData.Temp}°C` : 'No Data'}
              </Text>
            </View>
            <View style={styles.statExtra}>
              <Ionicons name={tempIndicator.icon} size={18} color={tempIndicator.color} />
              <Text style={[styles.statStatus, {color: tempIndicator.color}]}>{tempIndicator.status}</Text>
            </View>
          </View>

          <View style={styles.detailStatisticOne}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Soil Moisture</Text>
              <Text style={styles.statValue}>
                {currentSensorData ? `${currentSensorData.Humidity}%` : 'No Data'}
              </Text>
            </View>
            <View style={styles.statExtra}>
              <Ionicons name={humidityIndicator.icon} size={18} color={humidityIndicator.color} />
              <Text style={[styles.statStatus, {color: humidityIndicator.color}]}>{humidityIndicator.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.soilStatisticTwo}>
          <View style={styles.detailStatisticOne}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>PH</Text>
              <Text style={styles.statValue}>
                {currentSensorData ? `${currentSensorData.pH}` : 'No Data'}
              </Text>
            </View>
            <View style={styles.statExtra}>
              <Ionicons name={phIndicator.icon} size={18} color={phIndicator.color} />
              <Text style={[styles.statStatus, {color: phIndicator.color}]}>{phIndicator.status}</Text>
            </View>
          </View>

          <View style={styles.detailStatisticOne}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Conductivity</Text>
              <Text style={styles.statValue}>
                {currentSensorData ? `${currentSensorData.EC} mS/cm` : 'No Data'}
              </Text>
            </View>
            <View style={styles.statExtra}>
              <Ionicons name={ecIndicator.icon} size={18} color={ecIndicator.color} />
              <Text style={[styles.statStatus, {color: ecIndicator.color}]}>{ecIndicator.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.soilStatisticTwo}>
          <View style={styles.detailStatisticOne}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Nitrogen</Text>
              <Text style={styles.statValue}>
                {currentSensorData ? `${currentSensorData.Nitrogen} mg/L` : 'No Data'}
              </Text>
            </View>
            <View style={styles.statExtra}>
              <Ionicons name={nitrogenIndicator.icon} size={18} color={nitrogenIndicator.color} />
              <Text style={[styles.statStatus, {color: nitrogenIndicator.color}]}>{nitrogenIndicator.status}</Text>
            </View>
          </View>

          <View style={styles.detailStatisticOne}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Phosphorus</Text>
              <Text style={styles.statValue}>
                {currentSensorData ? `${currentSensorData.Phosphorus} mg/L` : 'No Data'}
              </Text>
            </View>
            <View style={styles.statExtra}>
              <Ionicons name={phosphorusIndicator.icon} size={18} color={phosphorusIndicator.color} />
              <Text style={[styles.statStatus, {color: phosphorusIndicator.color}]}>{phosphorusIndicator.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.soilStatisticTwo}>
          <View style={styles.detailStatisticOneKal}>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Kalium</Text>
              <Text style={styles.statValue}>
                {currentSensorData ? `${currentSensorData.Kalium} mg/L` : 'No Data'}
              </Text>
            </View>
            <View style={styles.statExtra}>
              <Ionicons name={kaliumIndicator.icon} size={18} color={kaliumIndicator.color} />
              <Text style={[styles.statStatus, {color: kaliumIndicator.color}]}>{kaliumIndicator.status}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
        <View style={styles.containerButton}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleRescan}
          >
            <Text style={styles.textButton}>Scan Ulang</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={openModal}
          >
            <Text style={styles.textButton}>Save Result</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Modal */}
      {isModalVisible && (
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {transform: [{translateY: modalTranslateY}]},
            ]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save Result</Text>
            </View>
            <Text style={styles.nameResultText}>Name the result</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Enter your result name"
              placeholderTextColor="#999"
              value={resultName}
              onChangeText={setResultName}
              editable={!isSaving}
            />
            <View style={styles.resultOption}>
              <TouchableOpacity style={styles.cancelResult} onPress={closeModal} disabled={isSaving}>
                <Text style={styles.textButton}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmResult, isSaving && { opacity: 0.6 }]}
                onPress={handleSaveResult}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.textButton}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Rescan Popup Modal - Updated to match MainTabs styling */}
      {isRescanPopupVisible && (
        <Modal
          visible={isRescanPopupVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsRescanPopupVisible(false)}
        >
          <View style={styles.modalRescanOverlay}>
          <View style={styles.modalRescanBox}>
            <View style={styles.containerRescanImage}>
              <ImgLoadPortable/>
            </View>
            <View style={styles.containerRescanText}>
            <Text style={styles.modalRescanText}>{loadingText}</Text>
            </View>
          </View>
        </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F4F6FA', padding: 16},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 375,
    height: 32,
    paddingTop: 4,
    paddingBottom: 4,
    marginTop: 6,
  },
  cardTwo: {
    width: '100%',
    height: 282,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  soilStatisticOne: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
    marginHorizontal: 1,
    gap: 8,
  },
  soilStatisticTwo: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginHorizontal: 1,
    gap: 8,
  },
  detailStatisticOne: {
    paddingHorizontal: 8,
    flex: 1,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEE2E7',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  detailStatisticOneKal: {
    paddingHorizontal: 8,
    flex: 0.47,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEE2E7',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  statContent: {
    flex: 1,
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  statExtra: {
    flexDirection: 'column',
    marginTop: 10,
    alignItems: 'center',
    marginLeft: 8,
  },
  statStatus: {
    fontSize: 12.5,
    marginLeft: 4,
  },
  soilTitle: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: -20,
    right: -20,
    height: 81,
    paddingTop: 16,
    paddingHorizontal: 25,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  containerButton: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    right: 4,
    top: 1,
  },
  cancelButton: {
    width: 180,
    height: 36,
    borderRadius: 8,
    borderColor: '#B4DC45',
    borderWidth: 1,
    alignItems: 'center',
  },
  textButton: {
    alignItems: 'center',
    textAlign: 'center',
    top: 6,
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  confirmButton: {
    width: 180,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#B4DC45',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: 364,
    height: 172,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    paddingBottom: 30,
    marginBottom: 20,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  nameResultText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'SpaceGrotesk-Regular',
    marginTop: -17,
    marginBottom: 10,
  },
  inputField: {
    height: 44,
    borderWidth: 1,
    borderColor: '#DEE2E7',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    fontFamily: 'SpaceGrotesk-Regular',
    backgroundColor: '#F9F9F9',
  },
  resultOption: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelResult: {
    width: 162.5,
    height: 36,
    borderColor: '#B4DC45',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmResult: {
    width: 162.5,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#B4DC45',
    alignItems: 'center',
  },
  containerText: {
    alignItems: 'center',
  },
  modalRescanOverlay:{
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalRescanBox: {
    width: 141,
    height: 121,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  containerRescanImage:{
    alignItems: "center",
    width: 67,
    height: 53,
  },
  containerRescanText: {
    width: 141,
    borderRadius: 1,
    alignItems: "center",
  },
  modalRescanText: {
    fontSize: 14,
    fontWeight: 400,
    fontFamily: 'SpaceGrotesk-Regular',
    marginTop: 13,
  }
});

export default ReadSoil;