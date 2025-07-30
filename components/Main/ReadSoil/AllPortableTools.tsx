import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ArrowLeft2, ArrowDown } from 'iconsax-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList, PortableToolData, SensorData } from '../../../HomeStack';

import { Svg, Path } from 'react-native-svg';

type Props = NativeStackScreenProps<HomeStackParamList, 'AllPortableTools'>;

const AllPortableTools: React.FC<Props> = ({ navigation }) => {
  const [portableData, setPortableData] = useState<PortableToolData[]>([]);
  const [loading, setLoading] = useState(true);
  const CornerCutComponent = useMemo(() => {
    return ({
      width = 300,
      height = 400,
      cutSize = 50,
      backgroundColor = '#ffffff',
      borderRadius = 16,
      children,
    }: any) => {
      // Ensure all values are valid numbers
      const safeWidth = Number(width) || 300;
      const safeHeight = Number(height) || 400;
      const safeCutSize = Number(cutSize) || 50;
      const safeBorderRadius = Number(borderRadius) || 16;
      
      // Validate that all values are finite numbers
      if (!isFinite(safeWidth) || !isFinite(safeHeight) || 
          !isFinite(safeCutSize) || !isFinite(safeBorderRadius)) {
        console.warn('Invalid dimensions for CornerCutComponent:', {
          width: safeWidth,
          height: safeHeight,
          cutSize: safeCutSize,
          borderRadius: safeBorderRadius
        });
        return null; // or return a fallback component
      }
      
      const createPath = () => {
        // Calculate all coordinates with safe values
        const coords = {
          topLeft: safeBorderRadius,
          topRight: safeWidth - safeBorderRadius,
          rightTop: safeBorderRadius,
          rightCutStart: safeHeight - safeCutSize - safeBorderRadius,
          rightCutEnd: safeHeight - safeCutSize,
          cutCornerStart: safeWidth - safeCutSize + safeBorderRadius,
          cutCornerEnd: safeWidth - safeCutSize,
          cutBottomStart: safeHeight - safeCutSize + safeBorderRadius,
          cutBottomEnd: safeHeight - safeBorderRadius,
          bottomRight: safeWidth - safeCutSize - safeBorderRadius,
          bottomLeft: safeBorderRadius,
          leftBottom: safeHeight - safeBorderRadius,
          leftTop: safeBorderRadius,
        };
        
        // Validate all coordinates are finite
        const allCoords = Object.values(coords);
        if (allCoords.some(coord => !isFinite(coord))) {
          console.warn('Invalid coordinates calculated:', coords);
          return `M 0 0 L ${safeWidth} 0 L ${safeWidth} ${safeHeight} L 0 ${safeHeight} Z`;
        }
        
        return `
          M ${coords.topLeft} 0
          L ${coords.topRight} 0
          Q ${safeWidth} 0 ${safeWidth} ${coords.rightTop}
          L ${safeWidth} ${coords.rightCutStart}
          Q ${safeWidth} ${coords.rightCutEnd} ${coords.topRight} ${coords.rightCutEnd}
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
      };
  
      return (
        <View style={[styles.cornerCutContainer, {width: safeWidth, height: safeHeight}]}>
          <Svg
            width={safeWidth}
            height={safeHeight}
            style={StyleSheet.absoluteFillObject}>
            <Path d={createPath()} fill={backgroundColor} />
          </Svg>
          {children}
        </View>
      );
    };
  }, []);
      
  // Format date function
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

  // Fetch portable data function (sesuaikan dengan API Anda)
  const fetchPortableData = useCallback(async () => {
    try {
      setLoading(true);
      // Gunakan limit yang sangat besar atau parameter khusus untuk "show all"
      const response = await fetch('https://iot-vanili-api.permataindonesia.com/api/portable-tools?limit=100&sort=created_at&order=desc');
      
      if (!response.ok) {
        throw new Error('Failed to fetch portable data');
      }
      
      const data = await response.json();
      setPortableData(data);
    } catch (error) {
      console.error('Error fetching portable data:', error);
      // Tambahkan error handling yang user-friendly
      setPortableData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortableData();
  }, [fetchPortableData]);

  // Render item untuk vertical list
  const renderPortableItemVertical = useCallback(
    ({ item }: { item: PortableToolData }) => {
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
        <View style={styles.containerBlockPortableVertical}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ReadSoilDetail', { portableData: item })
            }>
            <CornerCutComponent
              width={360}
              height={140}
              cutSize={40.5}
              backgroundColor="#ffffff"
              borderRadius={22}>
              <View style={styles.cardContentPortableVertical}>
                <View style={styles.containerInfoPortableVertical}>
                  <Text style={styles.infoArea}>
                    {item.keterangan_portable}
                  </Text>
                  <View style={styles.sensorVerticalList}>
  <Text style={styles.infoSensorVertical}>
    Temperature: {formatSensorValue(temperatureSensor, 0, '°')}
  </Text>
  <Text style={styles.infoSensorVertical}>
    Humidity: {formatSensorValue(humiditySensor, 0, '%')}
  </Text>
  <Text style={styles.infoSensorVertical}>
    PH: {formatSensorValue(phSensor, 1, '')}
  </Text>
  <Text style={styles.infoSensorVertical}>
    EC: {formatSensorValue(ecSensor, 0, '')}
  </Text>
</View>
                  <Text style={styles.infoDateSensor}>
                    {formatDate(item.created_at)}
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
      style={[styles.arrowIcon, { transform: [{ rotate: '230deg' }] }]}
    />
  </View>
              </View>
            </CornerCutComponent>
          </TouchableOpacity>
        </View>
      );
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft2
            color="black"
            variant="Linear"
            size={24}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Portable Tools</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B4DC45" />
          <Text style={styles.loadingText}>
            Loading portable tools data...
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...portableData].reverse()}
          renderItem={renderPortableItemVertical}
          keyExtractor={item => item.id.toString()}
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
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
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
    width: '100%',
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
  sensorGrid: {
    marginVertical: 8,
  },
  sensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoSensor: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk-Regular',
    color: '#666',
    flex: 1,
  },
  infoDateSensor: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-Regular',
    color: '#999',
    marginTop: 1,
  },
  cutoutButtonVertical: {
    position: 'absolute',
    bottom: 0, // Jarak dari bawah card
    right: 0,  // Jarak dari kanan card (sesuai padding)
    alignItems: 'center',
    justifyContent: 'center',
    // Pastikan berada di dalam area cutout
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
});

export default AllPortableTools;