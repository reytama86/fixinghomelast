import React, {useMemo} from 'react';
import {View, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getSensorStatus} from '@/helpers/sensorStatusHelper';
import {styles} from './styles';

interface SensorItemProps {
  label: string;
  value: number;
  sensorType: string;
  unit?: string;
}

export const SensorItem: React.FC<SensorItemProps> = ({
  label,
  value,
  sensorType,
  unit = '',
}) => {
  const statusInfo = useMemo(
    () => getSensorStatus(value, sensorType),
    [value, sensorType],
  );

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
          <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
        )}
        <Text style={[styles.statStatus, {color: statusInfo.color}]}>
          {statusInfo.status}
        </Text>
      </View>
    </View>
  );
};