import React, {useMemo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {ArrowDown} from 'iconsax-react-native';
import {Svg, Path} from 'react-native-svg';
import {CornerCutComponent} from '@Atom/CornerCutCard';
import {PortableToolData, SensorData} from '../../usePortableList'; 
import styles from './styles';

interface PortableItemProps {
  item: PortableToolData;
  onPress: () => void;
}

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

const formatSensorValue = (
  sensor: SensorData | undefined,
  decimals: number = 1,
  unit: string = '',
): string => {
  if (!sensor || sensor.nilai_sensor == null) return 'N/A';
  const value = Number(sensor.nilai_sensor);
  return isNaN(value) ? 'N/A' : `${value.toFixed(decimals)}${unit}`;
};

export const PortableItem: React.FC<PortableItemProps> = React.memo(
  ({item, onPress}) => {
    const sensorData = useMemo(() => {
      const sensors = item.sensors || [];
      return {
        temperature: sensors.find(
          s => s.keterangan_sensor?.toLowerCase() === 'temperature',
        ),
        humidity: sensors.find(
          s => s.keterangan_sensor?.toLowerCase() === 'humidity',
        ),
        ph: sensors.find(s => s.keterangan_sensor?.toLowerCase() === 'ph'),
        ec: sensors.find(s => s.keterangan_sensor?.toLowerCase() === 'ec'),
      };
    }, [item.sensors]);

    const formattedDate = useMemo(
      () => formatDate(item.created_at),
      [item.created_at],
    );

    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          <CornerCutComponent
            width={370}
            height={140}
            cutSize={40.5}
            backgroundColor="#ffffff"
            borderRadius={22}>
            <View style={styles.cardContent}>
              <View style={styles.containerInfo}>
                <Text style={styles.infoArea} numberOfLines={1}>
                  {item.keterangan_portable}
                </Text>
                <View style={styles.sensorList}>
                  <Text style={styles.infoSensor}>
                    Temperature:{' '}
                    {formatSensorValue(sensorData.temperature, 0, '°')}
                  </Text>
                  <Text style={styles.infoSensor}>
                    Humidity: {formatSensorValue(sensorData.humidity, 0, '%')}
                  </Text>
                  <Text style={styles.infoSensor}>
                    PH: {formatSensorValue(sensorData.ph, 1, '')}
                  </Text>
                  <Text style={styles.infoSensor}>
                    EC: {formatSensorValue(sensorData.ec, 0, '')}
                  </Text>
                </View>
                <Text style={styles.infoDate} numberOfLines={1}>
                  {formattedDate}
                </Text>
              </View>
              <View style={styles.cutoutButton}>
                <Svg width={36} height={36} viewBox="0 0 36 36">
                  <Path
                    d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05888 27.9411 0 18 0C8.05888 0 0 8.05888 0 18C0 27.9411 8.05888 36 18 36Z"
                    fill="#B4DC45"
                  />
                </Svg>
                <ArrowDown
                  variant="Linear"
                  size={26}
                  color="white"
                  style={[styles.arrowIcon, {transform: [{rotate: '230deg'}]}]}
                />
              </View>
            </View>
          </CornerCutComponent>
        </TouchableOpacity>
      </View>
    );
  },
);