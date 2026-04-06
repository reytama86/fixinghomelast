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

const EmptyCell = () => <View style={styles.gridItemEmpty} />;

export const DeviceCard: React.FC<DeviceCardProps> = ({
  deviceNumber,
  sensorData,
  isFarmer,
}) => {
  const getSensorValue = useCallback(
    (sensorArray: any[], keterangan: string): number => {
      const sensor = sensorArray?.find(
        item => item.keterangan_sensor === keterangan,
      );
      return sensor?.nilai_sensor ?? 0;
    },
    [],
  );

  const sensorKey = `sensor_${deviceNumber}`;
  const deviceData = sensorData?.[sensorKey];

  const availableSensors = useMemo(() => {
    if (!deviceData) return new Set<string>();
    return new Set<string>(
      deviceData
        .filter((item: any) => item.nilai_sensor !== null) 
        .map((item: any) => item.keterangan_sensor as string),
    );
  }, [deviceData]);

  const hasTemperatureHumidity =
    availableSensors.has('Temperature') && availableSensors.has('Humidity');

  const hasSoilData =
    availableSensors.has('Soil Temperature') ||
    availableSensors.has('Soil Humidity') ||
    availableSensors.has('EC') ||
    availableSensors.has('PH') ||
    availableSensors.has('Nitrogen') ||
    availableSensors.has('Phosphor') ||
    availableSensors.has('Kalium');

  const hasLight = availableSensors.has('Light');

  const cardHeight = useMemo(() => {
    let height = 60; 
    if (!isFarmer) height += 30; 
    if (hasTemperatureHumidity) height += 172; 
    if (hasSoilData) height += 240; 
    if (!hasSoilData && hasLight) height += 80;
    return height;
  }, [hasTemperatureHumidity, hasSoilData, hasLight, isFarmer]);

  const getLatestTimestamp = useCallback(() => {
    if (!deviceData || deviceData.length === 0) return null;
    const timestamps = deviceData
      .map((sensor: any) => sensor.created_at)
      .filter((t: any) => t !== null && t !== undefined);
    if (timestamps.length === 0) return null;
    return timestamps.reduce((latest: string, current: string) =>
      moment(current).isAfter(moment(latest)) ? current : latest,
    );
  }, [deviceData]);

  const latestTimestamp = useMemo(
    () => getLatestTimestamp(),
    [getLatestTimestamp],
  );

  const temperature = useMemo(
    () => getSensorValue(deviceData || [], 'Temperature'),
    [getSensorValue, deviceData],
  );
  const humidity = useMemo(
    () => getSensorValue(deviceData || [], 'Humidity'),
    [getSensorValue, deviceData],
  );
  const light = useMemo(
    () => getSensorValue(deviceData || [], 'Light'),
    [getSensorValue, deviceData],
  );

  if (!deviceData) return null;

  return (
    <View style={[styles.cardTwo, {height: cardHeight}]}>
      <Text style={styles.soilTitle}>Statistic Device {deviceNumber}</Text>

      {!isFarmer && (
        <View style={styles.timestampContainer}>
          <Text style={styles.timestampLabel}>Last updated at: </Text>
          <Text style={styles.timestampValue}>
            {latestTimestamp
              ? moment(latestTimestamp).format('DD MMMM YYYY, HH:mm')
              : 'No data'}
          </Text>
        </View>
      )}

      {hasTemperatureHumidity && (
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

      {hasSoilData && (
        <View style={styles.cardContentTwo}>
          <Text style={styles.soilSubTitle}>Soil Statistic</Text>
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              {availableSensors.has('Soil Temperature') ? (
                <SensorItem
                  label="Soil Temperature"
                  value={getSensorValue(deviceData, 'Soil Temperature')}
                  sensorType="Soil Temperature"
                  unit="°"
                />
              ) : (
                <EmptyCell />
              )}
              {availableSensors.has('Soil Humidity') ? (
                <SensorItem
                  label="Soil Humidity"
                  value={getSensorValue(deviceData, 'Soil Humidity')}
                  sensorType="Soil Humidity"
                  unit="%"
                />
              ) : (
                <EmptyCell />
              )}
            </View>

            <View style={styles.gridRow}>
              {availableSensors.has('EC') ? (
                <SensorItem
                  label="Conductivity"
                  value={getSensorValue(deviceData, 'EC')}
                  sensorType="EC"
                  unit="μS/cm"
                />
              ) : (
                <EmptyCell />
              )}
              {availableSensors.has('PH') ? (
                <SensorItem
                  label="PH"
                  value={getSensorValue(deviceData, 'PH')}
                  sensorType="PH"
                />
              ) : (
                <EmptyCell />
              )}
            </View>

            <View style={styles.gridRow}>
              {availableSensors.has('Nitrogen') ? (
                <SensorItem
                  label="Nitrogen"
                  value={getSensorValue(deviceData, 'Nitrogen')}
                  sensorType="Nitrogen"
                  unit=" mg/kg"
                />
              ) : (
                <EmptyCell />
              )}
              {availableSensors.has('Phosphor') ? (
                <SensorItem
                  label="Phosphor"
                  value={getSensorValue(deviceData, 'Phosphor')}
                  sensorType="Phosphor"
                  unit=" mg/kg"
                />
              ) : (
                <EmptyCell />
              )}
            </View>

            <View style={styles.gridRow}>
              {availableSensors.has('Kalium') ? (
                <SensorItem
                  label="Kalium"
                  value={getSensorValue(deviceData, 'Kalium')}
                  sensorType="Kalium"
                  unit=" mg/kg"
                />
              ) : (
                <EmptyCell />
              )}
              {hasLight ? (
                <SensorItem
                  label="Light"
                  value={light}
                  sensorType="Light"
                  unit=" Lux"
                />
              ) : (
                <EmptyCell />
              )}
            </View>
          </View>
        </View>
      )}

      {!hasSoilData && hasLight && (
        <View style={styles.cardContentTwo}>
          <Text style={styles.soilSubTitle}>Light</Text>
          <View style={styles.gridRow}>
            <SensorItem
              label="Light"
              value={light}
              sensorType="Light"
              unit=" Lux"
            />
            <EmptyCell />
          </View>
        </View>
      )}
    </View>
  );
};

export default DeviceCard;