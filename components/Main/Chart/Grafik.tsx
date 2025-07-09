import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Button, ScrollView } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { BarChart, barDataItem } from 'react-native-gifted-charts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { processWeeklyData, MetricType } from './ChartQuery';
import { FlatList, TextInput } from 'react-native';

// Sensor chart types
type Sensor = { id_sensor: number; esp_id: string };
type Blok = { id_detail_blok: number; nama_blok: string; kondisi_blok: string };

type TableItem = { id: number; sensor: string; value: number; date: string };

const sampleData: TableItem[] = [
  { id: 1, sensor: 'Sensor A', value: 23.5, date: '2025-05-01' },
  { id: 2, sensor: 'Sensor B', value: 45.2, date: '2025-05-02' },
  { id: 3, sensor: 'Sensor A', value: 19.8, date: '2025-05-03' },
  { id: 4, sensor: 'Sensor C', value: 30.1, date: '2025-05-04' },
  { id: 5, sensor: 'Sensor B', value: 50.0, date: '2025-05-05' },
];

export default function Grafik() {
  // Chart state
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
  const [transactionType, setTransactionType] = React.useState<MetricType>(segments[0]);
  const [totalAmount, setTotalAmount] = React.useState(0);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState<number>(0);

  // Table state
  const [filterDate, setFilterDate] = React.useState('');
  const filteredData = filterDate
    ? sampleData.filter(item => item.date.includes(filterDate))
    : sampleData;

  // Fetch sensor & blok
  React.useEffect(() => {
    fetch('http://localhost:4646/api/sensorlist')
      .then(r => r.json())
      .then((list: Sensor[]) => setSensorList(list))
      .catch(console.error);
  }, []);
  React.useEffect(() => {
    fetch('http://localhost:4646/api/bloklist')
      .then(r => r.json())
      .then((list: Blok[]) => setBlokList(list))
      .catch(console.error);
  }, []);

  // Weekly data fetch
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

  const renderItem = ({ item }: { item: TableItem }) => (
    <View style={tableStyles.row}>
      <Text style={tableStyles.cell}>{item.sensor}</Text>
      <Text style={tableStyles.cell}>{item.value}</Text>
      <Text style={tableStyles.cell}>{item.date}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
        {/* Chart Section */}
        <View style={styles.container}>
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
          <SegmentedControl
            values={blokList.map(b => b.nama_blok)}
            selectedIndex={selectedBlokIndex}
            onChange={e =>
              setSelectedBlokIndex(e.nativeEvent.selectedSegmentIndex)
            }
            style={styles.segment}
          />
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
          <Text style={styles.totalText}>{totalAmount.toFixed(2)}</Text>
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
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Nilai: {selectedValue.toFixed(2)}
                </Text>
                <Button title="Tutup" onPress={() => setModalVisible(false)} />
              </View>
            </View>
          </Modal>
        </View>

        {/* Table Section */}
        <View style={tableStyles.container}>
          <View style={tableStyles.headerTopBar}>
            <Text style={tableStyles.headerTopBarText}>Tabel Sensor</Text>
          </View>
          <View style={tableStyles.filterRow}>
            <TextInput
              style={tableStyles.input}
              placeholder="Filter by date (YYYY-MM-DD)"
              value={filterDate}
              onChangeText={setFilterDate}
            />
            {filterDate ? (
              <TouchableOpacity onPress={() => setFilterDate('')}>
                <Text style={tableStyles.clearText}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={tableStyles.headerRow}>
            <Text style={tableStyles.heading}>Sensor</Text>
            <Text style={tableStyles.heading}>Nilai</Text>
            <Text style={tableStyles.heading}>Tanggal</Text>
          </View>
          <FlatList
            data={filteredData}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={tableStyles.separator} />} 
          />
        </View>
    </SafeAreaView>
  );
}

// Chart styles (unchanged)
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

// Table styles
const tableStyles = StyleSheet.create({
  container: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  headerTopBar: {
    backgroundColor: '#6AB7E2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 5,
    elevation: 2,
    marginBottom: 16,
  },
  headerTopBarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
  },
  clearText: {
    color: '#ff3333',
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  heading: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  cell: {
    flex: 1,
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});
