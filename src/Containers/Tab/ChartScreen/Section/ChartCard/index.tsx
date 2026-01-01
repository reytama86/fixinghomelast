import React, {useState, useMemo, useEffect} from 'react';
import {View, Text, Dimensions} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import {useChartData} from '../../useChartData';
import {Sensor, Blok, RangeType, SensorType} from '@Types/Chart/Chart.data';
import styles from './styles';

const {width: SCREEN_W} = Dimensions.get('window');
const PADDING = 16;
const CARD_WIDTH = SCREEN_W - PADDING * 2;

interface ChartCardProps {
  title: string;
  sensorType: SensorType;
  maxValue: number;
  unit: string;
  tooltipThreshold: number;
  formatValue?: (value: number) => string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  sensorType,
  maxValue,
  unit,
  tooltipThreshold,
  formatValue = val => val.toString(),
}) => {
  const [range, setRange] = useState<RangeType>('7D');
  const [sensorList, setSensorList] = useState<Sensor[]>([]);
  const [selectedSensorIndex, setSelectedSensorIndex] = useState(0);
  const [blokList, setBlokList] = useState<Blok[]>([]);
  const [selectedBlokIndex, setSelectedBlokIndex] = useState(0);

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

  const selectedSensor = uniqueSensors[selectedSensorIndex];
  const selectedBlok = blokList[selectedBlokIndex];

  const {data: barData} = useChartData(
    sensorType,
    range,
    selectedSensor,
    selectedBlok,
  );

  const xLabelsFromBar = useMemo<string[]>(() => {
    if (!barData.length) return [];

    const allDates = barData.map(pt => pt.date.split('\n')[0]);
    const total = allDates.length;

    if (range === '1M') {
      const idxFirst = 0;
      const idxQuarter = Math.floor(total * 0.25);
      const idxHalf = Math.floor(total * 0.5);
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

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.rangeContainer}>
        <SegmentedControl
          values={rangeOptions}
          selectedIndex={selectedRangeIndex}
          onChange={event => {
            const newIndex = event.nativeEvent.selectedSegmentIndex;
            setRange(rangeOptions[newIndex] as RangeType);
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
          maxValue={maxValue}
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
              if (!items || !items[0]) return null;

              const item = items[0];
              const value = item.value;
              const date = item.date || '';

              if (typeof value !== 'number' || isNaN(value)) {
                console.log('❌ Invalid value:', value);
                return null;
              }

              const [d, t] = date.split('\n');

              return (
                <View style={styles.tooltip}>
                  {value > tooltipThreshold && (
                    <View style={styles.tooltipArrowUp} />
                  )}
                  {value <= tooltipThreshold && (
                    <View style={styles.tooltipArrowDown} />
                  )}
                  <Text style={styles.tooltipText}>
                    {formatValue(value)}
                    {unit}
                  </Text>
                  <View style={styles.tooltipDivider} />
                  <View style={styles.tooltipDateRow}>
                    <Text style={styles.tooltipSub}>{d || ''}</Text>
                    <Text style={styles.tooltipSub}>{t || ''}</Text>
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
};
