import React, {useCallback, useMemo} from 'react';
import {View, Text} from 'react-native';
import {SensorItem} from '../SensorItem';
import DynamicGauge from '@Organism/DynamicGauge';
import {styles} from './styles';
import moment from 'moment';

interface DeviceCardProps {
  deviceNumber: number;
  sensorData: any;
  isFarmer: boolean;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({deviceNumber, sensorData, isFarmer}) => {
  const getSensorValue = useCallback(
    (sensorArray: any[], keterangan: string): number => {
      const sensor = sensorArray?.find(item => item.keterangan_sensor === keterangan);
      return sensor?.nilai_sensor || 0;
    },
    [],
  );

  const sensorKey = `sensor_${deviceNumber}`;
  const deviceData = sensorData?.[sensorKey];

  const getLatestTimestamp = useCallback(() => {
    if (!deviceData || deviceData.length === 0) return null;

    const timestamps = deviceData
      .map(sensor => sensor.created_at)
      .filter(timestamp => timestamp !== null && timestamp !== undefined);

    if (timestamps.length === 0) return null;

    const latestTimestamp = timestamps.reduce((latest, current) => {
      return moment(current).isAfter(moment(latest)) ? current : latest;
    });

    return latestTimestamp;
  }, [deviceData]);

  const latestTimestamp = useMemo(() => getLatestTimestamp(), [getLatestTimestamp]);

  const hasGauge = deviceNumber === 2;
  const temperature = useMemo(
    () => getSensorValue(deviceData || [], 'Temperature'), 
    [getSensorValue, deviceData],
  );
  const humidity = useMemo(
    () => getSensorValue(deviceData || [], 'Humidity'), 
    [getSensorValue, deviceData],
  );

  if (!deviceData) return null;

  return (
    <View style={hasGauge ? styles.cardThree : styles.cardTwo}>
      <Text style={styles.soilTitle}>Statistic Device {deviceNumber}</Text>

      {!isFarmer && (<View style={styles.timestampContainer}>
        <Text style={styles.timestampLabel}>Last updated at: </Text>
        <Text style={styles.timestampValue}>
          {latestTimestamp 
            ? moment(latestTimestamp).format('DD MMMM YYYY, HH:mm')
            : 'No data'}
        </Text>
      </View>)}

      {hasGauge && (
        <View style={styles.containerTransmisi}>
          <View style={[styles.cardTransmisi, {marginRight: 12}]}>
            <View style={styles.cardDetailTransmisi}>
              <View style={styles.Transmisi}>
                <DynamicGauge value={temperature} type="temperature" />
              </View>
              <Text style={styles.nameSensorTransmisi}>Temperature</Text>
            </View>
            <Text style={styles.valueTransmisi}>{temperature}°</Text>
          </View>
          <View style={styles.cardTransmisi}>
            <View style={styles.cardDetailTransmisi}>
              <View style={styles.Transmisi}>
                <DynamicGauge value={humidity} type="humidity" />
              </View>
              <Text style={styles.nameSensorTransmisi}>Humidity</Text>
            </View>
            <Text style={styles.valueTransmisi}>{Math.round(humidity)}%</Text>
          </View>
        </View>
      )}

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

export default DeviceCard;