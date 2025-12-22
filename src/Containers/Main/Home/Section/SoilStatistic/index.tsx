import React, {useCallback} from 'react';
import {View, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import { getSoilStatus } from '@Helpers/getSoilStatus';

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

interface SoilStatisticProps {
  sensorData: MedianSensorResponse['data'] | null;
}

const SoilStatistic: React.FC<SoilStatisticProps> = ({sensorData}) => {
  const getSensorValue = useCallback(
    (sensorName: string): string => {
      if (!sensorData || !sensorData[sensorName]) return 'N/A';
      return sensorData[sensorName].median.toFixed(1);
    },
    [sensorData],
  );


  const renderSoilIndicator = useCallback(
    (sensorName: string) => {
      const rawValue = getSensorValue(sensorName);
      const numericValue = parseFloat(rawValue);

      if (isNaN(numericValue) || rawValue === 'N/A') {
        return {color: 'gray', icon: 'remove', status: 'N/A'};
      }

      return getSoilStatus(sensorName, numericValue);
    },
    [getSensorValue, getSoilStatus],
  );

  const renderStatItem = (label: string, sensorName: string, unit: string = '') => {
    const indicator = renderSoilIndicator(sensorName);
    return (
      <View style={styles.detailStatisticOne}>
        <View style={styles.statContent}>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={styles.statValue}>
            {getSensorValue(sensorName)} {unit}
          </Text>
        </View>
        <View style={styles.statExtra}>
          <Ionicons name={indicator.icon} size={18} color={indicator.color} />
          <Text style={[styles.statStatus, {color: indicator.color}]}>
            {indicator.status}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.cardTwo}>
      <Text style={styles.soilTitle}>Soil Statistic</Text>
      
      <View style={styles.soilStatisticOne}>
        {renderStatItem('PH', 'PH')}
        {renderStatItem('Nitrogen', 'Nitrogen', 'mg/kg')}
      </View>

      <View style={styles.soilStatisticTwo}>
        {renderStatItem('Phosphor', 'Phosphor', 'mg/kg')}
        {renderStatItem('Kalium', 'Kalium', 'mg/kg')}
      </View>
    </View>
  );
};

export default SoilStatistic;