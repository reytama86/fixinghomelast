import React, { useState } from 'react';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const data = [
  { id: 1, sensor: 'Sensor A', value: 23.5, date: '2025-05-01' },
  { id: 2, sensor: 'Sensor B', value: 45.2, date: '2025-05-02' },
  { id: 3, sensor: 'Sensor A', value: 19.8, date: '2025-05-03' },
  { id: 4, sensor: 'Sensor C', value: 30.1, date: '2025-05-04' },
  { id: 5, sensor: 'Sensor B', value: 50.0, date: '2025-05-05' },
];

const Table = () => {
  const [filterDate, setFilterDate] = useState('');

  const filteredData = filterDate
    ? data.filter(item => item.date.includes(filterDate))
    : data;

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.sensor}</Text>
      <Text style={styles.cell}>{item.value}</Text>
      <Text style={styles.cell}>{item.date}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.headerTopBar}>
          <Text style={styles.headerTopBarText}>Tabel Sensor</Text>
        </View>

        {/* Date Filter Input */}
        <View style={styles.filterRow}>
          <TextInput
            style={styles.input}
            placeholder="Filter by date (YYYY-MM-DD)"
            value={filterDate}
            onChangeText={setFilterDate}
          />
          {filterDate ? (
            <TouchableOpacity onPress={() => setFilterDate('')}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Sensor</Text>
          <Text style={styles.heading}>Nilai</Text>
          <Text style={styles.heading}>Tanggal</Text>
        </View>

        {/* Data Rows */}
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  headerTopBar: {
    backgroundColor: '#6AB7E2', // Warna default
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 5,
    elevation: 2,
    marginBottom: 16,
  },
  headerTopBarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600', // Mengganti fontFamily.medium
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
    color: '#ff3333', // Warna default
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

export default Table;
