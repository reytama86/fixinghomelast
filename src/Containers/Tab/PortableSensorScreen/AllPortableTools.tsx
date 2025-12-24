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
  BackHandler,
  ScrollView,
} from 'react-native';
import {ArrowLeft2, ArrowDown} from 'iconsax-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  HomeStackParamList,
  PortableToolData,
  SensorData,
} from '../../../../HomeStack';
import {Svg, Path} from 'react-native-svg';
import {useFocusEffect} from '@react-navigation/native';
import {LineChart, BarChart} from 'react-native-chart-kit';

type Props = NativeStackScreenProps<HomeStackParamList, 'AllPortableTools'>;

const {width: screenWidth} = Dimensions.get('window');

interface BlockAverage {
  [parameter: string]: number;
}

interface AverageData {
  [blockName: string]: BlockAverage;
}

interface ParameterAverage {
  parameter: string;
  average: number;
  min: number;
  max: number;
  std_dev: number;
  count: number;
}

type TimeRange = '1week' | '2weeks' | '1month' | '2months';

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
  const actualWidth =
    typeof width === 'string' ? screenWidth - 32 : Number(width) || 300;

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
    `
      .replace(/\s+/g, ' ')
      .trim();
  }, [actualWidth, safeHeight, safeCutSize, safeBorderRadius]);

  return (
    <View
      style={[styles.cornerCutContainer, {width: '100%', height: safeHeight}]}>
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

const PortableItem = React.memo(
  ({item, onPress}: {item: PortableToolData; onPress: () => void}) => {
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
      <View style={styles.containerBlockPortableVertical}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          <CornerCutComponent
            width="100%"
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
                    Temperature:{' '}
                    {formatSensorValue(sensorData.temperature, 0, '°')}
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
  },
);

const SegmentedControl = React.memo(
  ({
    options,
    selectedIndex,
    onSelectIndex,
  }: {
    options: string[];
    selectedIndex: number;
    onSelectIndex: (index: number) => void;
  }) => {
    return (
      <View style={styles.segmentedControl}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.segment,
              selectedIndex === index && styles.selectedSegment,
            ]}
            onPress={() => onSelectIndex(index)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.segmentText,
                selectedIndex === index && styles.selectedSegmentText,
              ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  },
);

const TimeRangeSelector = React.memo(
  ({
    selectedRange,
    onSelectRange,
  }: {
    selectedRange: TimeRange;
    onSelectRange: (range: TimeRange) => void;
  }) => {
    const ranges: {label: string; value: TimeRange}[] = [
      {label: '1 Week', value: '1week'},
      {label: '2 Weeks', value: '2weeks'},
      {label: '1 Month', value: '1month'},
      {label: '2 Months', value: '2months'},
    ];

    return (
      <View style={styles.timeRangeContainer}>
        {ranges.map(range => (
          <TouchableOpacity
            key={range.value}
            style={[
              styles.timeRangeButton,
              selectedRange === range.value && styles.selectedTimeRange,
            ]}
            onPress={() => onSelectRange(range.value)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.timeRangeText,
                selectedRange === range.value && styles.selectedTimeRangeText,
              ]}>
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  },
);

const AverageAnalysisView = React.memo(
  ({
    averageData,
    parameterAverages,
    timeRange,
    onTimeRangeChange,
    loading,
  }: {
    averageData: AverageData;
    parameterAverages: ParameterAverage[];
    timeRange: TimeRange;
    onTimeRangeChange: (range: TimeRange) => void;
    loading: boolean;
  }) => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B4DC45" />
          <Text style={styles.loadingText}>Loading average data...</Text>
        </View>
      );
    }

    const chartConfig = {
      backgroundColor: '#ffffff',
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      decimalPlaces: 1,
      color: (opacity = 1) => `rgba(180, 220, 69, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {borderRadius: 16},
      propsForDots: {r: '6', strokeWidth: '2', stroke: '#B4DC45'},
    };

    return (
      <ScrollView
        style={styles.analysisContainer}
        showsVerticalScrollIndicator={false}>
        <TimeRangeSelector
          selectedRange={timeRange}
          onSelectRange={onTimeRangeChange}
        />

        {/* Parameter Averages Cards */}
        <Text style={styles.sectionTitle}>Overall Parameter Averages</Text>
        {parameterAverages.map((param, index) => (
          <View key={index} style={styles.parameterCard}>
            <Text style={styles.parameterName}>{param.parameter}</Text>
            <View style={styles.parameterStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Average</Text>
                <Text style={styles.statValue}>{param.average.toFixed(2)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Min</Text>
                <Text style={styles.statValue}>{param.min.toFixed(2)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Max</Text>
                <Text style={styles.statValue}>{param.max.toFixed(2)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Std Dev</Text>
                <Text style={styles.statValue}>{param.std_dev.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Block Comparison Charts */}
        <Text style={styles.sectionTitle}>Block 1-9 Comparison</Text>
        {parameterAverages.map((param, index) => {
          const blockLabels: string[] = [];
          const blockValues: number[] = [];

          for (let i = 1; i <= 9; i++) {
            const blockKey = `Block ${i}`;
            blockLabels.push(`B${i}`);
            blockValues.push(
              averageData[blockKey]?.[param.parameter] || 0,
            );
          }

          return (
            <View key={index} style={styles.chartContainer}>
              <Text style={styles.chartTitle}>
                {param.parameter} - Block Comparison
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingRight: 16}}>
                <BarChart
                  data={{
                    labels: blockLabels,
                    datasets: [{data: blockValues}],
                  }}
                  width={screenWidth - 32}
                  height={200}
                  chartConfig={{
                    ...chartConfig,
                    propsForLabels: {
                      fontSize: 10,
                    },
                    barPercentage: 0.7,
                  }}
                  style={styles.chart}
                  yAxisSuffix=""
                  fromZero
                  withInnerLines={true}
                />
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    );
  },
);

const AllPortableTools: React.FC<Props> = ({navigation}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [portableData, setPortableData] = useState<PortableToolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageData, setAverageData] = useState<AverageData>({});
  const [parameterAverages, setParameterAverages] = useState<
    ParameterAverage[]
  >([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('1month');
  const [averageLoading, setAverageLoading] = useState(false);

  const getDateRange = (range: TimeRange): {start: string; end: string} => {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case '1week':
        start.setDate(end.getDate() - 7);
        break;
      case '2weeks':
        start.setDate(end.getDate() - 14);
        break;
      case '1month':
        start.setMonth(end.getMonth() - 1);
        break;
      case '2months':
        start.setMonth(end.getMonth() - 2);
        break;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const fetchAverageData = useCallback(async (range: TimeRange) => {
    try {
      setAverageLoading(true);
      const {start, end} = getDateRange(range);

      const response = await fetch(
        `https://iot-vanili-api.permataindonesia.com/api/portable-blocks/averages-json?startDate=${start}&endDate=${end}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch average data');
      }

      const data = await response.json();

      if (data.success) {
        setAverageData(data.blockAverages);
        setParameterAverages(data.parameterAverages);
      } else {
        throw new Error(data.message || 'Failed to load data');
      }
    } catch (error) {
      console.error('Error fetching average data:', error);
      // Set empty data on error
      setAverageData({});
      setParameterAverages([]);
    } finally {
      setAverageLoading(false);
    }
  }, []);

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
    fetchAverageData(timeRange);
  }, [fetchPortableData, fetchAverageData, timeRange]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  const reversedData = useMemo(
    () => [...portableData].reverse(),
    [portableData],
  );

  const renderPortableItem = useCallback(
    ({item}: {item: PortableToolData}) => (
      <PortableItem
        item={item}
        onPress={() =>
          navigation.navigate('ReadSoilDetail', {portableData: item, isHistoryMode: true})
        }
      />
    ),
    [navigation],
  );

  const keyExtractor = useCallback(
    (item: PortableToolData) => item.id.toString(),
    [],
  );

  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={{marginLeft: 16}}>
          <ArrowLeft2 color="black" variant="Linear" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portable Tools</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.segmentedControlContainer}>
        <SegmentedControl
          options={['List Data', 'Average Analysis']}
          selectedIndex={selectedTab}
          onSelectIndex={setSelectedTab}
        />
      </View>

      {selectedTab === 0 ? (
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#B4DC45" />
            <Text style={styles.loadingText}>
              Loading portable tools data...
            </Text>
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
        )
      ) : (
        <AverageAnalysisView
          averageData={averageData}
          parameterAverages={parameterAverages}
          timeRange={timeRange}
          onTimeRangeChange={range => {
            setTimeRange(range);
            fetchAverageData(range);
          }}
          loading={averageLoading}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 32,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Medium',
    color: 'black',
  },
  segmentedControlContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedSegment: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Medium',
    color: '#666',
  },
  selectedSegmentText: {
    color: '#B4DC45',
    fontWeight: '600',
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
  analysisContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedTimeRange: {
    backgroundColor: '#B4DC45',
    borderColor: '#B4DC45',
  },
  timeRangeText: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk-Medium',
    color: '#666',
  },
  selectedTimeRangeText: {
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: 'black',
    marginTop: 8,
    marginBottom: 12,
  },
  parameterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  parameterName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: '#B4DC45',
    marginBottom: 12,
  },
  parameterStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-Regular',
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: 'black',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: 'black',
    marginBottom: 12,
  },
  chartWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  chart: {
    borderRadius: 8,
    marginLeft: -30
  },
});

export default AllPortableTools;