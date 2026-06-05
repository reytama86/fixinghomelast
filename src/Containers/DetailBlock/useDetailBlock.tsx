import {useState, useCallback, useMemo} from 'react';
import {Alert} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useControl, usePageControl} from '@Context/ControlContext';

interface BlockConfig {
  blockNumber: number;
  blockTitle: string;
  apiEndpoint: string;
  devices: number[];
  hasControl: boolean;
}

const BLOCK_CONFIGS: Record<1 | 3 | 4, BlockConfig> = {
  1: {
    blockNumber: 0,
    blockTitle: 'Block 1',
    apiEndpoint: 'https://iot-vanili-api.permataindonesia.com/api/latest-sensor-block01',
    devices: [1, 2, 3],
    hasControl: true,
  },
  4: {
    blockNumber: 1,
    blockTitle: 'Block 4',
    apiEndpoint: 'https://iot-vanili-api.permataindonesia.com/api/latest-sensor-block1',
    devices: [1, 2, 3],
    hasControl: true,
  },
  3: {
    blockNumber: 2,
    blockTitle: 'Block 3',
    apiEndpoint: 'https://iot-vanili-api.permataindonesia.com/api/latest-sensor-block2',
    devices: [1, 2, 3],
    hasControl: true,
  },
};

export const useDetailBlock = (blockIdParam?: number) => {
  const blockId = blockIdParam === 3 ? 3 : blockIdParam === 1 ? 1 : 4;
  const config = BLOCK_CONFIGS[blockId];
  const {setActivePage} = usePageControl();
  const controls = useControl();

  const [sensorData, setSensorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentProcess, setCurrentProcess] = useState<{
    type: 'water' | 'fertilizer';
    target: 'main' | 'row1' | 'row2';
  } | null>(null);

  const [confirmProcess, setConfirmProcess] = useState<{
    type: 'water' | 'fertilizer';
    target: 'main' | 'row1' | 'row2';
  } | null>(null);

  const [inputMinutes, setInputMinutes] = useState('1');
  const [inputSeconds, setInputSeconds] = useState('0');

  const blockControls = useMemo(() => {
  if (blockId === 4) {
    return {
      type: 'block4' as const,
      main: controls.block1Control,
      row1Water: controls.block1RowWater1Control,
      row2Water: controls.block1RowWater2Control,
      row1Fertilizer: controls.block1RowFertilizer1Control,
      row2Fertilizer: controls.block1RowFertilizer2Control,
      devices: config.devices,
    };
  }
  if (blockId === 1) {
    return {
      type: 'block01' as const,
      block01: controls.block01Control,
      devices: config.devices,
    };
  }
  if (blockId === 3) {
  return {
    type: 'block3' as const,
    main: controls.block2Control,
    // Pakai controls fertilizer block 4 untuk ditampilkan sebagai "Water" block 3
    row1Water: controls.block1RowFertilizer1Control,
    row2Water: controls.block1RowFertilizer2Control,
    devices: config.devices,
  };
}
  return {
    type: 'block9' as const,
    main: controls.block2Control,
    devices: config.devices,
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
      // console.log('Fetched sensor data:', result);

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

  const refreshData = useCallback(async () => {
    try {
      const response = await fetch(config.apiEndpoint);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSensorData(result.data);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [config.apiEndpoint]);

  useFocusEffect(
    useCallback(() => {
      const page = blockId === 4 ? 'block1' : blockId === 1 ? 'block01' : 'block2';
      setActivePage(page);
      fetchSensorData();
    }, [blockId, fetchSensorData, setActivePage]),
  );

  const getControl = useCallback(
    (type: 'water' | 'fertilizer', target: 'main' | 'row1' | 'row2') => {
      if (target === 'main') {
        return blockControls.main;
      }

      if (blockId === 4) {
        if (type === 'water') {
          return target === 'row1'
            ? blockControls.row1Water
            : blockControls.row2Water;
        } else {
          return target === 'row1'
            ? blockControls.row1Fertilizer
            : blockControls.row2Fertilizer;
        }
      }
      if (blockId === 3) {
      return target === 'row1'
        ? blockControls.row1Water
        : blockControls.row2Water;
    }

      return blockControls.main;
    },
    [blockId, blockControls],
  );

  const handleToggle = useCallback(
    (type: 'water' | 'fertilizer', target: 'main' | 'row1' | 'row2') => {
      const control = getControl(type, target);
      const isCurrentlyActive =
        type === 'water' ? control.isWaterOn : control.isFertilizerOn;

      if (isCurrentlyActive) {
        setConfirmProcess({type, target});
        setShowConfirm(true);
      } else {
        setCurrentProcess({type, target});
        setShowDurationModal(true);
      }
    },
    [getControl],
  );

  const handleMinutesChange = useCallback((text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setInputMinutes(numericValue);
  }, []);

  const handleSecondsChange = useCallback((text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setInputSeconds(numericValue);
  }, []);

  const validateTimeInput = (value: string, max: number): string => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) return '0';
    if (numValue > max) return max.toString();
    return numValue.toString();
  };

  const handleStartProcess = useCallback(
    (totalSeconds: number) => {
      if (!currentProcess) return;

      const control = getControl(currentProcess.type, currentProcess.target);
      control.startProcess(currentProcess.type, totalSeconds);

      setShowDurationModal(false);
      setInputMinutes('1');
      setInputSeconds('0');
      setCurrentProcess(null);
    },
    [currentProcess, getControl],
  );

  const handleConfirmStop = useCallback(() => {
    if (!confirmProcess) return;

    const control = getControl(confirmProcess.type, confirmProcess.target);
    control.stopProcess(confirmProcess.type);

    setShowConfirm(false);
    setConfirmProcess(null);
  }, [confirmProcess, getControl]);

  return {
    blockNumber: config.blockNumber,
    blockTitle: config.blockTitle,
    apiEndpoint: config.apiEndpoint,

    sensorData,
    loading,

    refreshData,

    showDurationModal,
    showConfirm,
    currentProcess,
    confirmProcess,
    inputMinutes,
    inputSeconds,

    blockControls,
    hasControl: config.hasControl,

    handleToggle,
    handleStartProcess,
    handleConfirmStop,
    setShowDurationModal,
    setShowConfirm,
    handleMinutesChange,
    handleSecondsChange,
  };
};
