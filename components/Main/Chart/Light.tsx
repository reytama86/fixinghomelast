import React, {useState, useMemo, useEffect} from 'react';
import {View, Text, Dimensions, StyleSheet, ActivityIndicator} from 'react-native';
import {barDataItem, LineChart} from 'react-native-gifted-charts';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const {width: SCREEN_W} = Dimensions.get('window');
const PADDING = 16;
const CARD_WIDTH = SCREEN_W - PADDING * 2;

type DataPoint = {value: number; date: string};
type Sensor = {id_sensor: number; esp_id: string};
type Blok = {id_detail_blok: number; nama_blok: string; kondisi_blok: string};
type MetricType = 'Light' | 'Kelembaban Udara' | 'Cahaya' | 'Kelembaban Tanah';
type MyBarDataItem = barDataItem & {date: string};

function formatLabel(date: Date, withTime = false): string {
  const day = date.getDate();
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];
  const month = monthNames[date.getMonth()];
  if (!withTime) {
    return `${day} ${month}`;
  }
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month}\n${hh}:${mm}`;
}

export default function Light() {
  const [barData, setBarData] = useState<MyBarDataItem[]>([]);
  const [range, setRange] = useState<'7D' | '1M' | '1Y' | 'Max'>('7D');
  const [sensorList, setSensorList] = useState<Sensor[]>([]);
  const [selectedSensorIndex, setSelectedSensorIndex] = useState(0);
  const [blokList, setBlokList] = useState<Blok[]>([]);
  const [selectedBlokIndex, setSelectedBlokIndex] = useState(0);
  
  // Loading states
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingSensorList, setIsLoadingSensorList] = useState(true);
  const [isLoadingBlokList, setIsLoadingBlokList] = useState(true);
  
  const segments: MetricType[] = [
    'Light',
    'Kelembaban Udara',
    'Cahaya',
    'Kelembaban Tanah',
  ];
  const [sensorType, setSensorType] = useState<MetricType>(segments[0]);

  // Range options untuk SegmentedControl
  const rangeOptions = ['7D', '1M', '1Y', 'Max'];
  const selectedRangeIndex = rangeOptions.indexOf(range);

  useEffect(() => {
    setIsLoadingBlokList(true);
    fetch('https://iot-vanili-api.permataindonesia.com/api/bloklist')
      .then(r => r.json())
      .then((list: Blok[]) => {
        setBlokList(list);
        setIsLoadingBlokList(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoadingBlokList(false);
      });
  }, []);

  useEffect(() => {
    setIsLoadingSensorList(true);
    fetch('https://iot-vanili-api.permataindonesia.com/api/sensorlist')
      .then(r => r.json())
      .then((list: Sensor[]) => {
        setSensorList(list);
        setIsLoadingSensorList(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoadingSensorList(false);
      });
  }, []);

  const uniqueSensors = useMemo(() => {
    const map = new Map<string, Sensor>();
    sensorList.forEach(s => {
      if (!map.has(s.esp_id)) map.set(s.esp_id, s);
    });
    return Array.from(map.values());
  }, [sensorList]);

  useEffect(() => {
    if (!sensorList.length || !blokList.length) return;

    const fetchData = async () => {
      setIsLoadingData(true);
      // Clear previous data immediately when starting to load
      setBarData([]);
      
      const baseURL = 'https://iot-vanili-api.permataindonesia.com';
      const endpoint =
        range === '1M' ? '/api/monthly-data' : '/api/weekly-data';

      const now = new Date();

      // Hitung endDate = kemarin 23:59:59.999
      const endDate = new Date(now);
      endDate.setDate(now.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);

      // Hitung startDate sesuai range
      const startDate = new Date(endDate);
      if (range === '7D') {
        startDate.setDate(endDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
      } else if (range === '1M') {
        startDate.setDate(endDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
      } else {
        startDate.setDate(endDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
      }

      const params = new URLSearchParams({
        startDate: formatMySQLDatetime(startDate),
        endDate: formatMySQLDatetime(endDate),
        keterangan_sensor: sensorType,
        esp_id: uniqueSensors[selectedSensorIndex].esp_id,
        nama_blok: blokList[selectedBlokIndex].nama_blok,
      });

      try {
        const resp = await fetch(`${baseURL}${endpoint}?${params.toString()}`);
        if (!resp.ok) throw new Error(await resp.text());
        const raw = await resp.json();

        const points: DataPoint[] = raw.map((item: any) => {
          if (range === '1M') {
            const dt = new Date(item.date + 'T14:00:00');
            return {value: item.value, date: formatLabel(dt, false)};
          } else {
            const dt = new Date(item.waktu);
            return {value: item.nilai_sensor, date: formatLabel(dt, true)};
          }
        });
        setBarData(points);
      } catch (err) {
        console.error('fetch data error:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [
    range,
    selectedSensorIndex,
    selectedBlokIndex,
    sensorList,
    blokList,
    sensorType,
    uniqueSensors,
  ]);

  function formatMySQLDatetime(d: Date) {
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
  }

  const xLabelsFromBar = useMemo<string[]>(() => {
    if (!barData.length) return [];

    const allDates = barData.map(pt => pt.date.split('\n')[0]);
    const total = allDates.length;

    if (range === '1M') {
      const idxFirst = 0;
      const idxQuarter = Math.floor(total * 0.25);
      const idxHalf = Math.floor(total * 0.5);
      const idxThreeQuarter = Math.floor(total * 0.75);
      const idxLast = total - 1;

      return [
        allDates[idxFirst],
        allDates[idxQuarter],
        allDates[idxHalf],
        allDates[idxLast],
      ];
    } else {
      const idxFirst = 0;
      const idxMid = Math.floor((total - 1) / 2);
      const idxLast = total - 1;
      return [allDates[idxFirst], allDates[idxMid], allDates[idxLast]];
    }
  }, [barData, range]);

  const chartConfig = useMemo(() => {
    const dataLength = barData.length;
    switch (range) {
      case '7D':
        return {
          spacing: CARD_WIDTH / (dataLength + 5.9),
          initialSpacing: 0,
          showVerticalLines: false,
          rulesLength: 309,
          chartWidth: 350.5,
        };
      case '1M':
        return {
          spacing: CARD_WIDTH / ((dataLength + 4) / 1),
          initialSpacing: 0,
          showVerticalLines: false,
          chartWidth: 350.5,
          rulesLength: 309,
        };
      case '1Y':
      case 'Max':
        return {
          spacing: CARD_WIDTH / ((dataLength - 1) / 4),
          initialSpacing: -55,
          chartWidth: 315.5,
          rulesLength: 316.5,
          showVerticalLines: false,
        };
      default:
        return {
          spacing: CARD_WIDTH / (dataLength - 1),
          initialSpacing: 0,
          showVerticalLines: false,
        };
    }
  }, [range, barData.length]);

  const zeroRule = {
    ruleType: 'horizontal',
    value: 0,
    color: '#ccc',
    strokeWidth: 1.5,
  };

  // Handle range change
  const handleRangeChange = (event: any) => {
    const newIndex = event.nativeEvent.selectedSegmentIndex;
    setRange(rangeOptions[newIndex] as '7D' | '1M' | '1Y' | 'Max');
  };

  // Handle blok change
  const handleBlokChange = (event: any) => {
    setSelectedBlokIndex(event.nativeEvent.selectedSegmentIndex);
  };

  // Handle sensor change
  const handleSensorChange = (event: any) => {
    setSelectedSensorIndex(event.nativeEvent.selectedSegmentIndex);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Light</Text>

      {/* Range Selector menggunakan SegmentedControl */}
      <View style={styles.rangeContainer}>
        <SegmentedControl
          values={rangeOptions}
          selectedIndex={selectedRangeIndex}
          onChange={handleRangeChange}
          style={styles.rangeSegmentedControl}
          fontStyle={{
            fontFamily: 'SpaceGrotesk-Regular',
            fontSize: 12,
            fontWeight: '400',
            color: '#666666',
          }}
          activeFontStyle={{
            fontFamily: 'SpaceGrotesk-Regular',
            fontSize: 12,
            fontWeight: '400',
            color: '#333333',
          }}
          backgroundColor="#f5f5f5"
          tintColor="#B4DC45"
        />
      </View>

      <View style={styles.selectorRow}>
        <View style={styles.selectorWrapper}>
          {isLoadingBlokList ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#B4DC45" />
              <Text style={styles.loadingText}>Loading blok...</Text>
            </View>
          ) : blokList.length > 0 ? (
            <SegmentedControl
              values={blokList.map(b => b.nama_blok)}
              selectedIndex={selectedBlokIndex}
              onChange={handleBlokChange}
              style={styles.selectorControl}
              fontStyle={{
                fontFamily: 'SpaceGrotesk-Regular',
                fontSize: 12,
              }}
              activeFontStyle={{
                fontFamily: 'SpaceGrotesk-Regular',
                fontSize: 12,
                fontWeight: '400',
              }}
            />
          ) : (
            <Text style={{color: 'gray', textAlign: 'center'}}>
              Tidak ada blok tersedia
            </Text>
          )}
        </View>

        <View style={styles.selectorWrapper}>
          {isLoadingSensorList ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#B4DC45" />
              <Text style={styles.loadingText}>Loading sensor...</Text>
            </View>
          ) : uniqueSensors.length > 0 ? (
            <SegmentedControl
              values={uniqueSensors.map(s => s.esp_id)}
              selectedIndex={selectedSensorIndex}
              onChange={handleSensorChange}
              style={styles.selectorControl}
              fontStyle={{
                fontFamily: 'SpaceGrotesk-Regular',
                fontSize: 12,
              }}
              activeFontStyle={{
                fontFamily: 'SpaceGrotesk-Regular',
                fontSize: 12,
                fontWeight: 'normal',
              }}
            />
          ) : (
            <Text style={{color: 'gray', textAlign: 'center'}}>
              Tidak ada sensor tersedia
            </Text>
          )}
        </View>
      </View>

      <View style={styles.chartWrapper}>
        {isLoadingData ? (
          <View style={styles.chartLoadingContainer}>
            <ActivityIndicator size="large" color="#B4DC45" />
            <Text style={styles.chartLoadingText}>Loading data...</Text>
          </View>
        ) : barData.length > 0 ? (
          <LineChart
            data={barData}
            width={chartConfig.chartWidth}
            height={220}
            initialSpacing={chartConfig.initialSpacing}
            spacing={chartConfig.spacing}
            areaChart
            curved={false}
            color="#B4DC45"
            hideDataPoints
            maxValue={25000}
            yAxisLabelTexts={['0', '5000', '15000', '20000', '25000']}
            yAxisTextStyle={styles.yAxisText}
            xAxisColor="transparent"
            yAxisColor="transparent"
            noOfSections={4}
            rulesType="solid"
            rulesLength={chartConfig.rulesLength}
            rulesColor="#eee"
            showVerticalLines={chartConfig.showVerticalLines}
            startFillColor="#B4DC45"
            endFillColor="#B4DC45"
            startOpacity={0.5}
            endOpacity={0}
            pointerConfig={{
              pointerStripHeight: 250,
              pointerStripColor: '#DEE2E7',
              pointerStripWidth: 1.5,
              strokeDashArray: [4, 4],
              pointerColor: '#B4DC45',
              radius: 6,
              activatePointersOnLongPress: false,
              activatePointersDelay: 150,
              stripOverPointer: false,
              autoAdjustPointerLabelPosition: true,
              pointerLabelWidth: 100,
              persistPointer: true,
              hidePointer1: false,
              hidePointer2: false,
              hidePointer3: false,
              hidePointer4: false,
              hidePointer5: false,
              pointerLabelComponent: items => {
                const {value, date, x, y} = items[0];
                const [d, t] = date.split('\n');
                const chartLeft = 0;
                const chartRight = chartConfig.chartWidth ?? 350;
                const tooltipWidth = range === '1M' ? 80 : 100;
                let tooltipLeft = x - tooltipWidth / 2;

                if (tooltipLeft < chartLeft) {
                  tooltipLeft = chartLeft;
                } else if (tooltipLeft + tooltipWidth > chartRight) {
                  tooltipLeft = chartRight - tooltipWidth;
                }

                return (
                  <View
                    style={[styles.tooltip, {left: tooltipLeft, top: y - 55}]}>
                    <Text style={styles.tooltipText}>{value}%</Text>
                    <View style={styles.tooltipDivider} />
                    <View style={styles.tooltipDateRow}>
                      <Text style={styles.tooltipSub}>{d}</Text>
                      <Text style={styles.tooltipSub}>{t}</Text>
                    </View>
                  </View>
                );
              },
            }}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Tidak ada data tersedia</Text>
          </View>
        )}
      </View>

      {/* X-axis Labels */}
      {!isLoadingData && barData.length > 0 && (
        <View style={styles.xLabels}>
          {xLabelsFromBar.map((lab, i) => (
            <Text key={i} style={styles.xLabel}>
              {lab}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: PADDING,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 14,
    top: 56,
    marginBottom: -2.5,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  rangeContainer: {
    marginBottom: 12,
    marginHorizontal: -6,
  },
  rangeSegmentedControl: {
    height: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  selectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -10,
  },
  selectorWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  selectorControl: {
    width: '100%',
    height: 25,
    backgroundColor: '#f0f0f0',
    borderRadius: 7,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 25,
    backgroundColor: '#f0f0f0',
    borderRadius: 7,
    paddingHorizontal: 8,
  },
  loadingText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  chartWrapper: {
    marginLeft: -10,
    width: CARD_WIDTH,
    top: 10,
  },
  chartLoadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  chartLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  yAxisText: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.04,
    color: '#999',
    marginLeft: -10,
  },
  tooltip: {
    position: 'absolute',
    flexDirection: 'row',
    backgroundColor: '#F0F8DA',
    padding: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  tooltipText: {
    color: 'black',
    fontWeight: '400',
    fontSize: 10,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  tooltipDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#DEE2E7',
    borderStyle: 'dashed',
    marginHorizontal: 4,
    alignSelf: 'center',
  },
  tooltipDateRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  tooltipSub: {
    color: '#93A071',
    fontSize: 10,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginHorizontal: 17.5,
    left: 13,
  },
  xLabel: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: '400',
    fontSize: 10,
  },
});