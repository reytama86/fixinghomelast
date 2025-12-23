import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  TextInput,
  PermissionsAndroid,
  Platform,
  KeyboardAvoidingView,
  BackHandler,
  Dimensions,
  ScrollView,
} from 'react-native';
import {Animated} from 'react-native';
import {BleManager, Device} from 'react-native-ble-plx';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {HomeStackParamList} from '../../../../HomeStack';
import {ArrowLeft2} from 'iconsax-react-native';
import {MainTabParamList, SoilSensorData} from '../../../../MainTabs';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {RouteProp, useFocusEffect, useRoute} from '@react-navigation/native';
import {Buffer} from 'buffer';
import ImgLoadPortable from '../../../Assets/svg/ImgLoadPortable';
import {useControl} from '../../../Context/ControlContext';
import GaugeSvg from '@Atom/Gauge';
import Ellips from '../../../Assets/svg/Ellips';
import styles from './styles';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const SERVICE_UUID = '5900f86c-57d7-422c-8aa8-fd6216fa496b';
const CHARACTERISTIC_UUID = 'a0863556-7065-46e6-96ee-99e3f693cb7f';
const REQUEST_CHAR_UUID = 'b1974667-8166-57f7-a7bb-0e7327ab507c';

type CompactSensorData = {
  H: number;
  T: number;
  E: number;
  P: number;
  N: number;
  K: number;
  L: number;
};

type PortableData = {
  keterangan_portable: string;
  created_at: string;
  sensors?: Array<{
    keterangan_sensor: string;
    nilai_sensor: number;
  }>;
};

type ReadSoilRouteProp = RouteProp<MainTabParamList, 'ReadSoil'>;
type Props = BottomTabScreenProps<MainTabParamList, 'ReadSoil'> & {
  route: {
    params: {
      bleStatus?: 'scanning' | 'connecting' | 'connected' | 'disconnected';
      sensorData?: SoilSensorData;
      portableData?: PortableData;
      isHistoryMode?: boolean;
    };
  };
};

const PortableSensorScreen: React.FC<Props> = ({navigation, route}) => {
  const {
    bleStatus: initialBleStatus,
    sensorData: initialSensorData,
    portableData,
    isHistoryMode = false,
  } = route.params || {};

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRescanPopupVisible, setIsRescanPopupVisible] = useState(false);
  const modalAnimation = useState(new Animated.Value(0))[0];
  const [currentSensorData, setCurrentSensorData] = useState<SoilSensorData | null>(
    initialSensorData || null
  );

  const [dotCount, setDotCount] = useState(0);
  const [bleStatus, setBleStatus] = useState<
    'scanning' | 'connecting' | 'connected' | 'disconnected'
  >(initialBleStatus || 'disconnected');
  const {publish, isConnected} = useControl();
  const [bleManager] = useState(() => new BleManager());
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [resultName, setResultName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const PORTABLE_TOPIC = 'data/portable';

  const monitoringSubscription = useRef<any>(null);
  const isScanning = useRef(false);

  // Jika mode history, convert portableData ke SoilSensorData
  useEffect(() => {
    if (isHistoryMode && portableData) {
      const convertedData = convertPortableDataToSensorData(portableData);
      setCurrentSensorData(convertedData);
    }
  }, [isHistoryMode, portableData]);

  const convertPortableDataToSensorData = (data: PortableData): SoilSensorData => {
    const getSensorValue = (type: string): number => {
      const sensor = data.sensors?.find(
        s => s.keterangan_sensor?.toLowerCase() === type.toLowerCase()
      );
      return sensor?.nilai_sensor || 0;
    };

    return {
      Humidity: getSensorValue('humidity'),
      Temp: getSensorValue('temperature'),
      EC: getSensorValue('ec'),
      pH: getSensorValue('ph'),
      Nitrogen: getSensorValue('nitrogen'),
      Phosphorus: getSensorValue('phosphorus'),
      Kalium: getSensorValue('kalium'),
    };
  };

  const publishSavedResult = (
    sensorData: SoilSensorData,
    resultName: string,
    deviceId?: string
  ) => {
    if (!isConnected) {
      console.warn('MQTT not connected, cannot publish saved result');
      return;
    }

    const payload = {
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
        kalium: sensorData.Kalium,
      },
      metadata: {
        source: 'portable_sensor',
        savedAt: Date.now(),
        location: 'field',
        readingType: 'saved',
      },
    };

    try {
      publish(`${PORTABLE_TOPIC}/saved`, payload);
      console.log('Saved result published to MQTT:', payload);
    } catch (error) {
      console.error('Error publishing saved result to MQTT:', error);
    }
  };

  const getStatusIndicator = (value: number, type: string) => {
    let status = 'Low';
    let color = '#EF4444';
    let icon = 'arrow-down';

    switch (type) {
      case 'temperature':
        if (value >= 20 && value <= 32) {
          status = 'Good';
          color = '#22C55E';
          icon = 'checkmark-circle';
        }
        break;
      case 'humidity':
        if (value >= 20 && value <= 80) {
          status = 'Good';
          color = '#22C55E';
          icon = 'checkmark-circle';
        }
        break;
      case 'ph':
        if (value >= 4.5 && value <= 8) {
          status = 'Good';
          color = '#22C55E';
          icon = 'checkmark-circle';
        }
        break;
      case 'ec':
        if (value >= 0 && value <= 4000) {
          status = 'Good';
          color = '#22C55E';
          icon = 'checkmark-circle';
        }
        break;
      case 'nitrogen':
        if (value >= 0.1 && value <= 20) {
          status = 'Good';
          color = '#22C55E';
          icon = 'checkmark-circle';
        }
        break;
      case 'phosphorus':
        if (value >= 0.1 && value <= 10) {
          status = 'Good';
          color = '#22C55E';
          icon = 'checkmark-circle';
        }
        break;
      case 'kalium':
        if (value >= 0.1 && value <= 15) {
          status = 'Good';
          color = '#22C55E';
          icon = 'checkmark-circle';
        }
        break;
    }

    return {status, color, icon};
  };

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
      Kalium: compactData.L,
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

              const requiredFields = [
                'Humidity',
                'Temp',
                'EC',
                'pH',
                'Nitrogen',
                'Phosphorus',
                'Kalium',
              ];
              const missingFields = requiredFields.filter(
                field => data[field] === undefined || data[field] === null
              );

              if (missingFields.length > 0) {
                console.error('Missing fields in sensor data:', missingFields);
                return;
              }

              const invalidFields = requiredFields.filter(
                field => typeof data[field] !== 'number' || isNaN(data[field])
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

  const handleRescan = () => {
    setIsRescanPopupVisible(true);
    setDotCount(0);
  };

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

  useEffect(() => {
    if (!isRescanPopupVisible) return;

    let timeoutId: ReturnType<typeof setTimeout>;

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

          device
            .connect()
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

  useEffect(() => {
    if (!isRescanPopupVisible) return;

    if (bleStatus === 'connected') {
      const checkDataInterval = setInterval(() => {
        if (currentSensorData) {
          clearInterval(checkDataInterval);
          setTimeout(() => {
            setIsRescanPopupVisible(false);
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

  useEffect(() => {
    return () => {
      resetBLEState();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  const openModal = () => {
    setIsModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsModalVisible(false));
  };

  const handleGoBack = async () => {
    if (!isHistoryMode) {
      await resetBLEState();
    }
    navigation.goBack();
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
      if (Platform.OS === 'android' && !isHistoryMode) {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
      }
    }
    requestPermissions();
  }, []);

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
      publishSavedResult(currentSensorData, resultName, connectedDevice?.id);
      Alert.alert('Success', 'Result saved and published successfully!', [
        {text: 'OK', onPress: () => closeModal()},
      ]);
      console.log('Result saved:', {
        name: resultName,
        data: currentSensorData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving result:', error);
      Alert.alert('Error', 'Failed to save result. Please try again.');
    } finally {
      setIsSaving(false);
      setResultName('');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${datePart} at ${timePart}`;
  };

  const tempIndicator = currentSensorData
    ? getStatusIndicator(currentSensorData.Temp, 'temperature')
    : {status: 'No Data', color: '#9CA3AF', icon: 'remove'};
  const humidityIndicator = currentSensorData
    ? getStatusIndicator(currentSensorData.Humidity, 'humidity')
    : {status: 'No Data', color: '#9CA3AF', icon: 'remove'};
  const phIndicator = currentSensorData
    ? getStatusIndicator(currentSensorData.pH, 'ph')
    : {status: 'No Data', color: '#9CA3AF', icon: 'remove'};
  const ecIndicator = currentSensorData
    ? getStatusIndicator(currentSensorData.EC, 'ec')
    : {status: 'No Data', color: '#9CA3AF', icon: 'remove'};
  const nitrogenIndicator = currentSensorData
    ? getStatusIndicator(currentSensorData.Nitrogen, 'nitrogen')
    : {status: 'No Data', color: '#9CA3AF', icon: 'remove'};
  const phosphorusIndicator = currentSensorData
    ? getStatusIndicator(currentSensorData.Phosphorus, 'phosphorus')
    : {status: 'No Data', color: '#9CA3AF', icon: 'remove'};
  const kaliumIndicator = currentSensorData
    ? getStatusIndicator(currentSensorData.Kalium, 'kalium')
    : {status: 'No Data', color: '#9CA3AF', icon: 'remove'};

  const loadingText = `Gathering Data${'.'.repeat(dotCount)}`;

  const StatCard = ({
    label,
    value,
    indicator,
  }: {
    label: string;
    value: string;
    indicator: {status: string; color: string; icon: string};
  }) => (
    <View style={styles.statCard}>
      <View style={styles.statCardContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <View style={styles.statIndicator}>
        <Ionicons name={indicator.icon} size={16} color={indicator.color} />
        <Text style={[styles.statStatus, {color: indicator.color}]}>{indicator.status}</Text>
      </View>
    </View>
  );

  // Render mode history dengan gauge
  if (isHistoryMode && portableData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft2 color="#1F2937" variant="Linear" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{portableData.keterangan_portable}</Text>
          <View style={styles.placeholderButton} />
        </View>

        <Text style={styles.textInfoTested}>
          Tested on {formatDate(portableData.created_at)}
        </Text>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Gauge Cards */}
          <View style={styles.containerTransmisi}>
            <View style={[styles.cardTransmisi, {marginRight: 12}]}>
              <View style={styles.cardDetailTransmisi}>
                <View style={styles.Transmisi}>
                  <GaugeSvg />
                  <View style={{top: -100, right: -105}}>
                    <Ellips />
                  </View>
                </View>
                <Text style={styles.nameSensorTransmisi}>Soil Temperature</Text>
              </View>
              <Text style={styles.valueTransmisi}>
                {currentSensorData ? `${currentSensorData.Temp.toFixed(0)}°` : 'N/A'}
              </Text>
            </View>
            <View style={styles.cardTransmisi}>
              <View style={styles.cardDetailTransmisi}>
                <View style={styles.Transmisi}>
                  <GaugeSvg />
                </View>
                <Text style={styles.nameSensorTransmisi}>Soil Humidity</Text>
              </View>
              <Text style={styles.valueTransmisi}>
                {currentSensorData ? `${currentSensorData.Humidity.toFixed(0)}%` : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Soil Statistics */}
          <View style={styles.cardTwo}>
            <Text style={styles.soilTitle}>Soil Statistic</Text>

            <View style={styles.soilStatisticOne}>
              <View style={styles.detailStatisticOne}>
                <View style={styles.statContent}>
                  <Text style={styles.statLabelHistory}>PH</Text>
                  <Text style={styles.statValueHistory}>
                    {currentSensorData ? currentSensorData.pH.toFixed(1) : 'N/A'}
                  </Text>
                </View>
                <View style={styles.statExtra}>
                  <Ionicons name={phIndicator.icon} size={18} color={phIndicator.color} />
                  <Text style={[styles.statStatusHistory, {color: phIndicator.color}]}>
                    {phIndicator.status}
                  </Text>
                </View>
              </View>

              <View style={styles.detailStatisticOne}>
                <View style={styles.statContent}>
                  <Text style={styles.statLabelHistory}>Conductivity</Text>
                  <Text style={styles.statValueHistory}>
                    {currentSensorData ? `${Math.round(currentSensorData.EC)} μS/cm` : 'N/A'}
                  </Text>
                </View>
                <View style={styles.statExtra}>
                  <Ionicons name={ecIndicator.icon} size={18} color={ecIndicator.color} />
                  <Text style={[styles.statStatusHistory, {color: ecIndicator.color}]}>
                    {ecIndicator.status}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.soilStatisticTwo}>
              <View style={styles.detailStatisticOne}>
                <View style={styles.statContent}>
                  <Text style={styles.statLabelHistory}>Nitrogen</Text>
                  <Text style={styles.statValueHistory}>
                    {currentSensorData
                      ? `${currentSensorData.Nitrogen.toFixed(0)} mg/kg`
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.statExtra}>
                  <Ionicons
                    name={nitrogenIndicator.icon}
                    size={18}
                    color={nitrogenIndicator.color}
                  />
                  <Text style={[styles.statStatusHistory, {color: nitrogenIndicator.color}]}>
                    {nitrogenIndicator.status}
                  </Text>
                </View>
              </View>

              <View style={styles.detailStatisticOne}>
                <View style={styles.statContent}>
                  <Text style={styles.statLabelHistory}>Phosphor</Text>
                  <Text style={styles.statValueHistory}>
                    {currentSensorData
                      ? `${currentSensorData.Phosphorus.toFixed(0)} mg/kg`
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.statExtra}>
                  <Ionicons
                    name={phosphorusIndicator.icon}
                    size={18}
                    color={phosphorusIndicator.color}
                  />
                  <Text style={[styles.statStatusHistory, {color: phosphorusIndicator.color}]}>
                    {phosphorusIndicator.status}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.soilStatisticTwo}>
              <View style={styles.detailStatisticOneKal}>
                <View style={styles.statContent}>
                  <Text style={styles.statLabelHistory}>Kalium</Text>
                  <Text style={styles.statValueHistory}>
                    {currentSensorData
                      ? `${currentSensorData.Kalium.toFixed(0)} mg/kg`
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.statExtra}>
                  <Ionicons
                    name={kaliumIndicator.icon}
                    size={18}
                    color={kaliumIndicator.color}
                  />
                  <Text style={[styles.statStatusHistory, {color: kaliumIndicator.color}]}>
                    {kaliumIndicator.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render mode scan baru
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft2 color="#1F2937" variant="Linear" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portable Tools Result</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Soil Statistic</Text>

          <View style={styles.statRow}>
            <StatCard
              label="Soil Temperature"
              value={currentSensorData ? `${currentSensorData.Temp}°C` : 'No Data'}
              indicator={tempIndicator}
            />
            <StatCard
              label="Soil Moisture"
              value={currentSensorData ? `${currentSensorData.Humidity}%` : 'No Data'}
              indicator={humidityIndicator}
            />
          </View>

          <View style={styles.statRow}>
            <StatCard
              label="PH"
              value={currentSensorData ? `${currentSensorData.pH}` : 'No Data'}
              indicator={phIndicator}
            />
            <StatCard
              label="Conductivity"
              value={currentSensorData ? `${currentSensorData.EC} μS/cm` : 'No Data'}
              indicator={ecIndicator}
            />
          </View>

          <View style={styles.statRow}>
            <StatCard
              label="Nitrogen"
              value={currentSensorData ? `${currentSensorData.Nitrogen} mg/kg` : 'No Data'}
              indicator={nitrogenIndicator}
            />
            <StatCard
              label="Phosphorus"
              value={
                currentSensorData ? `${currentSensorData.Phosphorus} mg/kg` : 'No Data'
              }
              indicator={phosphorusIndicator}
            />
          </View>

          <View style={styles.statRow}>
            <StatCard
              label="Kalium"
              value={currentSensorData ? `${currentSensorData.Kalium} mg/kg` : 'No Data'}
              indicator={kaliumIndicator}
            />
            <View style={styles.statCardPlaceholder} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.outlineButton} onPress={handleRescan}>
            <Text style={styles.outlineButtonText}>Scan Ulang</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={openModal}>
            <Text style={styles.primaryButtonText}>Save Result</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isModalVisible && (
        <Modal
          visible={isModalVisible}
          transparent
          animationType="none"
          onRequestClose={closeModal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal} />
            <Animated.View
              style={[styles.modalContent, {transform: [{translateY: modalTranslateY}]}]}>
              <Text style={styles.modalTitle}>Save Result</Text>
              <Text style={styles.modalSubtitle}>Name the result</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your result name"
                placeholderTextColor="#9CA3AF"
                value={resultName}
                onChangeText={setResultName}
                editable={!isSaving}
                autoFocus
              />
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalOutlineButton}
                  onPress={closeModal}
                  disabled={isSaving}>
                  <Text style={styles.modalOutlineButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalPrimaryButton, isSaving && styles.modalButtonDisabled]}
                  onPress={handleSaveResult}
                  disabled={isSaving}>
                  {isSaving ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.modalPrimaryButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {isRescanPopupVisible && (
        <Modal
          visible={isRescanPopupVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsRescanPopupVisible(false)}>
          <View style={styles.loadingModalOverlay}>
            <View style={styles.loadingModalContent}>
              <ImgLoadPortable />
              <Text style={styles.loadingText}>{loadingText}</Text>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};



export default PortableSensorScreen;