import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {ArrowLeft2, ArrowDown} from 'iconsax-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  HomeStackParamList,
  PortableToolData,
  SensorData,
} from '../../../HomeStack';

import {Svg, Path} from 'react-native-svg';

type Props = NativeStackScreenProps<HomeStackParamList, 'AllPortableTools'>;

const {width: screenWidth} = Dimensions.get('window');

const CornerCutComponent = React.memo(({
  width = '100%',
  height = 400,
  cutSize = 50,
  backgroundColor = '#ffffff',
  borderRadius = 16,
  children,
}: any) => {
  const safeHeight = Number(height) || 400;
  const safeCutSize = Number(cutSize) || 50;
  const safeBorderRadius = Number(borderRadius) || 16;
  
  // Calculate actual width - if it's a string like '100%', use full container width
  const actualWidth = typeof width === 'string' ? screenWidth - 32 : Number(width) || 300; // 32 for padding

  const pathData = useMemo(() => {
    if (
      !isFinite(actualWidth) ||
      !isFinite(safeHeight) ||
      !isFinite(safeCutSize) ||
      !isFinite(safeBorderRadius)
    ) {
      return `M 0 0 L ${actualWidth} 0 L ${actualWidth} ${safeHeight} L 0 ${safeHeight} Z`;
    }

    const coords = {
      topLeft: safeBorderRadius,
      topRight: actualWidth - safeBorderRadius,
      rightTop: safeBorderRadius,
      rightCutStart: safeHeight - safeCutSize - safeBorderRadius,
      rightCutEnd: safeHeight - safeCutSize,
      cutCornerStart: actualWidth - safeCutSize + safeBorderRadius,
      cutCornerEnd: actualWidth - safeCutSize,
      cutBottomStart: safeHeight - safeCutSize + safeBorderRadius,
      cutBottomEnd: safeHeight - safeBorderRadius,
      bottomRight: actualWidth - safeCutSize - safeBorderRadius,
      bottomLeft: safeBorderRadius,
      leftBottom: safeHeight - safeBorderRadius,
      leftTop: safeBorderRadius,
    };

    return `
      M ${coords.topLeft} 0
      L ${coords.topRight} 0
      Q ${actualWidth} 0 ${actualWidth} ${coords.rightTop}
      L ${actualWidth} ${coords.rightCutStart}
      Q ${actualWidth} ${coords.rightCutEnd} ${coords.topRight} ${coords.rightCutEnd}
      L ${coords.cutCornerStart} ${coords.rightCutEnd}
      Q ${coords.cutCornerEnd} ${coords.rightCutEnd} ${coords.cutCornerEnd} ${coords.cutBottomStart}
      L ${coords.cutCornerEnd} ${coords.cutBottomEnd}
      Q ${coords.cutCornerEnd} ${safeHeight} ${coords.bottomRight} ${safeHeight}
      L ${coords.bottomLeft} ${safeHeight}
      Q 0 ${safeHeight} 0 ${coords.leftBottom}
      L 0 ${coords.leftTop}
      Q 0 0 ${coords.topLeft} 0
      Z
    `.replace(/\s+/g, ' ').trim();
  }, [actualWidth, safeHeight, safeCutSize, safeBorderRadius]);

  return (
    <View
      style={[
        styles.cornerCutContainer,
        {width: '100%', height: safeHeight}, // Use 100% width for container
      ]}>
      <Svg
        width="100%"
        height={safeHeight}
        style={StyleSheet.absoluteFillObject}
        viewBox={`0 0 ${actualWidth} ${safeHeight}`}>
        <Path d={pathData} fill={backgroundColor} />
      </Svg>
      {children}
    </View>
  );
});

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

const PortableItem = React.memo(({
  item,
  onPress,
}: {
  item: PortableToolData;
  onPress: () => void;
}) => {
  const sensorData = useMemo(() => {
    const sensors = item.sensors || [];
    return {
      temperature: sensors.find(s => s.keterangan_sensor?.toLowerCase() === 'temperature'),
      humidity: sensors.find(s => s.keterangan_sensor?.toLowerCase() === 'humidity'),
      ph: sensors.find(s => s.keterangan_sensor?.toLowerCase() === 'ph'),
      ec: sensors.find(s => s.keterangan_sensor?.toLowerCase() === 'ec'),
    };
  }, [item.sensors]);

  const formattedDate = useMemo(() => formatDate(item.created_at), [item.created_at]);

  return (
    <View style={styles.containerBlockPortableVertical}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <CornerCutComponent
          width="100%" // Changed to 100%
          height={140}
          cutSize={40.5}
          backgroundColor="#ffffff"
          borderRadius={22}>
          <View style={styles.cardContentPortableVertical}>
            <View style={styles.containerInfoPortableVertical}>
              <Text style={styles.infoArea} numberOfLines={1}>
                {item.keterangan_portable}
              </Text>
              <View style={styles.sensorVerticalList}>
                <Text style={styles.infoSensorVertical}>
                  Temperature: {formatSensorValue(sensorData.temperature, 0, '°')}
                </Text>
                <Text style={styles.infoSensorVertical}>
                  Humidity: {formatSensorValue(sensorData.humidity, 0, '%')}
                </Text>
                <Text style={styles.infoSensorVertical}>
                  PH: {formatSensorValue(sensorData.ph, 1, '')}
                </Text>
                <Text style={styles.infoSensorVertical}>
                  EC: {formatSensorValue(sensorData.ec, 0, '')}
                </Text>
              </View>
              <Text style={styles.infoDateSensor} numberOfLines={1}>
                {formattedDate}
              </Text>
            </View>
            <View style={styles.cutoutButtonVertical}>
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
                style={[
                  styles.arrowIcon,
                  {transform: [{rotate: '230deg'}]},
                ]}
              />
            </View>
          </View>
        </CornerCutComponent>
      </TouchableOpacity>
    </View>
  );
});

const AllPortableTools: React.FC<Props> = ({navigation}) => {
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

  const reversedData = useMemo(() => 
    [...portableData].reverse(), 
    [portableData]
  );

  const renderPortableItem = useCallback(
    ({item}: {item: PortableToolData}) => (
      <PortableItem
        item={item}
        onPress={() => navigation.navigate('ReadSoilDetail', {portableData: item})}
      />
    ),
    [navigation],
  );

  const keyExtractor = useCallback(
    (item: PortableToolData) => item.id.toString(),
    [],
  );

  const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft2 color="black" variant="Linear" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Portable Tools</Text>
        <View style={{width: 24}} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B4DC45" />
          <Text style={styles.loadingText}>Loading portable tools data...</Text>
        </View>
      ) : (
        <FlatList
          data={reversedData}
          renderItem={renderPortableItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchPortableData}
              colors={['#B4DC45']}
              tintColor="#B4DC45"
            />
          }
          ItemSeparatorComponent={ItemSeparator}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={8}
          getItemLayout={(data, index) => ({
            length: 156, 
            offset: 156 * index,
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Medium',
    color: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  listContainer: {
    padding: 16,
  },
  containerBlockPortableVertical: {
    width: '100%', // Changed to 100%
  },
  cardContentPortableVertical: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  containerInfoPortableVertical: {
    flex: 1,
  },
  infoArea: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Medium',
    color: 'black',
    marginBottom: 4,
  },
  infoDateSensor: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-Regular',
    color: '#999',
    marginTop: 1,
  },
  cutoutButtonVertical: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  arrowIcon: {
    position: 'absolute',
  },
  cornerCutContainer: {
    overflow: 'hidden',
  },
  sensorVerticalList: {
    marginVertical: 4,
  },
  infoSensorVertical: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk-Regular',
    color: 'black',
    marginBottom: 0,
  },
  separator: {
    height: 16,
  },
});

export default AllPortableTools;