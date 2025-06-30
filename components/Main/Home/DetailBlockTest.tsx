import React, {useState, useRef, useCallback, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {ArrowLeft2} from 'iconsax-react-native';
import LottieView from 'lottie-react-native';
import PowerOffIcon from '../../../assets/svg/PowerOffIcon';
import PowerOnIcon from '../../../assets/svg/PowerOnIcon';
import ConfirmModal from './Modal/ConfirmModal';
import {useControl, usePageControl} from '../../../context/ControlContext';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../../HomeStack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GaugeSvg from '../../GaugeComponent';
import Ellips from '../../../assets/svg/Ellips';

type Props = NativeStackScreenProps<HomeStackParamList, 'DetailBlockOne'>;

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

const PowerButton = React.memo<{isActive: boolean; onPress: () => void}>(({
  isActive,
  onPress,
}) => (
  <TouchableOpacity style={styles.powerButton} onPress={onPress}>
    {isActive ? (
      <PowerOnIcon width={42} height={42} />
    ) : (
      <PowerOffIcon width={42} height={42} />
    )}
  </TouchableOpacity>
));

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

const ExpandableBlock = React.memo<{
  title: string;
  animationSource: any;
  blockCount: number;
  blockType: 'water' | 'fertilizer';
  mainControl: any;
  row1Control: any;
  row2Control: any;
}>(({
  title,
  animationSource,
  blockCount,
  blockType,
  mainControl,
  row1Control,
  row2Control,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [currentProcess, setCurrentProcess] = useState<{
    type: 'water' | 'fertilizer';
    target: 'main' | 'row1' | 'row2';
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmProcess, setConfirmProcess] = useState<{
    type: 'water' | 'fertilizer';
    target: 'main' | 'row1' | 'row2';
  } | null>(null);

  const heightAnim = useRef(new Animated.Value(88)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  const rotateInterpolate = useMemo(() => 
    rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['270deg', '90deg'],
    }), [rotateAnim]);

  const [inputMinutes, setInputMinutes] = useState<string>('1');
  const [inputSeconds, setInputSeconds] = useState<string>('0');

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

  const minutesInputRef = useRef<TextInput>(null);
  const secondsInputRef = useRef<TextInput>(null);

  const focusMinutesInput = useCallback(() => {
    minutesInputRef.current?.focus();
  }, []);

  const focusSecondsInput = useCallback(() => {
    secondsInputRef.current?.focus();
  }, []);

  // Memoized format helpers
  const formatHelpers = useMemo(() => ({
    formatDate: (d: Date) => {
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
      ];
      return `${d.getDate().toString().padStart(2, '0')} ${
        months[d.getMonth()]
      } ${d.getFullYear()}`;
    },
    formatTime: (d: Date) =>
      `${d.getHours().toString().padStart(2, '0')}:${d
        .getMinutes()
        .toString()
        .padStart(2, '0')}`,
    formatDuration: (sec: number) => {
      const m = Math.floor(sec / 60)
        .toString()
        .padStart(2, '0');
      const s = (sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    },
  }), []);

  const deriveState = useCallback((ctrl: any) => ({
    isActive: blockType === 'water' ? ctrl.isWaterOn : ctrl.isFertilizerOn,
    remaining:
      blockType === 'water' ? ctrl.remainingWaterTime : ctrl.remainingFertTime,
    last: blockType === 'water' ? ctrl.lastWaterAction : ctrl.lastFertAction,
  }), [blockType]);

  const mainState = useMemo(() => deriveState(mainControl), [deriveState, mainControl]);
  const row1State = useMemo(() => deriveState(row1Control), [deriveState, row1Control]);
  const row2State = useMemo(() => deriveState(row2Control), [deriveState, row2Control]);

  const toggleExpand = useCallback(() => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: expanded ? 88 : 190,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: expanded ? 0 : 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
    setExpanded(prev => !prev);
  }, [expanded, heightAnim, rotateAnim]);

  const handleToggle = useCallback(
    (target: 'main' | 'row1' | 'row2') => {
      const targetControl =
        target === 'main'
          ? mainControl
          : target === 'row1'
          ? row1Control
          : row2Control;
      const isCurrentlyActive =
        blockType === 'water'
          ? targetControl.isWaterOn
          : targetControl.isFertilizerOn;

      if (isCurrentlyActive) {
        setConfirmProcess({type: blockType, target});
        setShowConfirm(true);
      } else {
        setCurrentProcess({type: blockType, target});
        setSelectedDuration(1);
        setShowDurationModal(true);
      }
    },
    [mainControl, row1Control, row2Control, blockType],
  );

  const handleStart = useCallback(() => {
    if (!currentProcess) return;

    const validatedMinutes = validateTimeInput(inputMinutes, 120);
    const validatedSeconds = validateTimeInput(inputSeconds, 59);

    setInputMinutes(validatedMinutes);
    setInputSeconds(validatedSeconds);

    const totalMinutes =
      parseInt(validatedMinutes) + parseInt(validatedSeconds) / 60;
    const finalMinutes = Math.min(Math.max(totalMinutes, 0.1), 120);

    const ctrl =
      currentProcess.target === 'main'
        ? mainControl
        : currentProcess.target === 'row1'
        ? row1Control
        : row2Control;

    ctrl.startProcess(currentProcess.type, finalMinutes);

    setShowDurationModal(false);
    setInputMinutes('1');
    setInputSeconds('0');
    setCurrentProcess(null);
  }, [currentProcess, inputMinutes, inputSeconds, validateTimeInput, mainControl, row1Control, row2Control]);

  const handleStop = useCallback(() => {
    if (!confirmProcess) return;

    const ctrl =
      confirmProcess.target === 'main'
        ? mainControl
        : confirmProcess.target === 'row1'
        ? row1Control
        : row2Control;

    ctrl.stopProcess(confirmProcess.type);

    setShowConfirm(false);
    setConfirmProcess(null);
  }, [confirmProcess, mainControl, row1Control, row2Control]);

  const getInfo = useCallback((key: 'main' | 'row1' | 'row2'): [string, string] => {
    const state =
      key === 'main' ? mainState : key === 'row1' ? row1State : row2State;

    if (state.remaining > 0) {
      return ['Progress', formatHelpers.formatDuration(state.remaining)];
    }

    if (state.last) {
      const d = new Date(state.last);
      return [formatHelpers.formatDate(d), formatHelpers.formatTime(d)];
    }

    return ['No recent', blockType];
  }, [mainState, row1State, row2State, blockType, formatHelpers]);

  const rows = useMemo(() => [
    {key: 'row1' as const, label: 'Baris 1'},
    {key: 'row2' as const, label: 'Baris 2'},
  ], []);

  return (
    <>
      <Animated.View style={[styles.container, {height: heightAnim}]}>
        <View style={styles.content}>
          <View style={styles.infoWater}>
            <LottieView
              source={animationSource}
              style={styles.lottie}
              loop
              autoPlay={mainState.isActive}
              renderMode="HARDWARE"
              cacheComposition={true}
            />
            <View style={styles.infoDetails}>
              <Text style={styles.waterText}>{title}</Text>
              <Text style={styles.blockText}>{blockCount} Block</Text>
            </View>
          </View>
          <PowerButton
            isActive={mainState.isActive}
            onPress={() => handleToggle('main')}
          />
        </View>

        {expanded && (
          <>
            <View style={styles.lineTop} />
            <View style={styles.containerBaris}>
              {rows.map(({key, label}) => {
                const st = key === 'row1' ? row1State : row2State;
                const info = getInfo(key);

                return (
                  <View
                    key={key}
                    style={st.isActive ? styles.boxBarisOn : styles.boxBaris}>
                    <View style={styles.infoSpraying}>
                      <Text style={styles.barisTitle}>{label}</Text>
                      <Text style={styles.infoText}>{info[0]}</Text>
                      <Text style={styles.infoTextBold}>{info[1]}</Text>
                    </View>
                    <PowerButton
                      isActive={st.isActive}
                      onPress={() => handleToggle(key)}
                    />
                  </View>
                );
              })}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.toggleButton} onPress={toggleExpand}>
          <Text style={styles.toggleText}>
            {expanded ? 'Show Less' : 'Show Block'}
          </Text>
          <Animated.View style={{transform: [{rotate: rotateInterpolate}]}}>
            <ArrowLeft2 color="black" variant="Linear" size={16} />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

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
              <TouchableOpacity onPress={handleStart}>
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
        type={confirmProcess?.type || 'water'}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleStop}
      />
    </>
  );
});

const getSensorStatus = (value: number, sensorType: string) => {
  const thresholds = {
    Kalium: {good: [10, 15], unit: 'mg/L'},
    EC: {good: [30, 50], unit: ''},
    PH: {good: [6, 7.5], unit: ''},
    Nitrogen: {good: [10, 20], unit: 'mg/L'},
    Phosphor: {good: [5, 15], unit: 'mg/L'},
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
              unit=" mg/L"
            />
            <SensorItem
              label="Phosphor"
              value={getSensorValue(sensor1Data, 'Phosphor')}
              sensorType="Phosphor"
              unit=" mg/L"
            />
          </View>
          <View style={styles.gridRow}>
            <SensorItem
              label="Kalium"
              value={getSensorValue(sensor1Data, 'Kalium')}
              sensorType="Kalium"
              unit=" mg/L"
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
          <View style={styles.gridRow}>
            <SensorItem
              label="Conductivity"
              value={getSensorValue(sensor2Data, 'EC')}
              sensorType="EC"
            />
            <SensorItem
              label="PH"
              value={getSensorValue(sensor2Data, 'PH')}
              sensorType="PH"
            />
          </View>
          <View style={styles.gridRow}>
            <SensorItem
              label="Nitrogen"
              value={getSensorValue(sensor2Data, 'Nitrogen')}
              sensorType="Nitrogen"
              unit=" mg/L"
            />
            <SensorItem
              label="Phosphor"
              value={getSensorValue(sensor2Data, 'Phosphor')}
              sensorType="Phosphor"
              unit=" mg/L"
            />
          </View>
          <View style={styles.gridRow}>
            <SensorItem
              label="Kalium"
              value={getSensorValue(sensor2Data, 'Kalium')}
              sensorType="Kalium"
              unit=" mg/L"
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
              unit=" mg/L"
            />
            <SensorItem
              label="Phosphor"
              value={getSensorValue(sensor3Data, 'Phosphor')}
              sensorType="Phosphor"
              unit=" mg/L"
            />
          </View>
          <View style={styles.gridRow}>
            <SensorItem
              label="Kalium"
              value={getSensorValue(sensor3Data, 'Kalium')}
              sensorType="Kalium"
              unit=" mg/L"
            />
            <View style={styles.gridItemEmpty} />
          </View>
        </View>
      </View>
    </View>
  );
});

const DetailBlockOne: React.FC<Props> = ({navigation}) => {
  const {
    block1Control,
    block1RowWater1Control,
    block1RowWater2Control,
    block1RowFertilizer1Control,
    block1RowFertilizer2Control,
  } = useControl();

  const {setActivePage} = usePageControl();

  const fetchSensorData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(
        'http://10.0.2.2:4646/api/latest-sensor-block1',
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
      console.log('[DetailBlockOne] Setting active page to block1');
      setActivePage('block1');
      fetchSensorData();
    }, [setActivePage, fetchSensorData]),
  );

  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const memoizedExpandableBlocks = useMemo(() => (
    <>
      <ExpandableBlock
        title="Water"
        animationSource={require('../../../assets/videos/air.mp4.lottie.json')}
        blockCount={5}
        blockType="water"
        mainControl={block1Control}
        row1Control={block1RowWater1Control}
        row2Control={block1RowWater2Control}
      />

      <ExpandableBlock
        title="Fertilizer"
        animationSource={require('../../../assets/videos/pupuk.mp4.lottie.json')}
        blockCount={5}
        blockType="fertilizer"
        mainControl={block1Control}
        row1Control={block1RowFertilizer1Control}
        row2Control={block1RowFertilizer2Control}
      />
    </>
  ), [
    block1Control,
    block1RowWater1Control,
    block1RowWater2Control,
    block1RowFertilizer1Control,
    block1RowFertilizer2Control,
  ]);

  const memoizedDevices = useMemo(() => (
    <>
      <Device1 sensorData={sensorData} />
      <Device2 sensorData={sensorData} />
      <Device3 sensorData={sensorData} />
    </>
  ), [sensorData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading sensor data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.main}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.replace('HomeFix')}>
              <ArrowLeft2 color="black" variant="Linear" size={24} />
            </TouchableOpacity>
            <Text style={styles.title}>Block 1</Text>
            <View style={{width: 24}} />
          </View>

          {memoizedExpandableBlocks}
          {memoizedDevices}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  main: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Regular',
  },

  container: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 15,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
  },
  infoWater: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lottie: {
    width: 40,
    height: 40,
    opacity: 0.5,
  },
  infoDetails: {
    marginLeft: 8,
  },
  waterText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  blockText: {
    fontSize: 12,
    color: '#C5C5C5',
    marginTop: -2,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  powerButton: {
    padding: 5,
  },

  toggleButton: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 12,
    fontWeight: '400',
    marginRight: 6,
  },
  lineTop: {
    height: 1,
    backgroundColor: '#DEE2E7',
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
    marginTop: 1,
  },
  containerBaris: {
    width: '90%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boxBaris: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDEFF2',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boxBarisOn: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: '#B4DC45',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoSpraying: {
    flex: 1,
  },
  barisTitle: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 14,
    fontWeight: '600',
    color: '#353D48',
  },
  infoText: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 12,
    fontWeight: '400',
    color: '#BBC3CE',
  },
  infoTextBold: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 12,
    fontWeight: '600',
    color: '#353D48',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
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
  durationButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  durationText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#B4DC45',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmText: {
    color: '#353D48',
    fontWeight: '600',
    alignSelf: 'center',
    fontFamily: 'SpaceGrotesk-Regular',
    padding: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
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
});

export default DetailBlockOne;
