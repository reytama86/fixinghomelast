/**
 * @format
 */
import {Buffer} from 'buffer';
global.Buffer = Buffer;

// Polyfill untuk window.location (diperlukan oleh paho-mqtt)
declare var window: any;
if (typeof window === 'undefined') {
  global.window = {} as any;
}
if (!window.location) {
  window.location = {protocol: 'file:'} as any;
}

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Pressable,
  Animated,
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as Paho from 'paho-mqtt';
import {io} from 'socket.io-client';
import SensorCarousel, {SensorItem} from '../src/SensorCarousel';
import DateTimePicker, {DateTimePickerEvent, Event} from '@react-native-community/datetimepicker';
import Card from './ui/Card';
// Import ikon (bisa menggunakan react-native-vector-icons ataupun FontAwesome)
import {faCirclePlus} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ScheduleItem {
  id: string;
  time: string;
}

interface HomeProps {
  defaultDate?: string | Date;
  onDataChange?: (data: any) => void;
}

const MAX_SCHEDULES = 6;

const Rumah: React.FC<HomeProps> = props => {
  const {defaultDate} = props;

  // Sensor states
  const [temperature, setTemperature] = useState<number>(0);
  const [humidity, setHumidity] = useState<number>(0);
  const [light, setLight] = useState<number>(0);
  const [soil, setSoil] = useState<number>(0);

  // Slider states
  const [tempMin, setTempMin] = useState<number>(0);
  const [tempMax, setTempMax] = useState<number>(0);
  const [soilMin, setSoilMin] = useState<number>(0);
  const [soilMax, setSoilMax] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false); // Penanda selesai load dari AsyncStorage
  const hasInitData = useRef(false);
  const publishRef   = useRef<NodeJS.Timeout|null>(null);
  const isBrokerUpdate = useRef<boolean>(false);


  // Animated values untuk zoom in/zoom out
  const tempMaxScale = useRef(new Animated.Value(1)).current;
  const soilMinScale = useRef(new Animated.Value(1)).current;

  // Fungsi animasi zoom in & out
  const zoomIn = (scale: Animated.Value) => {
    Animated.timing(scale, {
      toValue: 1.1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const zoomOut = (scale: Animated.Value) => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Main time state
  const [date, setDate] = useState<Date>(new Date());
  // Ref untuk menyimpan nilai sementara di modal (iOS/Android)
  const tempTimeRef = useRef<Date>(new Date());
  // State modal time picker
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);

  // State jadwal penyiraman
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // onChange DateTimePicker
  // const onChange = (event: Event, selectedDate?: Date) => {
  //   if (selectedDate) {
  //     tempTimeRef.current = new Date(selectedDate.getTime());
  //   }
  // };

  const onChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (event.type === 'set' && selectedDate) {
      tempTimeRef.current = selectedDate;
    }
    // jangan memanggil setShowTimeModal(false) di sini
  };
  
  // Render DateTimePicker sebagai modal
  const renderTimePickerModal = () => {
    // Tanggal acuan sehingga hanya jam & menit yang dipilih
    
    
    const anchorDate = new Date(1970, 0, 1);
    const minTime = new Date(anchorDate);
    minTime.setHours(0, 0, 0, 0);
    const maxTime = new Date(anchorDate);
    maxTime.setHours(23, 59, 59, 999);

    return (
      <Modal
        transparent
        animationType="slide"
        visible={showTimeModal}
        onRequestClose={() => setShowTimeModal(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.pickerContainer}>
            <Text style={styles.title}>Pilih Waktu Penyiraman</Text>

            <DateTimePicker
              display="spinner"
              is24Hour
              value={tempTimeRef.current}
              mode="time"
              onChange={onChange}
              minimumDate={minTime}
              maximumDate={maxTime}
              minuteInterval={1}
            />

            <TouchableOpacity
              onPress={() => {
                if (schedules.length >= MAX_SCHEDULES) {
                  Alert.alert(
                    'Batas Jadwal',
                    'Maksimal jadwal penyiraman adalah 6.',
                  );
                  return;
                }
                // Format waktu sebagai HH:MM
                const formattedTime = `${tempTimeRef.current
                  .getHours()
                  .toString()
                  .padStart(2, '0')}:${tempTimeRef.current
                  .getMinutes()
                  .toString()
                  .padStart(2, '0')}`;

                setSchedules(prev => [
                  ...prev,
                  { id: Date.now().toString(), time: formattedTime },
                ]);
                // Jika butuh set main date juga:
                setDate(new Date(tempTimeRef.current.getTime()));
                // TUTUP modal di sini
                setShowTimeModal(false);
              }}
              style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Tambah</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // Fungsi untuk membentuk objek JSON jadwal penyiraman dan publish ke MQTT
//   const updateScheduleMqtt = async () => {
//   const scheduleJson: { [key: string]: string | null } = {};
//   for (let i = 1; i <= MAX_SCHEDULES; i++) {
//     scheduleJson[i.toString()] = schedules[i - 1]
//       ? schedules[i - 1].time
//       : null;
//   }

//   const jsonString = JSON.stringify(scheduleJson);

//   // Simpan ke AsyncStorage biar tidak hilang saat reload
//   await AsyncStorage.setItem('wateringSchedules', jsonString);

//   // Kirim ke MQTT (pakai retained message)
//   const msg = new Paho.Message(jsonString);
//   msg.destinationName = 'sensor/data/1106200396100';
//   msg.retained = true;

//   if (clientRef.current && isConnected) {
//     (clientRef.current as any).send(msg);
//   }
// };

// Panggil setiap kali `schedules` berubah
// useEffect(() => {
//   updateScheduleMqtt();
// }, [schedules]);

// useEffect(() => {
//   // Lewati sebelum data awal diterima
//   if (!hasInitData.current) return;

//   // Debounce publish
//   if (publishRef.current) clearTimeout(publishRef.current);
//   publishRef.current = setTimeout(() => {
//     // Bentuk payload: { "1":"HH:MM", …, "6":null }
//     const pl: Record<string,string|null> = {};
//     for (let i = 1; i <= MAX_SCHEDULES; i++) {
//       pl[String(i)] = schedules[i-1]?.time ?? null;
//     }
//     const msg = new Paho.Message(JSON.stringify(pl));
//     msg.destinationName = 'sensor/data/1106200396100';
//     msg.retained = true;
//     if (clientRef.current && isConnected) {
//       (clientRef.current as any).send(msg);
//     }
    
//   }, 150);
// }, [schedules]);

useEffect(() => {
  if (!hasInitData.current) return;

  // Jika update dari broker, skip dan reset flag
  if (isBrokerUpdate.current) {
    isBrokerUpdate.current = false;
    return;
  }

  // Debounce publish
  if (publishRef.current) clearTimeout(publishRef.current);
  publishRef.current = setTimeout(() => {
    const payload: Record<string, string | null> = {};
    for (let i = 1; i <= MAX_SCHEDULES; i++) {
      payload[String(i)] = schedules[i - 1]?.time ?? null;
    }
    const msg = new Paho.Message(JSON.stringify(payload));
    msg.destinationName = 'sensor/data/1106200396100';
    msg.retained = true;
    clientRef.current?.send(msg);
  }, 150);
}, [schedules]);


const updateScheduleMqtt = async () => {
  const scheduleJson: { [key: string]: string | null } = {};
  for (let i = 1; i <= MAX_SCHEDULES; i++) {
    scheduleJson[i.toString()] = schedules[i - 1]
      ? schedules[i - 1].time
      : null;
  }
  
  const jsonString = JSON.stringify(scheduleJson);

  // Simpan ke AsyncStorage biar tidak hilang saat reload
  // await AsyncStorage.setItem('wateringSchedules', jsonString);
  

  // Kirim ke MQTT (pakai retained message)
  const msg = new Paho.Message(jsonString);
  msg.destinationName = 'sensor/data/1106200396100';
  msg.retained = true;

  if (clientRef.current && isConnected) {
    (clientRef.current as any).send(msg);
  }
};

// Panggil setiap kali `schedules` berubah
// useEffect(() => {
//   if (hydrated) {
//     updateScheduleMqtt();
//   }
// }, [schedules, hydrated]);


  // MQTT & Socket.io configurations
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isWaterOn, setIsWaterOn] = useState<boolean>(false);
  const [isFertilizerOn, setIsFertilizerOn] = useState<boolean>(false);
  const [isAutomatic, setIsAutomatic] = useState<boolean>(false);
  const clientRef = useRef<Paho.Client | null>(null);

  // useEffect(() => {
  //   const client: any = new Paho.Client(
  //     "broker.emqx.io",
  //     8083,
  //     "clientId-" + Math.floor(Math.random() * 1000)
  //   );
  //   clientRef.current = client;

  //   client.onConnectionLost = (responseObject: any) => {
  //     console.log("MQTT connection lost:", responseObject.errorMessage);
  //     setIsConnected(false);
  //     setTimeout(() => {
  //       if (clientRef.current) {
  //         (clientRef.current as any).connect({
  //           onSuccess: () => {
  //             setIsConnected(true);
  //             (clientRef.current as any).subscribe("sensor/data/1106200396");
  //             (clientRef.current as any).subscribe("sensor/data/110620039614");
  //             (clientRef.current as any).subscribe("sensor/data/110620039615");
  //             (clientRef.current as any).subscribe("sensor/data/921892819284");
  //             (clientRef.current as any).subscribe("sensor/data/921892819285");
  //           },
  //           onFailure: (err: any) => console.error("Reconnect failed:", err),
  //         });
  //       }
  //     }, 5000);
  //   };

  const socket = io('http://localhost:4646');
  socket.on('connect', () => console.log('Connected to Socket.IO server'));
  socket.on('sensorUpdate', (data: {type: string; value: string}) => {
    const val = Number(data.value);
    if (data.type === 'temperature') setTemperature(val);
    else if (data.type === 'humidity') setHumidity(val);
    else if (data.type === 'light') setLight(val);
    else if (data.type === 'soil') setSoil(val);
  });

  //   client.connect({
  //     onSuccess: () => {
  //       setIsConnected(true);
  //       (clientRef.current as any).subscribe("sensor/data/1106200396");
  //       (clientRef.current as any).subscribe("sensor/data/110620039614");
  //       (clientRef.current as any).subscribe("sensor/data/110620039615");
  //       (clientRef.current as any).subscribe("sensor/data/921892819284");
  //       (clientRef.current as any).subscribe("sensor/data/921892819285");
  //     },
  //     onFailure: (err: any) => console.error("Connection failed:", err),
  //   });

  //   return () => {
  //     if (clientRef.current && (clientRef.current as any).connected) {
  //       (clientRef.current as any).disconnect();
  //     }
  //   };
  // }, []);
  // useEffect(() => {
  //   const loadSchedules = async () => {
  //     const stored = await AsyncStorage.getItem('schedules');
  //     if (stored) {
  //       setSchedules(JSON.parse(stored));
  //     }
  //   };
  //   loadSchedules();
  // }, []);

  // useEffect(() => {
  //   const loadSchedules = async () => {
  //     const saved = await AsyncStorage.getItem('wateringSchedules');
  //     if (saved) {
  //       try {
  //         const parsed = JSON.parse(saved);
  //         const loadedSchedules: ScheduleItem[] = Object.entries(parsed)
  //           .filter(([, time]) => time)
  //           .map(([id, time]) => ({
  //             id,
  //             time: typeof time === 'string' ? time : String(time),
  //           }));
  
  //         setSchedules(loadedSchedules);
  //       } catch (err) {
  //         console.warn('Gagal parse jadwal:', err);
  //       }
  //     }
  //     setHydrated(true); // ✅ hanya nyalakan efek MQTT setelah load selesai
  //   };
  
  //   loadSchedules();
  // }, []);
  
  

  useEffect(() => {
    const client = new Paho.Client(
      'mqtt.vanilitest.shop', // Ganti dengan domain broker Anda
      8083,
      'clientId-' + Math.floor(Math.random() * 1000),
    );
    clientRef.current = client;

    client.onConnectionLost = (responseObject: any) => {
      console.log('MQTT connection lost:', responseObject.errorMessage);
      setIsConnected(false);
      setTimeout(() => {
        if (clientRef.current) {
          clientRef.current.connect({
            useSSL: true,
            userName: 'mobileapp', // Ganti dengan username Anda
            password: '12341234', // Ganti dengan password Anda
            onSuccess: () => {
              setIsConnected(true);
              clientRef.current?.subscribe('sensor/data/1106200396');
              clientRef.current?.subscribe('sensor/data/110620039614');
              clientRef.current?.subscribe('sensor/data/110620039615');
              clientRef.current?.subscribe('sensor/data/921892819284');
              clientRef.current?.subscribe('sensor/data/921892819285');
              clientRef.current?.subscribe('sensor/data/1106200396100');
              clientRef.current?.subscribe('control/watering');
              clientRef.current?.subscribe('control/fertilizing');
            },
            onFailure: (err: any) => console.error('Reconnect failed:', err),
          });
        }
      }, 5000);
    };

    client.connect({
      useSSL: true,
      userName: 'mobileapp', // Ganti dengan username Anda
      password: '12341234', // Ganti dengan password Anda
      onSuccess: () => {
        setIsConnected(true);
        client.subscribe('sensor/data/1106200396');
        client.subscribe('sensor/data/110620039614');
        client.subscribe('sensor/data/110620039615');
        client.subscribe('sensor/data/921892819284');
        client.subscribe('sensor/data/921892819285');
        clientRef.current?.subscribe('sensor/data/1106200396100');
        clientRef.current?.subscribe('control/watering');
        clientRef.current?.subscribe('control/fertilizing');
      },
      onFailure: (err: any) => console.error('Connection failed:', err),
    });

    client.onMessageArrived = msg => {
      const topic = msg.destinationName;
      try {
        const payload = JSON.parse(msg.payloadString) as Record<string, string | null>;

        // 1) Initial retained schedule message
        if (topic === 'sensor/data/1106200396100') {
          if (!hasInitData.current) {
            const list: ScheduleItem[] = Object.entries(payload)
              .filter(([, t]) => t !== null)
              .map(([id, t]) => ({ id, time: t! }));
            setSchedules(list);
            hasInitData.current = true;
          }
          return; // ignore further retained messages
        }

        // 2) Watering control messages
        if (topic === 'control/watering') {
          setIsWaterOn(payload.valve_status === 'open');
          return;
        }

        // 3) Fertilizing control messages
        if (topic === 'control/fertilizing') {
          setIsFertilizerOn(payload.valve_status === 'open');
          return;
        }

      } catch (e) {
        console.warn('Error parsing message:', e);
      }
    };
    
    
    
    
    return () => {
      if (clientRef.current && clientRef.current.isConnected()) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  const publishValue =  (topicSuffix: string, value: number) => {
    if (!isConnected || !clientRef.current) {
      Alert.alert("Error", "MQTT client belum terkoneksi");
      return;
    }
    const msg = new Paho.Message(value.toString());
    msg.destinationName = `${topicSuffix}`;
    (clientRef.current as any).send(msg);
  };

  const publishValueTemp = async (topicSuffix: string, value: number) => {
    if (!isConnected || !clientRef.current) {
      Alert.alert("Error", "MQTT client belum terkoneksi");
      return;
    }
    const nilai = value.toString()
    // await AsyncStorage.setItem('tempMax', nilai);
    const msg = new Paho.Message(value.toString());
    msg.destinationName = `${topicSuffix}`;
    (clientRef.current as any).send(msg);
  };

  const publishValueHum = async (topicSuffix: string, value: number) => {
    if (!isConnected || !clientRef.current) {
      Alert.alert("Error", "MQTT client belum terkoneksi");
      return;
    }
    const nilai = value.toString()
    // await AsyncStorage.setItem('humMax', nilai);
    const msg = new Paho.Message(value.toString());
    msg.destinationName = `${topicSuffix}`;
    (clientRef.current as any).send(msg);
  };

  const publishValueWater = (
    topicSuffix: string,
    valveStatus: 'open' | 'close',
  ) => {
    if (!isConnected || !clientRef.current) {
      Alert.alert('Error', 'MQTT client belum terkoneksi');
      return;
    }

    const payload = {
      valve_status: valveStatus,
    };

    const msg = new Paho.Message(JSON.stringify(payload));
    msg.destinationName = topicSuffix;
    (clientRef.current as any).send(msg);
  };
  const publishValueFertilizer = (
    topicSuffix: string,
    valveStatus: 'open' | 'close',
  ) => {
    if (!isConnected || !clientRef.current) {
      Alert.alert('Error', 'MQTT client belum terkoneksi');
      return;
    }

    const payload = {
      valve_status: valveStatus,
    };

    const msg = new Paho.Message(JSON.stringify(payload));
    msg.destinationName = topicSuffix;
    (clientRef.current as any).send(msg);
  };

  const toggleMode = () => {
    // 1. hitung mode baru
    setIsAutomatic(prev => {
      const newMode = !prev;
      publishValue("110620039611", newMode ? 0 : 1);
      return newMode;
    });

    // 2. reset manual toggles
    setIsWaterOn(false);
    setIsFertilizerOn(false);
  };

  const toggleWater = () => {
    if (isAutomatic) return;
    setIsWaterOn(prev => {
      const newState = !prev;
      publishValueWater('control/watering', newState ? 'open' : 'close');
      if (newState) setIsFertilizerOn(false);
      return newState;
    });
  };

  const toggleFertilizer = () => {
    if (isAutomatic) return;
    setIsFertilizerOn(prev => {
      const newState = !prev;
      publishValueFertilizer(
        'control/fertilizing',
        newState ? 'open' : 'close',
      );
      if (newState) setIsWaterOn(false);
      return newState;
    });
  };

  // Data sensor untuk slider carousel (total 10 box)
  const sensors: SensorItem[] = [
    {
      title: 'Temperature',
      value: temperature > 0 ? temperature.toFixed(2) : '--',
      unit: '°C',
      borderColor: '#E74C3C',
    },
    {
      title: 'Humidity',
      value: humidity > 0 ? humidity.toFixed(2) : '--',
      unit: '%',
      borderColor: '#3498DB',
    },
    {
      title: 'Light',
      value: light > 0 ? light.toString() : '--',
      unit: 'Lux',
      borderColor: '#F1C40F',
    },
    {
      title: 'Temperature Soil',
      value: soil > 0 ? soil.toFixed(2) : '--',
      unit: '°C',
      borderColor: '#9B59B6',
    },
    {
      title: 'Humidity Soil',
      value: soil > 0 ? soil.toFixed(2) : '--',
      unit: '%',
      borderColor: '#1ABC9C',
    },
    {
      title: 'Conductivity',
      value: '--',
      unit: 'µS/cm',
      borderColor: '#34495E',
    },
    {
      title: 'PH',
      value: '--',
      unit: '',
      borderColor: '#F39C12',
    },
    {
      title: 'N',
      value: '--',
      unit: 'mg/L',
      borderColor: '#2ECC71',
    },
    {
      title: 'P',
      value: '--',
      unit: 'mg/L',
      borderColor: '#E67E22',
    },
    {
      title: 'K',
      value: '--',
      unit: 'mg/L',
      borderColor: '#C0392B',
    },
  ];

  // Kelompokkan jadwal penyiraman per 4 item untuk tampilan slider
  const renderScheduleSlider = () => {
    const groups: ScheduleItem[][] = [];
    for (let i = 0; i < schedules.length; i += 4) {
      groups.push(schedules.slice(i, i + 4));
    }

    const confirmDeletion = (id: string) => {
      Alert.alert(
        'Konfirmasi Hapus',
        'Anda yakin ingin menghapus jadwal ini?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: () => {
              setSchedules(prev => {
                const newSchedules = prev.filter(s => s.id !== id);
                console.log("Updated schedules after deletion:", newSchedules); // Debugging
                return newSchedules;
              });
            },
          },
        ],
        { cancelable: true }
      );
    };
    

    return (
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scheduleSlider}>
        {groups.map((group, idx) => (
          <View key={idx} style={styles.schedulePage}>
            {group.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.scheduleBox}
                onPress={() => confirmDeletion(item.id)}>
                <Text style={styles.scheduleText}>{item.time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <SensorCarousel sensors={sensors} />
        <ScrollView
          style={styles.sliderContainer}
          contentContainerStyle={styles.sliderContent}>
          {/* Sliders untuk Temperature Max dan Soil Min */}
          <View style={styles.rowContainer}>
            <Card style={styles.card}>
              <Animated.View
                style={[
                  styles.sliderGroup,
                  {transform: [{scale: tempMaxScale}]},
                ]}>
                <Text style={styles.sliderLabel}>Soil Min: {tempMax}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={tempMax}
                  onValueChange={(value: number) => setTempMax(value)}
                  onSlidingStart={() => zoomIn(tempMaxScale)}
                  onSlidingComplete={(value: number) => {
                    publishValueTemp("110620039615", value);
                    zoomOut(tempMaxScale);
                  }}
                  minimumTrackTintColor="#E74C3C"
                  maximumTrackTintColor="#ecf0f1"
                  thumbTintColor="#E74C3C"
                />
              </Animated.View>
              <Animated.View
                style={[
                  styles.sliderGroup,
                  {transform: [{scale: soilMinScale}]},
                ]}>
                <Text style={styles.sliderLabel}>
                  Temperature Max: {soilMin}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={soilMin}
                  onValueChange={(value: number) => setSoilMin(value)}
                  onSlidingStart={() => zoomIn(soilMinScale)}
                  onSlidingComplete={(value: number) => {
                    publishValueHum("110620039616", value);
                    zoomOut(soilMinScale);
                  }}
                  minimumTrackTintColor="#2ECC71"
                  maximumTrackTintColor="#ecf0f1"
                  thumbTintColor="#2ECC71"
                />
              </Animated.View>
            </Card>
          </View>

          {/* Header Jadwal Penyiraman dengan ikon "+" */}
          <View style={styles.scheduleHeader}>
            <Text style={styles.sectionTitle}>Jadwal Penyiraman</Text>
            <TouchableOpacity onPress={() => setShowTimeModal(true)}>
              <FontAwesomeIcon icon={faCirclePlus} size={28} color="#8e44ad" />
            </TouchableOpacity>
          </View>

          {/* Render slider untuk jadwal penyiraman */}
          {schedules.length > 0 && renderScheduleSlider()}

          {/* Kontrol Mode & Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity style={styles.modeButton} onPress={toggleMode}>
              <Text style={styles.modeButtonText}>
                Mode: {isAutomatic ? 'Otomatis' : 'Manual'}
              </Text>
            </TouchableOpacity>
            <View style={styles.toggleSwitches}>
              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>Air</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleSwitch,
                    isWaterOn ? styles.toggleOn : styles.toggleOff,
                    isAutomatic && styles.toggleDisabled,
                    !isAutomatic && isFertilizerOn && styles.toggleDisabled,
                  ]}
                  onPress={toggleWater}
                  disabled={isAutomatic || (!isAutomatic && isFertilizerOn)}>
                  <View style={styles.toggleCircle} />
                </TouchableOpacity>
              </View>
              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>Pupuk</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleSwitch,
                    isFertilizerOn ? styles.toggleOn : styles.toggleOff,
                    isAutomatic && styles.toggleDisabled,
                    !isAutomatic && isWaterOn && styles.toggleDisabled,
                  ]}
                  onPress={toggleFertilizer}
                  disabled={isAutomatic || (!isAutomatic && isWaterOn)}>
                  <View style={styles.toggleCircle} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
      {renderTimePickerModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    padding: 20,
  },
  sliderContainer: {
    flex: 1,
    marginTop: -25,
  },
  sliderContent: {
    paddingBottom: 30,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  sliderGroup: {
    width: '48%',
    marginHorizontal: 5,
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  // Card style yang semakin kecil
  card: {
    marginBottom: 6,
    padding: 2,
    borderRadius: 15,
    backgroundColor: 'white',
    elevation: 1,
    shadowColor: '#000',
    shadowRadius: 2,
    shadowOffset: {height: 1, width: 0},
    shadowOpacity: 0.1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scheduleSlider: {
    marginBottom: 20,
    height: 80,
  },
  schedulePage: {
    flexDirection: 'row',
    width: 300, // Anda dapat menggunakan Dimensions API untuk lebar layar dinamis
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  scheduleBox: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  scheduleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  toggleContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    position: 'relative',
  },
  modeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#8e44ad',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modeButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  toggleSwitches: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 45,
  },
  toggleItem: {
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    padding: 2,
  },
  toggleOn: {
    backgroundColor: '#27ae60',
    alignItems: 'flex-end',
  },
  toggleOff: {
    backgroundColor: '#bdc3c7',
    alignItems: 'flex-start',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    marginBottom: 10,
    color: '#333',
  },
  modalButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#8e44ad',
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  toggleDisabled: {
    opacity: 0.5,
  },
});

export default Rumah;
