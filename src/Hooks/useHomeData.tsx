import {useState, useCallback, useEffect} from 'react';
import { PortableToolData } from 'HomeStack';

type SensorMedianData = {
  median: number;
  count: number;
};

type MedianSensorResponse = {
  success: boolean;
  data: {
    [key: string]: SensorMedianData;
  };
  timestamp: string;
};

type SensorDataBlock = {
  block1: {temp: string; humidity: string};
  block2: {temp: string; humidity: string};
};

export const useHomeData = () => {
  const [sensorData, setSensorData] = useState<MedianSensorResponse['data'] | null>(null);
  const [sensorDataBlock, setSensorDataBlock] = useState<SensorDataBlock>({
    block1: {temp: '--', humidity: '--'},
    block2: {temp: '--', humidity: '--'},
  });
  const [portableData, setPortableData] = useState<PortableToolData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSensorData = useCallback(async () => {
    try {
      const response = await fetch(
        'https://iot-vanili-api.permataindonesia.com/api/median-sensor-data',
      );
      if (!response.ok) throw new Error('Failed to fetch sensor data');

      const data: MedianSensorResponse = await response.json();
      if (data.success) {
        setSensorData(data.data);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  }, []);

  const fetchDataBlock = useCallback(async () => {
    try {
      const response = await fetch(
        'https://iot-vanili-api.permataindonesia.com/api/temp-humidity',
      );
      const result = await response.json();

      if (result.success) {
        const data = result.data;

        const block1Temp = data.find(
          item => item.id_sensor === 2 && item.keterangan_sensor === 'Temperature',
        );
        const block1Humidity = data.find(
          item => item.id_sensor === 2 && item.keterangan_sensor === 'Humidity',
        );

        const block2Temp = data.find(
          item => item.id_sensor === 5 && item.keterangan_sensor === 'Temperature',
        );
        const block2Humidity = data.find(
          item => item.id_sensor === 5 && item.keterangan_sensor === 'Humidity',
        );

        setSensorDataBlock({
          block1: {
            temp: block1Temp ? block1Temp.nilai_sensor : '--',
            humidity: block1Humidity ? block1Humidity.nilai_sensor : '--',
          },
          block2: {
            temp: block2Temp ? block2Temp.nilai_sensor : '--',
            humidity: block2Humidity ? block2Humidity.nilai_sensor : '--',
          },
        });
      }
    } catch (error) {
      console.log('Error fetching data:', error);
    }
  }, []);

  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  const fetchPortableData = useCallback(
    debounce(async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://iot-vanili-api.permataindonesia.com/api/portable-tools?limit=5&sort=created_at&order=desc',
        );
        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        setPortableData(data);
      } catch (error) {
        console.error('Error fetching portable data:', error);
      } finally {
        setLoading(false);
      }
    }, 3000),
    [debounce],
  );

  useEffect(() => {
    fetchPortableData();
  }, [fetchPortableData]);

  return {
    sensorData,
    sensorDataBlock,
    portableData,
    loading,
    fetchSensorData,
    fetchDataBlock,
    fetchPortableData,
  };
};