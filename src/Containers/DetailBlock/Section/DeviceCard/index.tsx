import React, {useCallback, useMemo} from 'react';
import {View, Text} from 'react-native';
import {SensorItem} from '../SensorItem';
import GaugeSvg from '@Atom/Gauge';
import Ellips from '@Assets/svg/Ellips';
import {styles} from './styles';

interface DeviceCardProps {
  deviceNumber: number;
  sensorData: any;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({deviceNumber, sensorData}) => {
  const getSensorValue = useCallback(
    (sensorArray: any[], keterangan: string): number => {
      const sensor = sensorArray?.find(item => item.keterangan_sensor === keterangan);
      return sensor?.nilai_sensor || 0;
    },
    [],
  );

  const sensorKey = `sensor_${deviceNumber}`;
  const deviceData = sensorData?.[sensorKey];

  if (!deviceData) return null;

  const hasGauge = deviceNumber === 2;
  const temperature = useMemo(
    () => getSensorValue(deviceData, 'Temperature'),
    [getSensorValue, deviceData],
  );
  const humidity = useMemo(
    () => getSensorValue(deviceData, 'Humidity'),
    [getSensorValue, deviceData],
  );

  return (
    <View style={hasGauge ? styles.cardThree : styles.cardTwo}>
      <Text style={styles.soilTitle}>Statistic Device {deviceNumber}</Text>

      {/* Temperature & Humidity Gauges (Device 2 only) */}
      {hasGauge && (
        <View style={styles.containerTransmisi}>
          <View style={[styles.cardTransmisi, {marginRight: 12}]}>
            <View style={styles.cardDetailTransmisi}>
              <View style={styles.Transmisi}>
                <GaugeSvg />
                <View style={{top: -100, right: -105}}>
                  <Ellips />
                </View>
              </View>
              <Text style={styles.nameSensorTransmisi}>Temperature</Text>
            </View>
            <Text style={styles.valueTransmisi}>{temperature}°</Text>
          </View>
          <View style={styles.cardTransmisi}>
            <View style={styles.cardDetailTransmisi}>
              <View style={styles.Transmisi}>
                <GaugeSvg />
              </View>
              <Text style={styles.nameSensorTransmisi}>Humidity</Text>
            </View>
            <Text style={styles.valueTransmisi}>{Math.round(humidity)}%</Text>
          </View>
        </View>
      )}

      {/* Soil Statistics */}
      <View style={styles.cardContentTwo}>
        <Text style={styles.soilSubTitle}>Soil Statistic</Text>

        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <SensorItem
              label="Soil Temperature"
              value={getSensorValue(deviceData, 'Soil Temperature')}
              sensorType="Soil Temperature"
              unit="°"
            />
            <SensorItem
              label="Soil Humidity"
              value={getSensorValue(deviceData, 'Soil Humidity')}
              sensorType="Soil Humidity"
              unit="%"
            />
          </View>
          <View style={styles.gridRow}>
            <SensorItem
              label="Conductivity"
              value={getSensorValue(deviceData, 'EC')}
              sensorType="EC"
              unit="μS/cm"
            />
            <SensorItem
              label="PH"
              value={getSensorValue(deviceData, 'PH')}
              sensorType="PH"
            />
          </View>
          <View style={styles.gridRow}>
            <SensorItem
              label="Nitrogen"
              value={getSensorValue(deviceData, 'Nitrogen')}
              sensorType="Nitrogen"
              unit=" mg/kg"
            />
            <SensorItem
              label="Phosphor"
              value={getSensorValue(deviceData, 'Phosphor')}
              sensorType="Phosphor"
              unit=" mg/kg"
            />
          </View>
          <View style={styles.gridRow}>
            <SensorItem
              label="Kalium"
              value={getSensorValue(deviceData, 'Kalium')}
              sensorType="Kalium"
              unit=" mg/kg"
            />
            {deviceNumber === 2 ? (
              <SensorItem
                label="Light"
                value={getSensorValue(deviceData, 'Light')}
                sensorType="Light"
                unit=" Lux"
              />
            ) : (
              <View style={styles.gridItemEmpty} />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default DeviceCard