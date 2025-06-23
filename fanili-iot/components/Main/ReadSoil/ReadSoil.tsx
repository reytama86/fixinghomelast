// ReadSoil.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Polyfill Buffer untuk base64 decoding
import { Buffer } from 'buffer';
(global as any).Buffer = Buffer;

// UUID service dan characteristic contoh
const SOIL_SERVICE_UUID = 'SERVICE_UUID_SOIL';
const CHAR_UUIDS: { [key: string]: string } = {
  PH: 'CHAR_UUID_PH',
  EC: 'CHAR_UUID_EC',
  MOISTURE: 'CHAR_UUID_MOISTURE',
  TEMPERATURE: 'CHAR_UUID_TEMPERATURE',
  TDS: 'CHAR_UUID_TDS',
  SALINITY: 'CHAR_UUID_SALINITY',
  ORP: 'CHAR_UUID_ORP',
};

const SENSOR_KEYS = [
  'Temperature Soil',
  'Humidity Soil',
  'Conductivity',
  'PH',
  'N',
  'P',
  'K',
] as const;

type SensorKey = typeof SENSOR_KEYS[number];

interface SensorItem {
  key: SensorKey;
  value: string | null;
  status: 'idle' | 'reading' | 'done' | 'error';
}

export default function ReadSoil() {
  const [manager] = useState(() => new BleManager());
  const [device, setDevice] = useState<Device | null>(null);
  const [sensors, setSensors] = useState<SensorItem[]>(
    SENSOR_KEYS.map(k => ({ key: k, value: null, status: 'idle' }))
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [readingAll, setReadingAll] = useState(false);

  // Scan dan koneksi ke ESP32
  useEffect(() => {
    const subscription: Subscription = manager.onStateChange(state => {
      if (state === 'PoweredOn') {
        manager.startDeviceScan(null, null, (error, scanned) => {
          if (error) {
            console.warn(error);
            return;
          }
          if (scanned && scanned.name?.includes('ESP32_SOIL')) {
            manager.stopDeviceScan();
            scanned
              .connect()
              .then(d => d.discoverAllServicesAndCharacteristics())
              .then(d => setDevice(d))
              .catch(console.warn);
          }
        });
      }
    }, true);

    return () => {
      subscription.remove();
      manager.stopDeviceScan();
      manager.destroy();
    };
  }, [manager]);

  // Fungsi baca sensor satu-per-satu
  const readSensors = () => {
    if (!device) {
      Alert.alert('Error', 'Perangkat ESP32 belum terhubung');
      return;
    }

    setReadingAll(true);

    // define async fn inside
    const doRead = async () => {
      const updated = sensors.map(item => ({ ...item }));

      for (let i = 0; i < updated.length; i++) {
        updated[i].status = 'reading';
        setSensors([...updated]);

        try {
          const char = await device.readCharacteristicForService(
            SOIL_SERVICE_UUID,
            CHAR_UUIDS[updated[i].key.toUpperCase()]
          );
          const raw = Buffer.from(char.value ?? '', 'base64').toString();
          updated[i].value = raw;
          updated[i].status = 'done';
        } catch (e) {
          console.warn(e);
          updated[i].status = 'error';
          updated[i].value = null;
        }

        setSensors([...updated]);
        await new Promise(res => setTimeout(res, 300));
      }

      setReadingAll(false);
      setModalVisible(true);
    };

    doRead();
  };

  const renderItem = ({ item }: { item: SensorItem }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemKey}>{item.key}</Text>
      {item.status === 'reading' && <ActivityIndicator size="small" />}
      {item.status === 'done' && (
        <Text style={styles.itemValue}>{item.value}</Text>
      )}
      {item.status === 'error' && (
        <Ionicons name="warning-outline" size={20} color="#e74c3c" />
      )}
      {item.status === 'idle' && <Text style={styles.itemIdle}>–</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Soil 7‑in‑1 Reader</Text>

      <FlatList
        data={sensors}
        keyExtractor={i => i.key}
        renderItem={renderItem}
        style={styles.list}
      />

      <TouchableOpacity
        style={[styles.button, readingAll && styles.buttonDisabled]}
        onPress={readSensors}
        disabled={readingAll}
      >
        <Text style={styles.buttonText}>
          {readingAll ? 'Membaca...' : 'Baca Sensor'}
        </Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Ionicons name="checkmark-circle" size={64} color="#27ae60" />
            <Text style={styles.modalTitle}>Berhasil Baca Data</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#34495E', marginBottom: 16 },
  list: { flexGrow: 0, marginBottom: 32 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#ECEFF1' },
  itemKey: { flex: 1, fontSize: 16, color: '#2C3E50' },
  itemValue: { fontSize: 16, color: '#1ABC9C', fontWeight: '600', marginRight: 8 },
  itemIdle: { fontSize: 16, color: '#95A5A6', marginRight: 8 },
  button: { backgroundColor: '#8E44AD', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#D2B4DE' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 24, alignItems: 'center', width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#2C3E50', marginVertical: 16 },
  modalButton: { backgroundColor: '#27AE60', borderRadius: 6, paddingVertical: 10, paddingHorizontal: 24 },
  modalButtonText: { color: '#FFF', fontWeight: '600' },
});
