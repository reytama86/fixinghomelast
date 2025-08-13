import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  BackHandler,
} from 'react-native';
import React, {useCallback, useMemo, useState} from 'react';
import {ArrowLeft2} from 'iconsax-react-native';
import GaugeSvg from '../../GaugeComponent';
import EllipseIndicator from '../../EllipsIndicator';
import {useRef, useEffect} from 'react';
import {Animated} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Video, VideoRef} from 'react-native-video';
import Ellips from '../../../assets/svg/Ellips';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../../HomeStack'; // pastikan path sesuai lokasi
import {useMqtt} from './Services/UseMqtt';
import {AppState, AppStateStatus} from 'react-native';
import ConfirmModal from './Modal/ConfirmModal';
import {useControlState} from './Services/useControlState';
import {useControl, usePageControl} from '../../../context/ControlContext';
import LottieView from 'lottie-react-native';
import {useFocusEffect} from '@react-navigation/native';
import PowerOffIcon from '../../../assets/svg/PowerOffIcon';
import PowerOnIcon from '../../../assets/svg/PowerOnIcon';

type Props = NativeStackScreenProps<HomeStackParamList, 'DetailBlockTwo'>;

interface SensorInfo {
  keterangan_sensor: string;
  nilai_sensor: number | null;
  created_at: string | null;
  timestamp: string | null;
}

interface SensorData {
  sensor_1: SensorInfo[];
  sensor_2: SensorInfo[];
  sensor_3: SensorInfo[];
}

interface ApiResponse {
  success: boolean;
  data: SensorData;
  timestamp: string;
}

interface DeviceProps {
  sensorData: SensorData | null;
}

const SensorItem = React.memo<{
  label: string;
  value: number;
  sensorType: string;
  unit?: string;
}>(({ label, value, sensorType, unit = '' }) => {
  const statusInfo = useMemo(() => getSensorStatus(value, sensorType), [value, sensorType]);

  return (
    <View style={styles.gridItem}>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>
          {value !== null ? `${value}${unit}` : 'N/A'}
        </Text>
      </View>
      <View style={styles.statExtra}>
        {statusInfo.icon && (
          <Ionicons
            name={statusInfo.icon}
            size={16}
            color={statusInfo.color}
          />
        )}
        <Text style={[styles.statStatus, {color: statusInfo.color}]}>
          {statusInfo.status}
        </Text>
      </View>
    </View>
  );
});

// Extract sensor status logic outside component
// const getSensorStatus = (value: number | null, sensorType: string) => {
//   const thresholds: Record<string, { good: [number, number]; unit: string }> = {
//     'Kalium': { good: [10, 15], unit: 'mg/kg' },
//     'EC': { good: [30, 50], unit: '' },
//     'PH': { good: [6, 7.5], unit: '' },
//     'Nitrogen': { good: [10, 20], unit: 'mg/kg' },
//     'Phosphor': { good: [5, 15], unit: 'mg/kg' },
//     'Soil Humidity': { good: [40, 60], unit: '%' },
//     'Soil Temperature': { good: [20, 30], unit: '°C' },
//     'Temperature': { good: [25, 35], unit: '°C' },
//     'Humidity': { good: [60, 80], unit: '%' }
//   };

//   const threshold = thresholds[sensorType];
//   if (!threshold || value === null) return { status: 'Unknown', color: 'gray', icon: null };

//   const [min, max] = threshold.good;
  
//   if (value >= min && value <= max) {
//     return { status: 'Good', color: 'green', icon: null };
//   } else if (value < min) {
//     return { status: 'Low', color: 'red', icon: 'arrow-down' };
//   } else {
//     return { status: 'High', color: 'red', icon: 'arrow-up' };
//   }
// };

const getSensorStatus = (value: number, sensorType: string) => {
  const thresholds = {
    Kalium: {good: [10, 15], unit: 'mg/kg'},
    EC: {good: [30, 50], unit: ''},
    PH: {good: [6, 7.5], unit: ''},
    Nitrogen: {good: [10, 20], unit: 'mg/kg'},
    Phosphor: {good: [5, 15], unit: 'mg/kg'},
    'Soil Humidity': {good: [40, 60], unit: '%'},
    'Soil Temperature': {good: [20, 30], unit: '°'},
    Temperature: {good: [25, 35], unit: '°'},
    Humidity: {good: [60, 80], unit: '%'},
    Light: {good: [10000, 15000], unit: 'Lux'},
  };

  const threshold = thresholds[sensorType];
  if (!threshold || value === null)
    return {status: 'Unknown', color: 'gray', icon: null};

  const [min, max] = threshold.good;

  if (value >= min && value <= max) {
    return {status: 'Good', color: 'green', icon: null};
  } else if (value < min) {
    return {status: 'Low', color: 'red', icon: 'arrow-down'};
  } else {
    return {status: 'High', color: 'red', icon: 'arrow-up'};
  }
};

const DetailBlockTwo: React.FC<Props> = ({ navigation }) => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Changed to false initially
  const [selectedDuration, setSelectedDuration] = useState<number>(0);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [inputMinutes, setInputMinutes] = useState<string>('1');
  const [inputSeconds, setInputSeconds] = useState<string>('0');
  const [currentProcess, setCurrentProcess] = useState<'water' | 'fertilizer' | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'water' | 'fertilizer' | null>(null);

  const minutesInputRef = useRef<TextInput>(null);
  const secondsInputRef = useRef<TextInput>(null);
  const waterLottieRef = useRef<LottieView>(null);
  const fertLottieRef = useRef<LottieView>(null);
  const rotation = useRef(new Animated.Value(0)).current;
  const isMountedRef = useRef(true);

  const { block2Control } = useControl();
  const controlState = block2Control;
  const { setActivePage } = usePageControl();

  const fetchSensorData = useCallback(async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://iot-vanili-api.permataindonesia.com/api/latest-sensor-block2',
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: ApiResponse = await response.json();
  
        if (result.success) {
          setSensorData(result.data);
        } else {
          Alert.alert('Error', 'Failed to fetch sensor data');
        }
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        Alert.alert('Error', 'Network error occurred');
      } finally {
        setLoading(false);
      }
    }, []);

   useFocusEffect(
    useCallback(() => {
      setActivePage('block2');
      fetchSensorData();
  
      const onBackPress = () => {
        navigation.navigate('HomeFix');
        return true; // cegah default behavior
      };
  
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
      return () => {
        subscription.remove();
      };
    }, [navigation, setActivePage, fetchSensorData])
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (waterLottieRef.current && isMountedRef.current) {
      try {
        if (controlState.isWaterOn) {
          waterLottieRef.current.play();
        } else {
          waterLottieRef.current.pause();
        }
      } catch (error) {
        console.error('Error controlling water lottie:', error);
      }
    }
  }, [controlState.isWaterOn]);

  useEffect(() => {
    if (fertLottieRef.current && isMountedRef.current) {
      try {
        if (controlState.isFertilizerOn) {
          fertLottieRef.current.play();
        } else {
          fertLottieRef.current.pause();
        }
      } catch (error) {
        console.error('Error controlling fert lottie:', error);
      }
    }
  }, [controlState.isFertilizerOn]);

  const Device1 = React.memo<DeviceProps>(({ sensorData }) => {
    const getSensorValue = useCallback((sensorArray: SensorInfo[], keterangan: string): number => {
      const sensor = sensorArray?.find(
        item => item.keterangan_sensor === keterangan,
      );
      return sensor?.nilai_sensor || 0;
    }, []);
  
    if (!sensorData?.sensor_1) return null;
  
    const sensor1Data = sensorData.sensor_1;
  
    return (
      <View style={styles.cardTwo}>
        <Text style={styles.soilTitle}>Statistic Device 1</Text>
        <View style={styles.cardContentTwo}>
          <Text style={styles.soilSubTitle}>Soil Statistic</Text>
  
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <SensorItem
                label="Soil Temperature"
                value={getSensorValue(sensor1Data, 'Soil Temperature')}
                sensorType="Soil Temperature"
                unit="°"
              />
              <SensorItem
                label="Soil Humidity"
                value={getSensorValue(sensor1Data, 'Soil Humidity')}
                sensorType="Soil Humidity"
                unit="%"
              />
            </View>
            <View style={styles.gridRow}>
              <SensorItem
                label="Conductivity"
                value={getSensorValue(sensor1Data, 'EC')}
                sensorType="EC"
                unit="μS/cm"
              />
              <SensorItem
                label="PH"
                value={getSensorValue(sensor1Data, 'PH')}
                sensorType="PH"
              />
            </View>
            <View style={styles.gridRow}>
              <SensorItem
                label="Nitrogen"
                value={getSensorValue(sensor1Data, 'Nitrogen')}
                sensorType="Nitrogen"
                unit=" mg/kg"
              />
              <SensorItem
                label="Phosphor"
                value={getSensorValue(sensor1Data, 'Phosphor')}
                sensorType="Phosphor"
                unit=" mg/kg"
              />
            </View>
            <View style={styles.gridRow}>
              <SensorItem
                label="Kalium"
                value={getSensorValue(sensor1Data, 'Kalium')}
                sensorType="Kalium"
                unit=" mg/kg"
              />
              <View style={styles.gridItemEmpty} />
            </View>
          </View>
        </View>
      </View>
    );
  });
  
  const Device2 = React.memo<DeviceProps>(({ sensorData }) => {
    const getSensorValue = useCallback((sensorArray: SensorInfo[], keterangan: string): number => {
      const sensor = sensorArray?.find(
        item => item.keterangan_sensor === keterangan,
      );
      return sensor?.nilai_sensor || 0;
    }, []);
  
    if (!sensorData?.sensor_2) return null;
  
    const sensor2Data = sensorData.sensor_2;
  
    const temperatureValue = useMemo(() => 
      getSensorValue(sensor2Data, 'Temperature') || 0, 
      [getSensorValue, sensor2Data]
    );
    
    const humidityValue = useMemo(() => 
      getSensorValue(sensor2Data, 'Humidity') || 0, 
      [getSensorValue, sensor2Data]
    );
  
    return (
      <View style={styles.cardThree}>
        <Text style={styles.soilTitle}>Statistic Device 2</Text>
  
        <View style={styles.containerTransmisi}>
          <View style={[styles.cardTransmisi, {marginRight: 12}]}>
            <View style={styles.cardDetailTransmisi}>
              <View style={styles.Transmisi}>
                <GaugeSvg />
                <View style={{top: -100, right: -105}}>
                  <Ellips />
                </View>
              </View>
              <Text style={styles.nameSensorTransmisi}>Temperature</Text>
            </View>
            <Text style={styles.valueTransmisi}>
              {temperatureValue}°
            </Text>
          </View>
          <View style={styles.cardTransmisi}>
            <View style={styles.cardDetailTransmisi}>
              <View style={styles.Transmisi}>
                <GaugeSvg />
              </View>
              <Text style={styles.nameSensorTransmisi}>Humidity</Text>
            </View>
            <Text style={styles.valueTransmisi}>
              {humidityValue}%
            </Text>
          </View>
        </View>
  
        <View style={styles.cardContentTwo}>
          <Text style={styles.soilSubTitle}>Soil Statistic</Text>
  
          <View style={styles.gridContainer}>
            {/* Row 1 */}
            <View style={styles.gridRow}>
              <SensorItem
                label="Soil Temperature"
                value={getSensorValue(sensor2Data, 'Soil Temperature')}
                sensorType="Soil Temperature"
                unit="°"
              />
              <SensorItem
                label="Soil Humidity"
                value={getSensorValue(sensor2Data, 'Soil Humidity')}
                sensorType="Soil Humidity"
                unit="%"
              />
            </View>
            {/* Row 2 */}
            <View style={styles.gridRow}>
              <SensorItem
                label="Conductivity"
                value={getSensorValue(sensor2Data, 'EC')}
                sensorType="EC"
                unit="μS/cm"
              />
              <SensorItem
                label="PH"
                value={getSensorValue(sensor2Data, 'PH')}
                sensorType="PH"
              />
            </View>
            {/* Row 3 */}
            <View style={styles.gridRow}>
              <SensorItem
                label="Nitrogen"
                value={getSensorValue(sensor2Data, 'Nitrogen')}
                sensorType="Nitrogen"
                unit=" mg/kg"
              />
              <SensorItem
                label="Phosphor"
                value={getSensorValue(sensor2Data, 'Phosphor')}
                sensorType="Phosphor"
                unit=" mg/kg"
              />
            </View>
            {/* Row 4 */}
            <View style={styles.gridRow}>
              <SensorItem
                label="Kalium"
                value={getSensorValue(sensor2Data, 'Kalium')}
                sensorType="Kalium"
                unit=" mg/kg"
              />
              <SensorItem
              label="Light"
              value={getSensorValue(sensor2Data, 'Light')}
              sensorType="Light"
              unit=" Lux"
            />
            </View>
          </View>
        </View>
      </View>
    );
  });
  
  const Device3 = React.memo<DeviceProps>(({ sensorData }) => {
    const getSensorValue = useCallback((sensorArray: SensorInfo[], keterangan: string): number => {
      const sensor = sensorArray?.find(
        item => item.keterangan_sensor === keterangan,
      );
      return sensor?.nilai_sensor || 0;
    }, []);
  
    if (!sensorData?.sensor_3) return null;
  
    const sensor3Data = sensorData.sensor_3;
  
    return (
      <View style={styles.cardTwo}>
        <Text style={styles.soilTitle}>Statistic Device 3</Text>
        <View style={styles.cardContentTwo}>
          <Text style={styles.soilSubTitle}>Soil Statistic</Text>
  
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <SensorItem
                label="Soil Temperature"
                value={getSensorValue(sensor3Data, 'Soil Temperature')}
                sensorType="Soil Temperature"
                unit="°"
              />
              <SensorItem
                label="Soil Humidity"
                value={getSensorValue(sensor3Data, 'Soil Humidity')}
                sensorType="Soil Humidity"
                unit="%"
              />
            </View>
            <View style={styles.gridRow}>
              <SensorItem
                label="Conductivity"
                value={getSensorValue(sensor3Data, 'EC')}
                sensorType="EC"
                unit="μS/cm"
              />
              <SensorItem
                label="PH"
                value={getSensorValue(sensor3Data, 'PH')}
                sensorType="PH"
              />
            </View>
            <View style={styles.gridRow}>
              <SensorItem
                label="Nitrogen"
                value={getSensorValue(sensor3Data, 'Nitrogen')}
                sensorType="Nitrogen"
                unit=" mg/kg"
              />
              <SensorItem
                label="Phosphor"
                value={getSensorValue(sensor3Data, 'Phosphor')}
                sensorType="Phosphor"
                unit=" mg/kg"
              />
            </View>
            <View style={styles.gridRow}>
              <SensorItem
                label="Kalium"
                value={getSensorValue(sensor3Data, 'Kalium')}
                sensorType="Kalium"
                unit=" mg/kg"
              />
              <View style={styles.gridItemEmpty} />
            </View>
          </View>
        </View>
      </View>
    );
  });

  const memoizedDevices = useMemo(() => (
      <>
        <Device1 sensorData={sensorData} />
        <Device2 sensorData={sensorData} />
        <Device3 sensorData={sensorData} />
      </>
    ), [sensorData]);

  const handleToggle = useCallback(
      (type: 'water' | 'fertilizer') => {
        // Cek jika proses yang diminta sudah berjalan, tampilkan konfirmasi stop
        if (type === 'water' && controlState.remainingWaterTime > 0) {
          setConfirmType('water');
          return setShowConfirm(true);
        }
        if (type === 'fertilizer' && controlState.remainingFertTime > 0) {
          setConfirmType('fertilizer');
          return setShowConfirm(true);
        }
    
        // Cek jika proses lain sedang berjalan
        if (type === 'water' && controlState.remainingFertTime > 0) {
          // Jika fertilizer sedang berjalan, tampilkan alert atau modal peringatan
          Alert.alert(
            'Fertilizer Active',
            'Fertilizer is currently running. Please wait until it finishes or stop it first.',
            [{ text: 'OK', style: 'default' }]
          );
          return;
        }
        
        if (type === 'fertilizer' && controlState.remainingWaterTime > 0) {
          // Jika water sedang berjalan, tampilkan alert atau modal peringatan
          Alert.alert(
            'Water Active', 
            'Watering is currently running. Please wait until it finishes or stop it first.',
            [{ text: 'OK', style: 'default' }]
          );
          return;
        }
    
        // Jika tidak ada proses yang berjalan, lanjutkan dengan normal
        setCurrentProcess(type);
        setSelectedDuration(1);
        setShowDurationModal(true);
      },
      [controlState.remainingWaterTime, controlState.remainingFertTime],
    );

  const validateTimeInput = useCallback((value: string, max: number): string => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) return '0';
    if (numValue > max) return max.toString();
    return numValue.toString();
  }, []);

  const handleMinutesChange = useCallback((text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setInputMinutes(numericValue);
  }, []);

  const handleSecondsChange = useCallback((text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setInputSeconds(numericValue);
  }, []);

  const handleStartProcess = useCallback(() => {
    if (!currentProcess) return;
  
    // Validasi input menit dan detik
    const validatedMinutes = validateTimeInput(inputMinutes, 120); // Validasi menit
    const validatedSeconds = validateTimeInput(inputSeconds, 59); // Validasi detik
  
    setInputMinutes(validatedMinutes);
    setInputSeconds(validatedSeconds);
  
    // Menghitung total durasi dalam detik
    const totalMinutes = parseInt(validatedMinutes, 10); // Mengonversi menit ke integer
    const totalSeconds = parseInt(validatedSeconds, 10); // Mengonversi detik ke integer
    
    // Menghitung total durasi dalam detik
    const totalDurationInSeconds = totalMinutes * 60 + totalSeconds; // Total dalam detik
  
    // Memastikan durasi tidak melebihi batas
    const finalDuration = Math.min(Math.max(totalDurationInSeconds, 6), 7200); // Batas 6 detik hingga 7200 detik (2 jam)
  
    // Memanggil startProcess dengan total durasi dalam detik
    controlState.startProcess(currentProcess, finalDuration); 
  
    setShowDurationModal(false);
    setInputMinutes('1');
    setInputSeconds('0');
  }, [currentProcess, inputMinutes, inputSeconds, controlState, validateTimeInput]);
  

  const handleConfirmStop = useCallback(() => {
    if (confirmType) {
      controlState.stopProcess(confirmType);
    }
    setShowConfirm(false);
  }, [confirmType, controlState]);

  // Format functions
  const formatDateForAndroid = useCallback((date: Date) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
    ];

    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  }, []);

  const formatTimeForAndroid = useCallback((date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }, []);

  const formatTime = useCallback((totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }, []);

  const focusMinutesInput = useCallback(() => {
    minutesInputRef.current?.focus();
  }, []);

  const focusSecondsInput = useCallback(() => {
    secondsInputRef.current?.focus();
  }, []);

  if (loading && !sensorData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B4DC45" />
        <Text style={{fontFamily: "SpaceGrotesk-Medium", color: '#666',}}>Loading sensor data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.main}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.navigate('HomeFix')}
              activeOpacity={0.7}
            >
              <ArrowLeft2
                color="black"
                variant="Linear"
                size={24}
                style={{transform: [{rotate: '360deg'}]}}
              />
            </TouchableOpacity>
            <Text style={{
              fontSize: 18,
              fontWeight: 600,
              fontFamily: 'SpaceGrotesk-Regular',
              right: 5,
              textAlign: 'center',
            }}>Block 6</Text>
            <ArrowLeft2
              color="black"
              variant="Linear"
              size={24}
              style={{transform: [{rotate: '360deg'}]}}
              opacity={0}
            />
          </View>
          
          <View style={styles.controlCentre}>
            <View style={styles.controlCentreBox}>
              <View style={styles.boxControl}>
                <View style={styles.frameTopControl}>
                  <Text style={styles.titleControl}>Water</Text>
                  <TouchableOpacity
                    style={styles.powerButtonContainer}
                    onPress={() => handleToggle('water')}
                    activeOpacity={0.7}
                  >
                    {controlState.isWaterOn ? <PowerOnIcon /> : <PowerOffIcon />}
                  </TouchableOpacity>
                </View>
                <View style={styles.frameVideoPlay}>
                  <LottieView
                    ref={waterLottieRef}
                    source={require('../../../assets/videos/air.mp4.lottie.json')}
                    style={{
                      width: 70,
                      height: 70,
                      opacity: 0.5,
                    }}
                    loop={true}
                    autoPlay={controlState.isWaterOn}
                    resizeMode="cover"
                  />
                  <View style={styles.informationSprayer}>
                    {controlState.remainingWaterTime > 0 ? (
                      <>
                        <Text style={styles.informationSprayerText}>
                          Watering in progress
                        </Text>
                        <Text style={styles.informationSprayerRemain}>
                          {formatTime(controlState.remainingWaterTime)}
                        </Text>
                      </>
                    ) : controlState.lastWaterAction ? (
                      <>
                        <Text style={styles.informationSprayerText}>Last action</Text>
                        <Text style={styles.informationSprayerText}>
                          {formatDateForAndroid(controlState.lastWaterAction)}
                        </Text>
                        <Text style={styles.informationSprayerText}>
                          {formatTimeForAndroid(controlState.lastWaterAction)}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.informationSprayerText}>
                        No recent{'\n'}water{'\n'}activity
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.boxControl}>
                <View style={styles.frameTopControl}>
                  <Text style={styles.titleControl}>Fertilizer</Text>
                  <TouchableOpacity
                    style={styles.powerButtonContainer}
                    onPress={() => handleToggle('fertilizer')}
                    activeOpacity={0.7}
                  >
                    {controlState.isFertilizerOn ? <PowerOnIcon /> : <PowerOffIcon />}
                  </TouchableOpacity>
                </View>
                <View style={styles.frameVideoPlay}>
                  <LottieView
                    ref={fertLottieRef}
                    source={require('../../../assets/videos/pupuk.mp4.lottie.json')}
                    style={{
                      width: 70,
                      height: 70,
                      opacity: 0.5,
                    }}
                    loop={true}
                    autoPlay={controlState.isFertilizerOn}
                    resizeMode="cover"
                  />
                  <View style={styles.informationSprayer}>
                    {controlState.remainingFertTime > 0 ? (
                      <>
                        <Text style={styles.informationSprayerText}>
                          Fertilizing in progress
                        </Text>
                        <Text style={styles.informationSprayerRemain}>
                          {formatTime(controlState.remainingFertTime)}
                        </Text>
                      </>
                    ) : controlState.lastFertAction ? (
                      <>
                        <Text style={styles.informationSprayerText}>Last action</Text>
                        <Text style={styles.informationSprayerText}>
                          {formatDateForAndroid(controlState.lastFertAction)}
                        </Text>
                        <Text style={styles.informationSprayerText}>
                          {formatTimeForAndroid(controlState.lastFertAction)}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.informationSprayerText}>
                        No recent fertilizer activity
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
          {memoizedDevices}
          <Modal
                visible={showDurationModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDurationModal(false)}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={{marginBottom: -10}}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: 'SpaceGrotesk-Medium',
                          fontWeight: 500,
                        }}>
                        Set Time For Watering
                      </Text>
                    </View>
                    <View style={styles.durationInputContainer}>
                      <View style={styles.durationMinutes}>
                        <Text
                          style={{
                            fontFamily: 'SpaceGrotesk-Regular',
                            fontWeight: 400,
                            fontSize: 12,
                            color: '#919EB0',
                            alignSelf: 'center',
                          }}>
                          Minutes
                        </Text>
                        <TouchableOpacity
                          style={styles.boxDurationMinutes}
                          onPress={focusMinutesInput}
                          activeOpacity={0.7}>
                          <TextInput
                            ref={minutesInputRef}
                            style={{
                              alignSelf: 'center',
                              fontFamily: 'SpaceGrotesk-Bold',
                              fontSize: 32,
                              bottom: 4,
                              textAlign: 'center',
                              color: '#000',
                              backgroundColor: 'transparent',
                              borderWidth: 0,
                              padding: 0,
                              margin: 0,
                              width: '100%',
                              height: '100%',
                            }}
                            value={inputMinutes}
                            onChangeText={handleMinutesChange}
                            keyboardType="numeric"
                            maxLength={3}
                            placeholder="1"
                            placeholderTextColor="#BBC3CE"
                            selectTextOnFocus={true}
                          />
                        </TouchableOpacity>
                      </View>
                      <Text style={{alignSelf: 'center'}}>:</Text>
                      <View style={styles.durationMinutes}>
                        <Text
                          style={{
                            fontFamily: 'SpaceGrotesk-Regular',
                            fontWeight: 400,
                            fontSize: 12,
                            color: '#919EB0',
                            alignSelf: 'center',
                          }}>
                          Seconds
                        </Text>
                        <TouchableOpacity
                          style={styles.boxDurationMinutes}
                          onPress={focusSecondsInput}
                          activeOpacity={0.7}>
                          <TextInput
                            ref={secondsInputRef}
                            style={{
                              alignSelf: 'center',
                              fontFamily: 'SpaceGrotesk-Bold',
                              fontSize: 32,
                              bottom: 4,
                              textAlign: 'center',
                              color: '#000',
                              backgroundColor: 'transparent',
                              borderWidth: 0,
                              padding: 0,
                              margin: 0,
                              width: '100%',
                              height: '100%',
                            }}
                            value={inputSeconds}
                            onChangeText={handleSecondsChange}
                            keyboardType="numeric"
                            maxLength={2}
                            placeholder="0"
                            placeholderTextColor="#BBC3CE"
                            selectTextOnFocus={true}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
        
                    <View style={styles.modalButtonContainer}>
                      <TouchableOpacity onPress={() => setShowDurationModal(false)}>
                        <View style={styles.buttonCancelSpray}>
                          <Text style={styles.cancelText}>Cancel</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleStartProcess}>
                        <View style={styles.buttonStartSpray}>
                          <Text style={styles.confirmText}>Start Watering</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
        <ConfirmModal
          visible={showConfirm}
          type={confirmType === 'water' ? 'water' : 'fertilizer'}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirmStop}
        />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 375,
    height: 32,
    paddingTop: 4,
    // paddingRight: 10,
    // paddingLeft: 10,
    paddingBottom: 4,
    marginTop: 20,
    marginBottom: 15,
  },
  scrollContent: {},
  controlCentre: {
    marginBottom: 2,
  },
  controlCentreText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: 600,
    marginBottom: 8,
  },
  controlCentreBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    padding: 5,
    paddingHorizontal: 1,
  },
  boxControl: {
    backgroundColor: 'white',
    flex: 1,
    height: 132,
    borderRadius: 16,
    gap: 2,
  },
  frameTopControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 9,
    marginHorizontal: 1,
    gap: 8,
    // marginBottom: 2,
  },
  titleControl: {
    fontSize: 16,
    fontWeight: 500,
    fontFamily: "SpaceGrotesk-Medium"
  },
  frameVideo: {
    backgroundColor: 'white',
    width: 146,
    height: 70,
    paddingHorizontal: 8,
    // marginTop: 9,
    marginHorizontal: 8,
    marginBottom: 8,
    marginLeft: 20,
  },
  frameVideoPlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  video: {
    width: 70,
    height: 70,
    borderRadius: 8,
    opacity: 0.5,
  },
  informationSprayer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  informationSprayerText: {
    fontSize: 12,
    color: '#BBC3CE',
    textAlign: 'right',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  informationSprayerRemain: {
    fontSize: 12,
    color: 'black',
    textAlign: 'right',
    fontFamily: 'SpaceGrotesk-Medium',
  },
  circleLevel1: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleLevel2: {
    width: 32.5,
    height: 32.5,
    borderRadius: 16.25,
    borderWidth: 1.25,
    borderColor: '#EFFFC2',
    justifyContent: 'center',
    alignItems: 'center',
    // backdropFilter: 'blur(1.25px)',
  },
  circleLevel3: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.25,
    borderColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    // backdropFilter: 'blur(1.75px)',
  },
  circleLevel4: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 5,
    borderColor: '#B4DC45',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleLevel5: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#B8B8B8DE',
    shadowOffset: {width: 0, height: -0.63},
    shadowOpacity: 0.75,
    shadowRadius: 0.25,
  },
  powerIcon: {},
  powerButtonContainer: {},
  shadow: {
    width: 44.9764518737793,
    height: 39.97906494140625,
    top: -9.75,
    position: 'absolute',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    width: 343,
    height: 168,
  },
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  durationButton: {
    padding: 15,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  durationText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#B4DC45',
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 5,
  },
  durationButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  confirmText: {
    color: '#353D48',
    fontWeight: '600',
    alignSelf: 'center',
    fontFamily: 'SpaceGrotesk-Regular',
    padding: 5,
  },
  cancelText: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: 500,
    fontSize: 14,
    color: '#353D48',
    alignSelf: 'center',
    padding: 5,
  },
  durationMinutes: {
    width: 143.5,
    height: 60,
  },
  boxDurationMinutes: {
    width: 143.5,
    height: 44,
    borderColor: '#919EB0',
    borderWidth: 0.75,
    borderRadius: 8,
  },
  buttonCancelSpray: {
    width: 150.5,
    height: 36,
    borderColor: '#B4DC45',
    borderWidth: 1,
    borderRadius: 8,
  },
  buttonStartSpray: {
    backgroundColor: '#B4DC45',
    borderRadius: 8,
    width: 150.5,
    height: 36,
  },
  cardTwo: {
    width: '100%',
    height: 310,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 11,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    backgroundColor: 'white',
    marginBottom: 2,
  },

  cardContentTwo: {
    flex: 1,
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 8,
  },

  soilTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Medium',
    color: '#1F2937',
  },

  soilSubTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Medium',
    color: '#374151',
    marginBottom: 12,
  },

  gridContainer: {
    flex: 1,
    gap: 8,
  },

  gridRow: {
    flexDirection: 'row',
    gap: 8,
    height: 44, 
  },

  gridItem: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statContent: {
    flex: 1,
  },

  statLabel: {
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'SpaceGrotesk-Regular',
    color: '#6B7280',
    marginBottom: 2,
  },

  statValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Medium',
    color: '#1F2937',
  },

  statExtra: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },

  statStatus: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'SpaceGrotesk-Medium',
  },

  gridItemEmpty: {
    width: 155,
    // Empty placeholder - no styling needed
  },
  cardThree: {
    width: '100%',
    height: 470,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 11,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    backgroundColor: 'white',
    marginBottom: 2,
  },
  containerTransmisi: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // flex: 1,
    height: 148,
    marginTop: 12,
    // left : 16,
    gap: 1,
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTransmisi: {
    overflow: 'hidden',
    backgroundColor: 'white',
    flex: 1,
    height: 148,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',

    // padding: 8,
    // paddingRight: 16,
  },
  cardDetailTransmisi: {
    width: 160.5,
    paddingHorizontal: 4,
    height: 132,
    backgroundColor: 'white',
    gap: 4,
    marginTop: 8,
    alignItems: 'center',
  },
  Transmisi: {
    backgroundColor: 'white',
    width: 126,
    height: 112,
  },
  valueTransmisi: {
    position: 'absolute',
    fontSize: 40,
    fontWeight: 600,
    fontFamily: 'SpaceGrotesk-Regular',
    zIndex: 10,
    top: 45,
    textAlign: 'center',
    marginLeft: 10,
  },
  nameSensorTransmisi: {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ... styles lainnya
});

export default DetailBlockTwo;
