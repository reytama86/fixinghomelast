import React, {useCallback, useMemo} from 'react';
import {View, Text, TouchableOpacity, FlatList, ActivityIndicator} from 'react-native';
import {Maximize1, ArrowDown} from 'iconsax-react-native';
import Svg, {Path} from 'react-native-svg';
import { CornerCutComponent } from '../FieldList/CornerCutComponent';
import {PortableToolData, SensorData} from 'HomeStack';
import {styles} from './styles';

interface PortableToolsListProps {
  portableData: PortableToolData[];
  loading: boolean;
  navigation: any;
  onRefresh: () => void;
}

const PortableToolsList: React.FC<PortableToolsListProps> = ({
  portableData,
  loading,
  navigation,
  onRefresh,
}) => {
  const formatFunctions = useMemo(
    () => ({
      formatDate: (dateString: string): string => {
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
      },
    }),
    [],
  );

  const {formatDate} = formatFunctions;

  const renderPortableItem = useCallback(
    ({item}: {item: PortableToolData}) => {
      const formatSensorValue = (
        sensor: SensorData | undefined,
        decimals: number = 1,
        unit: string = '',
      ): string => {
        if (!sensor || sensor.nilai_sensor == null) return 'N/A';
        const value = Number(sensor.nilai_sensor);
        return isNaN(value) ? 'N/A' : `${value.toFixed(decimals)}${unit}`;
      };

      const temperatureSensor = item.sensors?.find(
        s => s.keterangan_sensor?.toLowerCase() === 'temperature',
      );
      const humiditySensor = item.sensors?.find(
        s => s.keterangan_sensor?.toLowerCase() === 'humidity',
      );
      const phSensor = item.sensors?.find(
        s => s.keterangan_sensor?.toLowerCase() === 'ph',
      );
      const ecSensor = item.sensors?.find(
        s => s.keterangan_sensor?.toLowerCase() === 'ec',
      );

      return (
        <View style={[styles.containerBlockPortable, {marginRight: 23}]}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ReadSoilDetail', {portableData: item})
            }>
            <CornerCutComponent
              width={254}
              height={140}
              cutSize={40.5}
              backgroundColor="#ffffff"
              borderRadius={22}>
              <View style={styles.cardContentPortable}>
                <View style={styles.containerInfoPortable}>
                  <Text style={styles.infoArea}>
                    {item.keterangan_portable}
                  </Text>
                  <Text style={styles.infoSensor}>
                    Temperature: {formatSensorValue(temperatureSensor, 0, '°')}
                  </Text>
                  <Text style={styles.infoSensor}>
                    Soil Humidity: {formatSensorValue(humiditySensor, 0, '%')}
                  </Text>
                  <Text style={styles.infoSensor}>
                    PH: {formatSensorValue(phSensor, 1, '')}
                  </Text>
                  <Text style={styles.infoSensor}>
                    EC: {formatSensorValue(ecSensor, 0, '')}
                  </Text>
                  <Text style={styles.infoDateSensor}>
                    {formatDate(item.created_at)}
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
                    style={styles.arrowIcon}
                  />
                </View>
              </View>
            </CornerCutComponent>
          </TouchableOpacity>
        </View>
      );
    },
    [navigation, formatDate],
  );

  return (
    <View style={styles.fieldPortableList}>
      <View style={styles.headerFieldPortable}>
        <Text style={styles.headerText}>Portable Tools Scanning History</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('AllPortableTools');
          }}>
          <View style={styles.showAll}>
            <Text style={styles.showAllText}>Show All</Text>
            <Maximize1 color="#B4DC45" variant="Broken" size={24} />
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingPortable}>
          <ActivityIndicator size="large" color="#B4DC45" />
          <Text style={styles.loadingText}>Loading portable tools data...</Text>
        </View>
      ) : (
        <FlatList
          data={[...portableData].reverse()}
          renderItem={renderPortableItem}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 16}}
          snapToInterval={270}
          snapToAlignment="start"
          decelerationRate="fast"
          onRefresh={onRefresh}
          refreshing={loading}
        />
      )}
    </View>
  );
};

export default PortableToolsList;