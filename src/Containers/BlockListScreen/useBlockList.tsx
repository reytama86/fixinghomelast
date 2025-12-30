import {useState, useEffect, useCallback} from 'react';

type SensorBlockValue = {
  temp: string;
  humidity: string;
};

type SensorDataBlocks = Record<string, SensorBlockValue>;

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

        const blockSensorMap: Record<number, string> = {
          5: 'block3',
          2: 'block4',
          6: 'block6',
          3: 'block7',
          7: 'block8',
        };

        const newBlockData: SensorDataBlocks = {
          block3: {temp: '--', humidity: '--'},
          block4: {temp: '--', humidity: '--'},
          block6: {temp: '--', humidity: '--'},
          block7: {temp: '--', humidity: '--'},
          block8: {temp: '--', humidity: '--'},
        };

        Object.entries(blockSensorMap).forEach(([sensorIdStr, blockKey]) => {
          const sensorId = parseInt(sensorIdStr, 10);

          const tempSensor = data.find(
            (item: any) =>
              item.id_sensor === sensorId &&
              item.keterangan_sensor === 'Temperature',
          );
          const humiditySensor = data.find(
            (item: any) =>
              item.id_sensor === sensorId &&
              item.keterangan_sensor === 'Humidity',
          );

          newBlockData[blockKey] = {
            temp: tempSensor ? String(tempSensor.nilai_sensor) : '--',
            humidity: humiditySensor
              ? String(humiditySensor.nilai_sensor)
              : '--',
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

  const formatValue = (v: string) => {
    const n = Number(v);
    if (!isFinite(n)) return '--';
    return Math.round(n).toString();
  };

  const blocks = [
    {
      id: 3,
      name: 'Block 3',
      temperature: formatValue(sensorDataBlocks.block3.temp),
      humidity: formatValue(sensorDataBlocks.block3.humidity),
      navigationEnabled: true,
      svgPath: 'block2',
    },
    {
      id: 4,
      name: 'Block 4',
      temperature: formatValue(sensorDataBlocks.block4.temp),
      humidity: formatValue(sensorDataBlocks.block4.humidity),
      navigationEnabled: true,
      svgPath: 'block1',
    },
    {
      id: 6,
      name: 'Block 6',
      temperature: formatValue(sensorDataBlocks.block6.temp),
      humidity: formatValue(sensorDataBlocks.block6.humidity),
      navigationEnabled: false,
      svgPath: 'block7',
    },
    {
      id: 7,
      name: 'Block 7',
      temperature: formatValue(sensorDataBlocks.block7.temp),
      humidity: formatValue(sensorDataBlocks.block7.humidity),
      navigationEnabled: true,
      svgPath: 'block3',
    },
    {
      id: 8,
      name: 'Block 8',
      temperature: formatValue(sensorDataBlocks.block8.temp),
      humidity: formatValue(sensorDataBlocks.block8.humidity),
      navigationEnabled: false,
      svgPath: 'block8',
    },
  ];

  return {
    blocks,
    fetchAllBlocksData,
  };
};