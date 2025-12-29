import {useState, useCallback, useMemo} from 'react';
import {Alert, BackHandler} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useControl, usePageControl} from '@Context/ControlContext';

interface BlockConfig {
  blockNumber: number;
  blockTitle: string;
  apiEndpoint: string;
  devices: number[];
}

interface BlockControls {
  main: any;
  devices: number[];
  expandableBlocks: any[];
}


const BLOCK_CONFIGS: Record<3 | 4, BlockConfig> = {
  4: {
    blockNumber: 1,
    blockTitle: 'Block 4',
    apiEndpoint: 'https://iot-vanili-api.permataindonesia.com/api/latest-sensor-block1',
    devices: [1, 2, 3],
  },
  3: {
    blockNumber: 2,
    blockTitle: 'Block 3',
    apiEndpoint: 'https://iot-vanili-api.permataindonesia.com/api/latest-sensor-block2',
    devices: [1, 2, 3],
  },
};

export const useDetailBlock = (blockIdParam?: number) => {
  const blockId = blockIdParam === 3 ? 3 : 4;
  const config = BLOCK_CONFIGS[blockId];
  const {setActivePage} = usePageControl();
  const controls = useControl();

  const [sensorData, setSensorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [currentProcess, setCurrentProcess] = useState<{
    type: 'water' | 'fertilizer';
    target?: 'main' | 'row1' | 'row2';
  } | null>(null);
  
  const [confirmType, setConfirmType] = useState<'water' | 'fertilizer' | null>(null);
  const [inputMinutes, setInputMinutes] = useState('1');
  const [inputSeconds, setInputSeconds] = useState('0');

  const blockControls = useMemo<BlockControls>(() => {
  if (blockId === 4) {
    return {
      main: controls.block1Control,
      devices: config.devices,
      expandableBlocks: [
        {
          title: 'Water',
          animationSource: require('@Assets/videos/air.mp4.lottie.json'),
          blockCount: 2,
          blockType: 'water' as const,
          mainControl: controls.block1Control,
          row1Control: controls.block1RowWater1Control,
          row2Control: controls.block1RowWater2Control,
          isDisabled: controls.block1Control.isFertilizerOn,
        },
        {
          title: 'Fertilizer',
          animationSource: require('@Assets/videos/pupuk.mp4.lottie.json'),
          blockCount: 2,
          blockType: 'fertilizer' as const,
          mainControl: controls.block1Control,
          row1Control: controls.block1RowFertilizer1Control,
          row2Control: controls.block1RowFertilizer2Control,
          isDisabled: controls.block1Control.isWaterOn,
        },
      ],
    };
  }

  return {
    main: controls.block2Control,
    devices: config.devices,
    expandableBlocks: [],
  };
}, [blockId, config, controls]);


  const fetchSensorData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(config.apiEndpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

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
  }, [config.apiEndpoint]);

  useFocusEffect(
    useCallback(() => {
      setActivePage(blockId);
      fetchSensorData();
    }, [blockId, fetchSensorData, setActivePage])
  );

  const handleToggle = useCallback(
    (type: 'water' | 'fertilizer', target?: 'main' | 'row1' | 'row2') => {
      const control = blockControls.main;
      const isCurrentlyActive = type === 'water' ? control.isWaterOn : control.isFertilizerOn;

      if (isCurrentlyActive) {
        setConfirmType(type);
        setShowConfirm(true);
      } else {
        setCurrentProcess({type, target});
        setShowDurationModal(true);
      }
    },
    [blockControls]
  );

  const handleMinutesChange = useCallback((text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setInputMinutes(numericValue);
  }, []);

  const handleSecondsChange = useCallback((text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setInputSeconds(numericValue);
  }, []);

  const handleStartProcess = useCallback(
    (totalSeconds: number) => {
      if (!currentProcess) return;

      const control = blockControls.main;
      control.startProcess(currentProcess.type, totalSeconds);

      setShowDurationModal(false);
      setInputMinutes('1');
      setInputSeconds('0');
      setCurrentProcess(null);
    },
    [currentProcess, blockControls]
  );

  const handleConfirmStop = useCallback(() => {
    if (confirmType) {
      const control = blockControls.main;
      control.stopProcess(confirmType);
    }
    setShowConfirm(false);
  }, [confirmType, blockControls]);

  return {
    blockNumber: config.blockNumber,
    blockTitle: config.blockTitle,
    blockControls,
    apiEndpoint: config.apiEndpoint,

    sensorData,
    loading,

    showDurationModal,
    showConfirm,
    currentProcess,
    confirmType,
    inputMinutes,
    inputSeconds,

    handleToggle,
    handleStartProcess,
    handleConfirmStop,
    setShowDurationModal,
    setShowConfirm,
    handleMinutesChange,
    handleSecondsChange,
  };
};