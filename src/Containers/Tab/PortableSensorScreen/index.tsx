import React, {useState, useEffect, useCallback} from 'react';
import {SafeAreaView, Text, Alert, BackHandler, PermissionsAndroid, Platform} from 'react-native';
import {Animated} from 'react-native';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {MainTabParamList, SoilSensorData} from 'src/Navigators/Tab';
import {getSoilStatus, SoilIndicator} from '@Helpers/getSensorStatus';
import { usePortableSensor } from './usePortableSensor';
import { Header } from './Section/Header';
import { SensorContent } from './Section/SensorContent';
import { BottomActionsSection } from './Section/BottomAction';
import { SaveModal } from './Section/SaveModal';
import { RescanModal } from './Section/RescanModal';
import styles from './styles';
import HeaderBack from '@Molecule/HeaderBack';

type PortableData = {
  keterangan_portable: string;
  created_at: string;
  sensors?: Array<{
    keterangan_sensor: string;
    nilai_sensor: number;
  }>;
};



function mapSensorNameForHelper(localName: string) {
  switch (localName) {
    case 'Temp':
      return 'Soil Temperature';
    case 'Humidity':
      return 'Soil Humidity';
    case 'pH':
      return 'PH';
    case 'EC':
      return 'EC';
    case 'Nitrogen':
      return 'Nitrogen';
    case 'Phosphorus':
      return 'Phosphor';
    case 'Kalium':
      return 'Kalium';
    default:
      return localName;
  }
}

const makeIndicatorFromValue = (localKey: string, value: number): SoilIndicator => {
  const helperName = mapSensorNameForHelper(localKey);
  return getSoilStatus(helperName, value);
};

type Props = BottomTabScreenProps<MainTabParamList, 'ReadSoil'>;

const PortableSensorScreen: React.FC<Props> = ({route, navigation}) => {
  console.log('PortableSensorScreen - Route params:', route.params);
  
  const {
    bleStatus: initialBleStatus,
    sensorData: initialSensorData,
    portableData,
    isHistoryMode = false,
  } = route.params || {};

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRescanPopupVisible, setIsRescanPopupVisible] = useState(false);
  const modalAnimation = useState(new Animated.Value(0))[0];
  const [dotCount, setDotCount] = useState(0);

  const {
    currentSensorData,
    bleStatus,
    setCurrentSensorData,
    setBleStatus,
    startBLEScan,
    resetBLEState,
    publishSavedResult,
  } = usePortableSensor(initialSensorData, initialBleStatus);

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

  const handleRescan = () => {
    setIsRescanPopupVisible(true);
    setDotCount(0);
  };

  useEffect(() => {
    let dotInterval: ReturnType<typeof setInterval>;
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

    startBLEScan().catch(error => {
      console.error('BLE scan failed:', error);
      setBleStatus('disconnected');
    });
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

  const handleSaveResult = async (resultName: string) => {
    if (!currentSensorData) {
      Alert.alert('Error', 'No sensor data available to save');
      throw new Error('No sensor data');
    }

    if (!resultName.trim()) {
      Alert.alert('Error', 'Please enter a result name');
      throw new Error('No result name');
    }

    try {
      publishSavedResult(currentSensorData, resultName);
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
      throw error;
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

  const defaultIndicator: SoilIndicator = {
  color: '#9CAAF3',
  icon: 'remove',
  status: 'N/A',
};

const indicators = {
  temp: currentSensorData
    ? makeIndicatorFromValue('Temp', currentSensorData.Temp)
    : defaultIndicator,
  humidity: currentSensorData
    ? makeIndicatorFromValue('Humidity', currentSensorData.Humidity)
    : defaultIndicator,
  ph: currentSensorData
    ? makeIndicatorFromValue('pH', currentSensorData.pH)
    : defaultIndicator,
  ec: currentSensorData
    ? makeIndicatorFromValue('EC', currentSensorData.EC)
    : defaultIndicator,
  nitrogen: currentSensorData
    ? makeIndicatorFromValue('Nitrogen', currentSensorData.Nitrogen)
    : defaultIndicator,
  phosphorus: currentSensorData
    ? makeIndicatorFromValue('Phosphorus', currentSensorData.Phosphorus)
    : defaultIndicator,
  kalium: currentSensorData
    ? makeIndicatorFromValue('Kalium', currentSensorData.Kalium)
    : defaultIndicator,
};
  return (
  <SafeAreaView style={styles.container}>
    <HeaderBack
      title={isHistoryMode && portableData 
        ? portableData.keterangan_portable 
        : "Portable Tools Result"
      }
      back
      
    />
    
    {isHistoryMode && portableData && (
      <Text style={styles.textInfoTested}>
        Tested on {formatDate(portableData.created_at)}
      </Text>
    )}
    
    <SensorContent 
      sensorData={currentSensorData} 
      indicators={indicators}
      isHistoryMode={isHistoryMode}
    />
    
    {!isHistoryMode && (
      <BottomActionsSection onRescan={handleRescan} onSave={openModal} />
    )}

    <SaveModal
      visible={isModalVisible}
      onClose={closeModal}
      onSave={handleSaveResult}
      modalAnimation={modalAnimation}
    />

    <RescanModal
      visible={isRescanPopupVisible}
      dotCount={dotCount}
      onRequestClose={() => setIsRescanPopupVisible(false)}
    />
  </SafeAreaView>
);
};

export default PortableSensorScreen;