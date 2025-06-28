// SummaryChart.tsx
import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
} from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { BarChart, barDataItem } from 'react-native-gifted-charts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { processWeeklyData, MetricType } from './ChartQuery';

type Sensor = { id_sensor: number; esp_id: string };
type Blok = { id_detail_blok: number; nama_blok: string; kondisi_blok: string };

export default function SummaryChart() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [barData, setBarData] = React.useState<barDataItem[]>([]);
  const [chartKey, setChartKey] = React.useState(0);

  const [sensorList, setSensorList] = React.useState<Sensor[]>([]);
  const [selectedSensorIndex, setSelectedSensorIndex] = React.useState(0);

  const [blokList, setBlokList] = React.useState<Blok[]>([]);
  const [selectedBlokIndex, setSelectedBlokIndex] = React.useState(0);
  
  const segments: MetricType[] = [
    'Suhu Udara',
    'Kelembaban Udara',
    'Cahaya',
    'Kelembaban Tanah',
  ];
  const [transactionType, setTransactionType] =
    React.useState<MetricType>(segments[0]);
  const [totalAmount, setTotalAmount] = React.useState(0);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState<number>(0);

  // Fetch sensor list
  React.useEffect(() => {
    fetch('http://localhost:4646/api/sensorlist')
      .then(r => r.json())
      .then((list: Sensor[]) => setSensorList(list))
      .catch(console.error);
  }, []);

  // Fetch blok list
  React.useEffect(() => {
    fetch('http://localhost:4646/api/bloklist')
      .then(r => r.json())
      .then((list: Blok[]) => setBlokList(list))
      .catch(console.error);
  }, []);

  // Fetch weekly data setiap kali dependensi berubah
  React.useEffect(() => {
    if (!sensorList.length || !blokList.length) return;

    const fetchWeekly = async () => {
      const espId = sensorList[selectedSensorIndex].esp_id;
      const blokName = blokList[selectedBlokIndex].nama_blok;
      const { startDate, endDate } = getWeekRange(currentDate);
      const qs = new URLSearchParams({
        startDate: formatMySQLDatetime(startDate),
        endDate: formatMySQLDatetime(endDate),
        keterangan_sensor: transactionType,
        esp_id: espId,
        nama_blok: blokName,
      });

      try {
        const resp = await fetch(
          `http://localhost:4646/api/weekly-data?${qs.toString()}`
        );
        if (!resp.ok) throw new Error(await resp.text());
        const json: Array<{ dayOfWeek: number; total: number }> =
          await resp.json();
        const processed = processWeeklyData(json, transactionType);
        setBarData(processed);
        setTotalAmount(
          processed.reduce((sum, bar) => sum + (bar.value ?? 0), 0)
        );
        setChartKey(k => k + 1);
      } catch (e) {
        console.error('Fetch weekly-data error:', e);
      }
    };

    fetchWeekly();
  }, [
    currentDate,
    transactionType,
    selectedSensorIndex,
    sensorList,
    selectedBlokIndex,
    blokList,
  ]);

  // Hitung awal & akhir minggu
  const getWeekRange = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const start = new Date(d.setDate(d.getDate() - day));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end };
  };

  const formatMySQLDatetime = (d: Date) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
  const handlePreviousWeek = () =>
    setCurrentDate(d => new Date(d.setDate(d.getDate() - 7)));
  const handleNextWeek = () =>
    setCurrentDate(d => new Date(d.setDate(d.getDate() + 7)));
  const handleBarPress = (item: barDataItem) => {
    setSelectedValue(item.value ?? 0);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header & Navigasi Minggu */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handlePreviousWeek}>
            <Ionicons name="chevron-back-circle" size={32} color="gray" />
          </TouchableOpacity>
          <Text style={styles.headerText}>
            {formatMySQLDatetime(getWeekRange(currentDate).startDate).slice(
              5,
              10
            )}
            {' – '}
            {formatMySQLDatetime(getWeekRange(currentDate).endDate).slice(
              5,
              10
            )}
          </Text>
          <TouchableOpacity onPress={handleNextWeek}>
            <Ionicons name="chevron-forward-circle" size={32} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Pilihan Blok */}
        <SegmentedControl
          values={blokList.map(b => b.nama_blok)}
          selectedIndex={selectedBlokIndex}
          onChange={e =>
            setSelectedBlokIndex(e.nativeEvent.selectedSegmentIndex)
          }
          style={styles.segment}
        />

        {/* Controls: Metric & Sensor */}
        <View style={styles.controlsRow}>
          <SegmentedControl
            values={segments}
            selectedIndex={segments.findIndex(v => v === transactionType)}
            onChange={e =>
              setTransactionType(segments[e.nativeEvent.selectedSegmentIndex])
            }
            style={styles.segment}
          />
          <SegmentedControl
            values={sensorList.map(s => s.esp_id)}
            selectedIndex={selectedSensorIndex}
            onChange={e =>
              setSelectedSensorIndex(e.nativeEvent.selectedSegmentIndex)
            }
            style={styles.segment}
          />
        </View>

        {/* Total */}
        <Text style={styles.totalText}>{totalAmount.toFixed(2)}</Text>

        {/* BarChart dengan onPress sederhana */}
        <BarChart
          key={chartKey}
          data={barData}
          onPress={handleBarPress}
          barWidth={18}
          height={200}
          width={320}
          spacing={16}
          noOfSections={4}
          showGradient
          yAxisThickness={0}
          xAxisThickness={0}
          xAxisLabelsVerticalShift={2}
          xAxisLabelTextStyle={{ color: 'gray' }}
          yAxisTextStyle={{ color: 'gray' }}
          isAnimated
          animationDuration={300}
        />

        {/* Modal hanya menampilkan nilai */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nilai: {selectedValue.toFixed(2)}</Text>
              <Button title="Tutup" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerText: { fontSize: 18, fontWeight: '700' },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  segment: { width: 150, marginBottom: 12 },
  totalText: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 220,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
});
