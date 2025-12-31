import {useState, useEffect, useCallback, useMemo} from 'react';
import {BackHandler} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import RouteName from '@Constants/RouteName.constants';

export interface PortableToolData {
  id: number;
  keterangan_portable: string;
  created_at: string;
  sensors?: SensorData[];
}

export interface SensorData {
  id_sensor: number;
  keterangan_sensor: string;
  nilai_sensor: number | string;
}

export const usePortableList = (navigation: any) => {
  const [portableData, setPortableData] = useState<PortableToolData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPortableData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://iot-vanili-api.permataindonesia.com/api/portable-tools?limit=100&sort=created_at&order=desc',
      );

      if (!response.ok) {
        throw new Error('Failed to fetch portable data');
      }

      const data = await response.json();
      setPortableData(data);
    } catch (error) {
      console.error('Error fetching portable data:', error);
      setPortableData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortableData();
  }, [fetchPortableData]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  const reversedData = useMemo(
    () => [...portableData].reverse(),
    [portableData],
  );

  const handleItemPress = useCallback(
    (item: PortableToolData) => {
      console.log('Item pressed:', item);
      navigation.navigate(RouteName.PortableSensorScreenNavigation, {
        portableData: item,
        isHistoryMode: true,
      });
    },
    [navigation],
  );

  return {
    portableData,
    reversedData,
    loading,
    fetchPortableData,
    handleItemPress,
  };
};