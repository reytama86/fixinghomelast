import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import Humidity from './Humidity';

const {width: SCREEN_W} = Dimensions.get('window');
const PADDING = 16;
const CARD_WIDTH = SCREEN_W - PADDING * 2;

type DataPoint = {value: number; date: string};

// Helper to format date and time
function formatLabel(dateObj: Date, showTime = false): string {
  const day = dateObj.getDate();
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = monthNames[dateObj.getMonth()];
  if (!showTime) return `${day} ${month}`;
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  return `${day} ${month}\n${hours}:${minutes}`;
}

export default function SoilPh() {
  const [range, setRange] = useState<'7D' | '1M' | '1Y' | 'Max'>('7D');

  // Data generation
  const data7d = useMemo<DataPoint[]>(() => {
    const times = [0, 4, 8, 12, 16, 20];
    const baseValues = [2, 3, 4, 5, 5, 7];
    const points: DataPoint[] = [];
    const today = new Date();
    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const dateBase = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - dayOffset,
      );
      times.forEach((hour, idx) => {
        const dt = new Date(dateBase);
        dt.setHours(hour);
        dt.setMinutes(0);
        const variation = Math.floor(Math.random() * 5) - 1;
        const value = Math.max(0, Math.min(40, baseValues[idx] + variation));
        points.push({value, date: formatLabel(dt, true)});
      });
    }
    return points;
  }, []);

  const data1m = useMemo<DataPoint[]>(() => {
    const pts: DataPoint[] = [];
    const today = new Date();
    // for (let i = 29; i >= 0; i--) {
    //   const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    //   const val = 20 + ((d.getDate() * 3) % 15);
    //   pts.push({ value: val, date: formatLabel(d) });
    // }
    for (let i = 29; i >= 0; i--) {
      const d = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - i,
      );
      const dayIdx = d.getDate();
      const sinus = Math.sin((dayIdx / 30) * Math.PI * 2) * 10;
      const noise = (Math.random() - 0.5) * 10;
      const val = Math.max(0, Math.min(40, 25 + sinus + noise));
      pts.push({value: Math.round(val), date: formatLabel(d)});
    }
    return pts;
  }, []);
  const data1y = data1m;
  const dataMax = data1m;

  const dataMap = {'7D': data7d, '1M': data1m, '1Y': data1y, Max: dataMax};
  const data = dataMap[range];
  const chartConfig = useMemo(() => {
    switch (range) {
      case '7D':
        return {
          spacing: CARD_WIDTH / (data.length + 6),
          initialSpacing: 0,
          showVerticalLines: false,
          xLabelsKeys: ['first', 'mid', 'last'],
          rulesLength: 315.5,
          chartWidth: 350.5,
        };
      case '1M':
        return {
          spacing: CARD_WIDTH / ((data.length + 4) / 1),
          initialSpacing: 0,
          showVerticalLines: false,
          xLabelsKeys: ['first', 'fourteen', 'last'],
          chartWidth: 350.5,
          rulesLength: 316.5,
        };
      case '1Y':
      case 'Max':
        return {
          spacing: CARD_WIDTH / ((data.length - 1) / 4),
          initialSpacing: -55,
          chartWidth: 315.5,
          rulesLength: 316.5,
          showVerticalLines: false,
          xLabelsKeys: ['first', 'mid', 'last'],
        };
      default:
        return {
          spacing: CARD_WIDTH / (data.length - 1),
          initialSpacing: 0,
          showVerticalLines: false,
          xLabelsKeys: ['first', 'mid', 'last'],
        };
    }
  }, [range, data.length]);

  // Mapping posisi label
  const idxMap: Record<string, number> = {
    first: 0,
    seven: Math.floor((data.length * 1) / 4),
    fourteen: Math.floor((data.length * 2) / 4),
    twentyOne: Math.floor((data.length * 3) / 4),
    mid: Math.floor((data.length - 1) / 2),
    last: data.length - 1,
  };

  const xLabels = chartConfig.xLabelsKeys.map(key => {
    const raw = data[idxMap[key]].date;
    return raw.split('\n')[0];
  });

  const zeroRule = {
    ruleType: 'horizontal',
    value: 0,
    color: '#ccc',
    strokeWidth: 1.5,
  };

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.title}>Soil PH</Text>
        <View style={styles.wraperSegment}>
          <View style={styles.segmentContainer}>
            {['7D', '1M', '1Y', 'Max'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.segment, range === tab && styles.segmentActive]}
                onPress={() => setRange(tab as any)}>
                <Text
                  style={[
                    styles.segmentText,
                    range === tab && styles.segmentTextActive,
                  ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartWrapper}>
          <LineChart
            data={data}
            width={chartConfig.chartWidth}
            height={220}
            initialSpacing={chartConfig.initialSpacing}
            spacing={chartConfig.spacing}
            areaChart
            curved={false}
            color="#B4DC45"
            hideDataPoints
            yAxisLabelTexts={['0', '3', '5', '7', '9']}
            yAxisTextStyle={styles.yAxisText}
            xAxisColor="transparent"
            yAxisColor="transparent"
            noOfSections={4}
            // minValue={0}
            // maxValue={9}
            rulesType="solid"
            rulesLength={chartConfig.rulesLength}
            rulesColor="#eee"
            // extraRules={[zeroRule]}
            showVerticalLines={chartConfig.showVerticalLines}
            // useGradient
            startFillColor="#B4DC45"
            endFillColor="#B4DC45"
            startOpacity={0.5}
            endOpacity={0}
            pointerConfig={{
              pointerStripHeight: 230,
              pointerStripColor: '#DEE2E7',
              pointerStripWidth: 1,
            //   pointerStripType: 'dashed',
              strokeDashArray: [4, 4],
              pointerColor: '#B4DC45',
              activatePointersOnLongPress: true,
              stripOverPointer: false, 
              autoAdjustPointerLabelPosition: true, 
              pointerLabelWidth: 100, 
              pointerLabelComponent: items => {
                const { value, date, x, y } = items[0];
                const [d, t] = date.split('\n');
                const chartLeft = 0; 
                const chartWidth = chartConfig.chartWidth;
                const chartRight = chartLeft + 20;
                const tooltipWidth = 100;
                let tooltipLeft = x - tooltipWidth / 2;
                if (tooltipLeft < chartLeft) {
                  tooltipLeft = chartLeft;
                } else if (tooltipLeft + tooltipWidth > chartRight) {
                  tooltipLeft = chartRight - tooltipWidth;
                }
                return (
                  <View style={[styles.tooltip, { left: tooltipLeft, top: y - 55 }]}>
                    <Text style={styles.tooltipText}>{value} pH</Text>
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
          {xLabels.map((lab, i) => (
            <Text key={i} style={styles.xLabel}>
              {lab}
            </Text>
          ))}
        </View>
      </View>
    </>
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
    elevation: 3,
    top: 56,
    marginBottom: -2.5,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
    fontFamily: 'Space Grotesk',
  },
  wraperSegment: {
    paddingHorizontal: 8,
    width: 357.5,
    left: -10,
    marginBottom: 12,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: '#B4DC45',
    borderRadius: 6,
  },
  segmentText: {
    color: '#555',
    fontSize: 12,
    fontWeight: 400,
    fontFamily: 'Space Grotesk',
  },
  segmentTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  chartWrapper: {
    marginLeft: -10,
    width: CARD_WIDTH,
    top: 10,
  },
  yAxisText: {
    fontFamily: 'Space Grotesk',
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
    width: 105,
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
    fontFamily: 'Space Grotesk',
    fontWeight: '400',
    fontSize: 10,
  },
});
