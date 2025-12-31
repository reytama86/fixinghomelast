import {useState, useEffect, useCallback} from 'react';
import {BackHandler, Platform} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {BlockCardData} from '@Organism/BlockCard';

export interface BlockData {
  id: number;
  name: string;
  temperature: string;
  humidity: string;
  navigationEnabled?: boolean;
  svgPath?: 'block1' | 'block2' | 'block3' | 'block7' | 'block8';
}

interface SensorDataBlocks {
  block3: {temp: string; humidity: string};
  block4: {temp: string; humidity: string};
  block6: {temp: string; humidity: string};
  block7: {temp: string; humidity: string};
  block8: {temp: string; humidity: string};
}

export const useBlockList = () => {
  const [sensorDataBlocks, setSensorDataBlocks] = useState<SensorDataBlocks>({
    block3: {temp: '--', humidity: '--'},
    block4: {temp: '--', humidity: '--'},
    block6: {temp: '--', humidity: '--'},
    block7: {temp: '--', humidity: '--'},
    block8: {temp: '--', humidity: '--'},
  });

  const fetchAllBlocksData = useCallback(async () => {
    try {
      const response = await fetch(
        'https://iot-vanili-api.permataindonesia.com/api/temp-humidity',
      );
      const result = await response.json();

      if (result.success) {
        const data = result.data;

        // Mapping sensor ID ke block
        const blockSensorMap: Record<number, keyof SensorDataBlocks> = {
          5: 'block3',
          2: 'block4',
          6: 'block6',
          3: 'block7',
          7: 'block8',
        };

        const newBlockData = {...sensorDataBlocks};

        // Process data untuk setiap block
        Object.entries(blockSensorMap).forEach(([sensorId, blockKey]) => {
          const tempSensor = data.find(
            (item: any) =>
              item.id_sensor === parseInt(sensorId) &&
              item.keterangan_sensor === 'Temperature',
          );
          const humiditySensor = data.find(
            (item: any) =>
              item.id_sensor === parseInt(sensorId) &&
              item.keterangan_sensor === 'Humidity',
          );

          newBlockData[blockKey] = {
            temp: tempSensor ? tempSensor.nilai_sensor : '--',
            humidity: humiditySensor ? humiditySensor.nilai_sensor : '--',
          };
        });

        setSensorDataBlocks(newBlockData);
      }
    } catch (error) {
      console.log('Error fetching blocks data:', error);
    }
  }, []);

  useEffect(() => {
    fetchAllBlocksData();
    const interval = setInterval(fetchAllBlocksData, 30000);
    return () => clearInterval(interval);
  }, [fetchAllBlocksData]);

  const blocks: BlockCardData[] = [
    {
      id: 3,
      name: 'Block 3',
      temperature: isNaN(Number(sensorDataBlocks.block3.temp))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block3.temp)).toString(),
      humidity: isNaN(Number(sensorDataBlocks.block3.humidity))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block3.humidity)).toString(),
      navigationEnabled: true,
      svgPath: 'block2',
    },
    {
      id: 4,
      name: 'Block 4',
      temperature: isNaN(Number(sensorDataBlocks.block4.temp))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block4.temp)).toString(),
      humidity: isNaN(Number(sensorDataBlocks.block4.humidity))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block4.humidity)).toString(),
      navigationEnabled: true,
      svgPath: 'block1',
    },
    {
      id: 6,
      name: 'Block 6',
      temperature: isNaN(Number(sensorDataBlocks.block6.temp))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block6.temp)).toString(),
      humidity: isNaN(Number(sensorDataBlocks.block6.humidity))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block6.humidity)).toString(),
      svgPath: 'block7',
    },
    {
      id: 7,
      name: 'Block 7',
      temperature: isNaN(Number(sensorDataBlocks.block7.temp))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block7.temp)).toString(),
      humidity: isNaN(Number(sensorDataBlocks.block7.humidity))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block7.humidity)).toString(),
      // navigationTarget: 'DetailBlockTwo',
      svgPath: 'block3',
    },
    {
      id: 8,
      name: 'Block 8',
      temperature: isNaN(Number(sensorDataBlocks.block8.temp))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block8.temp)).toString(),
      humidity: isNaN(Number(sensorDataBlocks.block8.humidity))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block8.humidity)).toString(),
      svgPath: 'block8',
    },
  ];

  return {blocks};
};