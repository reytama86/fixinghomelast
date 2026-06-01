import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { Sensor, Blok, RangeType, SensorType } from '@Types/Chart/Chart.data';
import styles from './styles';
import { fetchBlokList, fetchSensorList, useChartData } from '../../useChartData';

const { width: SCREEN_W } = Dimensions.get('window');
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
    fetchBlokList().then(setBlokList).catch(console.error);
  }, []);

  useEffect(() => {
    fetchSensorList().then(setSensorList).catch(console.error);
  }, []);

  // FIX: Deduplikasi sensor
  const uniqueSensors = useMemo(() => {
    const map = new Map<string, Sensor>();
    sensorList.forEach(s => {
      if (!map.has(s.esp_id)) map.set(s.esp_id, s);
    });
    return Array.from(map.values());
  }, [sensorList]);

  // FIX: Sort blokList sekali di sini pakai useMemo agar index selalu konsisten
  // dan tidak berubah-ubah saat re-render
  const sortedBlokList = useMemo(() => {
    return [...blokList].sort((a, b) => {
      const numA = parseInt(a.nama_blok.replace(/\D/g, ''), 10);
      const numB = parseInt(b.nama_blok.replace(/\D/g, ''), 10);
      return numA - numB;
    });
  }, [blokList]);

  // FIX: Clamp index agar tidak out of bounds saat list berubah
  const safeBlokIndex = Math.min(selectedBlokIndex, sortedBlokList.length - 1);
  const safeSensorIndex = Math.min(selectedSensorIndex, uniqueSensors.length - 1);

  const selectedSensor = uniqueSensors[safeSensorIndex];
  const selectedBlok = sortedBlokList[safeBlokIndex];

  const { data: barData, loading } = useChartData(
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
      return [
        allDates[0],
        allDates[Math.floor(total * 0.25)],
        allDates[Math.floor(total * 0.5)],
        allDates[total - 1],
      ];
    } else if (range === '1Y' || range === 'Max') {
      return [
        allDates[0],
        allDates[Math.floor(total * 0.33)],
        allDates[Math.floor(total * 0.66)],
        allDates[total - 1],
      ];
    } else {
      return [
        allDates[0],
        allDates[Math.floor((total - 1) / 2)],
        allDates[total - 1],
      ];
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
          chartWidth: 315.5,
          rulesLength: 309,
        };
    }
  }, [range, barData.length]);

  // FIX: Tampilkan loading state saat list belum siap
  // agar SegmentedControl tidak render dengan data kosong
  const isListReady = sortedBlokList.length > 0 && uniqueSensors.length > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      {/* Range selector */}
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

      {/* Blok & Sensor selector */}
      <View style={styles.selectorRow}>
        <View style={styles.selectorWrapper}>
          {sortedBlokList.length > 0 ? (
            <SegmentedControl
              values={sortedBlokList.map(b => b.nama_blok)}
              selectedIndex={safeBlokIndex}
              onChange={e =>
                setSelectedBlokIndex(e.nativeEvent.selectedSegmentIndex)
              }
              style={styles.selectorControl}
              fontStyle={{ fontFamily: 'SpaceGrotesk-Regular', fontSize: 12 }}
              activeFontStyle={{
                fontFamily: 'SpaceGrotesk-Regular',
                fontSize: 12,
                fontWeight: '400',
              }}
            />
          ) : (
            <Text style={{ color: 'gray', textAlign: 'center' }}>
              Memuat daftar blok…
            </Text>
          )}
        </View>

        <View style={styles.selectorWrapper}>
          {uniqueSensors.length > 0 ? (
            <SegmentedControl
              values={uniqueSensors.map(s => s.esp_id)}
              selectedIndex={safeSensorIndex}
              onChange={e =>
                setSelectedSensorIndex(e.nativeEvent.selectedSegmentIndex)
              }
              style={styles.selectorControl}
              fontStyle={{ fontFamily: 'SpaceGrotesk-Regular', fontSize: 12 }}
              activeFontStyle={{
                fontFamily: 'SpaceGrotesk-Regular',
                fontSize: 12,
                fontWeight: 'normal',
              }}
            />
          ) : (
            <Text style={{ color: 'gray', textAlign: 'center' }}>
              Memuat sensor…
            </Text>
          )}
        </View>
      </View>

      {/* Chart area */}
      <View style={styles.chartWrapper}>
        {/* FIX: Tampilkan loading overlay di atas chart saat fetching */}
        {loading && (
          <View
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
              backgroundColor: 'rgba(255,255,255,0.6)',
            }}>
            <ActivityIndicator size="small" color="#B4DC45" />
          </View>
        )}

        {/* FIX: Hanya render LineChart kalau ada data, 
            hindari crash saat barData kosong */}
        {barData.length > 0 ? (
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
              pointerLabelComponent: (items: any[]) => {
                if (!items || !items[0]) return null;
                const item = items[0];
                const value = item.value;
                const date = item.date || '';

                if (typeof value !== 'number' || isNaN(value)) return null;

                const [d, t] = date.split('\n');
                const isAboveThreshold = value > tooltipThreshold;

                return (
                  <View
                    style={[
                      styles.tooltip,
                      isAboveThreshold && { marginTop: 100 },
                    ]}>
                    {isAboveThreshold && <View style={styles.tooltipArrowUp} />}
                    {!isAboveThreshold && <View style={styles.tooltipArrowDown} />}
                    <Text style={styles.tooltipText}>
                      {formatValue(value)} {unit}
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
        ) : (
          !loading && (
            <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#aaa', fontSize: 13, fontFamily: 'SpaceGrotesk-Regular' }}>
                Tidak ada data
              </Text>
            </View>
          )
        )}
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