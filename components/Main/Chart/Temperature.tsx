import React, {useState, useMemo, useEffect} from 'react';
import {View, Text, Dimensions, StyleSheet} from 'react-native';
import {barDataItem, LineChart} from 'react-native-gifted-charts';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const {width: SCREEN_W} = Dimensions.get('window');
const PADDING = 16;
const CARD_WIDTH = SCREEN_W - PADDING * 2;

type DataPoint = {value: number; date: string};
type Sensor = {id_sensor: number; esp_id: string};
type Blok = {id_detail_blok: number; nama_blok: string; kondisi_blok: string};
type MetricType =
  | 'Temperature'
  | 'Kelembaban Udara'
  | 'Cahaya'
  | 'Kelembaban Tanah';
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

export default function Temperature() {
  const [barData, setBarData] = useState<MyBarDataItem[]>([]);
  const [range, setRange] = useState<'7D' | '1M' | '1Y' | 'Max'>('7D');
  const [sensorList, setSensorList] = useState<Sensor[]>([]);
  const [selectedSensorIndex, setSelectedSensorIndex] = useState(0);

  const [blokList, setBlokList] = useState<Blok[]>([]);
  const [selectedBlokIndex, setSelectedBlokIndex] = useState(0);
  const segments: MetricType[] = [
    'Temperature',
    'Kelembaban Udara',
    'Cahaya',
    'Kelembaban Tanah',
  ];
  const [sensorType, setSensorType] = useState<MetricType>(segments[0]);

  const rangeOptions = ['7D', '1M', '1Y', 'Max'];
  const selectedRangeIndex = rangeOptions.indexOf(range);

  useEffect(() => {
    fetch('https://iot-vanili-api.permataindonesia.com/api/bloklist')
      .then(r => r.json())
      .then((list: Blok[]) => setBlokList(list))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('https://iot-vanili-api.permataindonesia.com/api/sensorlist')
      .then(r => r.json())
      .then((list: Sensor[]) => setSensorList(list))
      .catch(console.error);
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

    const abortController = new AbortController();

    const fetchData = async () => {
      const baseURL = 'https://iot-vanili-api.permataindonesia.com';
      let endpoint = '';
      let params: URLSearchParams;

      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(now.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);

      if (range === '1Y') {
        endpoint = '/api/yearly-data';
        params = new URLSearchParams({
          keterangan_sensor: sensorType,
          esp_id: uniqueSensors[selectedSensorIndex].esp_id,
          nama_blok: blokList[selectedBlokIndex].nama_blok,
        });
      } else if (range === 'Max') {
        endpoint = '/api/max-data';
        params = new URLSearchParams({
          keterangan_sensor: sensorType,
          esp_id: uniqueSensors[selectedSensorIndex].esp_id,
          nama_blok: blokList[selectedBlokIndex].nama_blok,
        });
      } else {
        endpoint = range === '1M' ? '/api/monthly-data' : '/api/weekly-data';

        const startDate = new Date(endDate);
        if (range === '7D') {
          startDate.setDate(endDate.getDate() - 6);
          startDate.setHours(0, 0, 0, 0);
        } else if (range === '1M') {
          startDate.setDate(endDate.getDate() - 29);
          startDate.setHours(0, 0, 0, 0);
        }

        params = new URLSearchParams({
          startDate: formatMySQLDatetime(startDate),
          endDate: formatMySQLDatetime(endDate),
          keterangan_sensor: sensorType,
          esp_id: uniqueSensors[selectedSensorIndex].esp_id,
          nama_blok: blokList[selectedBlokIndex].nama_blok,
        });
      }

      try {
        const resp = await fetch(`${baseURL}${endpoint}?${params.toString()}`, {
          signal: abortController.signal,
        });

        if (!resp.ok) throw new Error(await resp.text());
        const raw = await resp.json();

        if (abortController.signal.aborted) return;

        let points: DataPoint[] = [];

        if (range === '1Y') {
          points = raw.map((item: any) => {
            const [year, month] = item.periode.split('-');
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
            const monthName = monthNames[parseInt(month) - 1];
            return {
              value: item.median_value,
              date: `${monthName} ${year}`,
            };
          });
        } else if (range === 'Max') {
          points = raw.map((item: any) => {
            const startDate = new Date(item.start_date);
            return {
              value: item.median_value,
              date: formatLabel(startDate, false),
            };
          });
        } else if (range === '1M') {
          points = raw.map((item: any) => {
            const dt = new Date(item.date + 'T14:00:00');
            return {value: item.value, date: formatLabel(dt, false)};
          });
        } else {
          points = raw.map((item: any) => {
            const dt = new Date(item.waktu);
            return {value: item.nilai_sensor, date: formatLabel(dt, true)};
          });
        }

        setBarData(points);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('fetch data error:', err);
        }
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
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
    } else if (range === '1Y' || range === 'Max') {
      const idxFirst = 0;
      const idxQuarter = Math.floor(total * 0.33);
      const idxHalf = Math.floor(total * 0.66);
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
          spacing: CARD_WIDTH / (dataLength + 9),
          initialSpacing: 0,
          showVerticalLines: false,
          rulesLength: 309,
          chartWidth: 315.5,
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

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Temperature</Text>

      <View style={styles.rangeContainer}>
        <SegmentedControl
          values={rangeOptions}
          selectedIndex={selectedRangeIndex}
          onChange={event => {
            const newIndex = event.nativeEvent.selectedSegmentIndex;
            setRange(rangeOptions[newIndex] as '7D' | '1M' | '1Y' | 'Max');
          }}
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
          {blokList.length > 0 ? (
            <SegmentedControl
              values={blokList.map(b => b.nama_blok)}
              selectedIndex={selectedBlokIndex}
              onChange={e =>
                setSelectedBlokIndex(e.nativeEvent.selectedSegmentIndex)
              }
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
              Memuat daftar blok…
            </Text>
          )}
        </View>

        <View style={styles.selectorWrapper}>
          {uniqueSensors.length > 0 ? (
            <SegmentedControl
              values={uniqueSensors.map(s => s.esp_id)}
              selectedIndex={selectedSensorIndex}
              onChange={e =>
                setSelectedSensorIndex(e.nativeEvent.selectedSegmentIndex)
              }
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
              Memuat sensor…
            </Text>
          )}
        </View>
      </View>

      <View style={styles.chartWrapper}>
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
          maxValue={80}
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
            pointerStripHeight: 270,
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

            persistPointer: false,
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
              const tooltipHeight = 40;

              let tooltipLeft = x - tooltipWidth / 2;
              if (tooltipLeft < chartLeft) {
                tooltipLeft = chartLeft;
              } else if (tooltipLeft + tooltipWidth > chartRight) {
                tooltipLeft = chartRight - tooltipWidth;
              }

              let tooltipTop = y - 55;
              let transformY = 0;

              if (value > 55) {
                transformY = 110;
              }

              return (
                <View
                  style={[
                    styles.tooltip,
                    {
                      left: tooltipLeft,
                      top: tooltipTop,
                      transform: [{translateY: transformY}],
                      ...(value > 55 && {
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                      }),
                    },
                  ]}>
                  {value > 55 && <View style={styles.tooltipArrowUp} />}
                  {value <= 55 && <View style={styles.tooltipArrowDown} />}
                  <Text style={styles.tooltipText}>{value}°</Text>
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
      </View>

      <View style={styles.xLabels}>
        {xLabelsFromBar.map((lab, i) => (
          <Text key={i} style={styles.xLabel}>
            {lab}
          </Text>
        ))}
      </View>
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
  chartWrapper: {
    marginLeft: -10,
    width: CARD_WIDTH,
    top: 10,
  },
  yAxisText: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: '400',
    fontSize: 12,
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
  tooltipArrowUp: {
    position: 'absolute',
    top: -4,
    left: '50%',
    marginLeft: -3,
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F0F8DA',
  },
  tooltipArrowDown: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    marginLeft: -3,
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#F0F8DA',
  },
});
