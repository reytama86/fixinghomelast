import {useState, useCallback, useMemo} from 'react';
import {Alert} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useControl, usePageControl} from '@Context/ControlContext';

interface BlockConfig {
  blockNumber: number;
  blockTitle: string;
  apiEndpoint: string | null;
  devices: number[];
  hasControl: boolean;
  hasSensor: boolean;
  hasSchedule: boolean;
}

const BLOCK_CONFIGS: Record<1 | 2 | 3 | 4, BlockConfig> = {
  1: {
    blockNumber: 0,
    blockTitle: 'Block 1',
    apiEndpoint: 'https://iot-vanili-api.permataindonesia.com/api/latest-sensor-block01',
    devices: [1, 2, 3],
    hasControl: true,
    hasSensor: true,
    hasSchedule: false,
  },
  4: {
    blockNumber: 1,
    blockTitle: 'Block 4',
    apiEndpoint: 'https://iot-vanili-api.permataindonesia.com/api/latest-sensor-block1',
    devices: [1, 2, 3],
    hasControl: true,
    hasSensor: true,
    hasSchedule: true,
  },
  3: {
    blockNumber: 2,
    blockTitle: 'Block 3',
    apiEndpoint: 'https://iot-vanili-api.permataindonesia.com/api/latest-sensor-block2',
    devices: [1, 2, 3],
    hasControl: true,
    hasSensor: true,
    hasSchedule: true,
  },
  2: {
    blockNumber: 3,
    blockTitle: 'Block 2',
    apiEndpoint: null,
    devices: [],
    hasControl: true,
    hasSensor: false,
    hasSchedule: true,
  },
};

type SimpleBlockControls = {
  type: 'simple';
  main: ReturnType<typeof useControl>['block4Control'];
  schedule: ReturnType<typeof useControl>['block4Schedule'] | null;
  devices: number[];
};

type Block01Controls = {
  type: 'block01';
  block01: ReturnType<typeof useControl>['block01Control'];
  devices: number[];
};

type BlockControls = SimpleBlockControls | Block01Controls;

export const useDetailBlock = (blockIdParam?: number) => {
  const blockId: 1 | 2 | 3 | 4 =
    blockIdParam === 1 || blockIdParam === 2 || blockIdParam === 3
      ? blockIdParam
      : 4;

  const config = BLOCK_CONFIGS[blockId];
  const {setActivePage} = usePageControl();
  const controls = useControl();

  const [sensorData, setSensorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [inputMinutes, setInputMinutes] = useState('1');
  const [inputSeconds, setInputSeconds] = useState('0');

  const blockControls: BlockControls = useMemo(() => {
    if (blockId === 1) {
      return {
        type: 'block01',
        block01: controls.block01Control,
        devices: config.devices,
      };
    }

    const main =
      blockId === 4
        ? controls.block4Control
        : blockId === 3
        ? controls.block3Control
        : controls.block2Control;

    const schedule =
      blockId === 4
        ? controls.block4Schedule
        : blockId === 3
        ? controls.block3Schedule
        : blockId === 2
        ? controls.block2Schedule
        : null;

    return {
      type: 'simple',
      main,
      schedule,
      devices: config.devices,
    };
  }, [blockId, config, controls]);

  const fetchSensorData = useCallback(async () => {
    if (!config.apiEndpoint) {
      setLoading(false);
      return;
    }

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

  const refreshData = useCallback(async () => {
    if (!config.apiEndpoint) return;

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
      const page =
        blockId === 4
          ? 'block4'
          : blockId === 3
          ? 'block3'
          : blockId === 2
          ? 'block2'
          : 'block01';
      setActivePage(page);
      fetchSensorData();
    }, [blockId, fetchSensorData, setActivePage]),
  );

  const handleToggle = useCallback(() => {
    if (blockControls.type !== 'simple') return;

    if (blockControls.main.isWaterOn) {
      setShowConfirm(true);
    } else {
      setShowDurationModal(true);
    }
  }, [blockControls]);

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
      if (blockControls.type !== 'simple') return;

      blockControls.main.startProcess('water', totalSeconds);

      setShowDurationModal(false);
      setInputMinutes('1');
      setInputSeconds('0');
    },
    [blockControls],
  );

  const handleConfirmStop = useCallback(() => {
    if (blockControls.type !== 'simple') return;

    blockControls.main.stopProcess('water');
    setShowConfirm(false);
  }, [blockControls]);

  const handleOpenSchedule = useCallback(() => {
    if (blockControls.type !== 'simple' || !blockControls.schedule) return;
    setShowScheduleModal(true);
  }, [blockControls]);

  const handleSaveSchedule = useCallback(
    (config: {dayOfMonth: number; hour: number; minute: number; durationSec: number}) => {
      if (blockControls.type !== 'simple' || !blockControls.schedule) return;
      blockControls.schedule.setScheduleConfig(config);
      setShowScheduleModal(false);
    },
    [blockControls],
  );

  const handleDeleteSchedule = useCallback(() => {
    if (blockControls.type !== 'simple' || !blockControls.schedule) return;
    blockControls.schedule.deleteSchedule();
    setShowScheduleModal(false);
  }, [blockControls]);

  return {
    blockNumber: config.blockNumber,
    blockTitle: config.blockTitle,
    apiEndpoint: config.apiEndpoint,

    sensorData,
    loading,

    refreshData,

    showDurationModal,
    showConfirm,
    inputMinutes,
    inputSeconds,

    blockControls,
    hasControl: config.hasControl,
    hasSensor: config.hasSensor,
    hasSchedule: config.hasSchedule,

    showScheduleModal,
    handleOpenSchedule,
    handleSaveSchedule,
    handleDeleteSchedule,
    setShowScheduleModal,

    handleToggle,
    handleStartProcess,
    handleConfirmStop,
    setShowDurationModal,
    setShowConfirm,
    handleMinutesChange,
    handleSecondsChange,
  };
};