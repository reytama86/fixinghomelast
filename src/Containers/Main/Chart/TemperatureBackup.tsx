// import React, {useState, useMemo} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Dimensions,
//   StyleSheet,
// } from 'react-native';
// import {barDataItem, LineChart} from 'react-native-gifted-charts';
// import Humidity from './Humidity';
// import {processWeeklyData, MetricType} from './ChartQueryFix';
// import SegmentedControl from '@react-native-segmented-control/segmented-control';

// const {width: SCREEN_W} = Dimensions.get('window');
// const PADDING = 16;
// const CARD_WIDTH = SCREEN_W - PADDING * 2;

// type DataPoint = {value: number; date: string};

// // Helper to format date and time
// // function formatLabel(dateObj: Date, showTime = false): string {
// //   const day = dateObj.getDate();
// //   const monthNames = [
// //     'Jan',
// //     'Feb',
// //     'Mar',
// //     'Apr',
// //     'May',
// //     'Jun',
// //     'Jul',
// //     'Aug',
// //     'Sep',
// //     'Oct',
// //     'Nov',
// //     'Dec',
// //   ];
// //   const month = monthNames[dateObj.getMonth()];
// //   if (!showTime) return `${day} ${month}`;
// //   const hours = dateObj.getHours().toString().padStart(2, '0');
// //   const minutes = dateObj.getMinutes().toString().padStart(2, '0');
// //   return `${day} ${month}\n${hours}:${minutes}`;
// // }

// function formatLabel(date: Date, withTime = false): string {
//   const day = date.getDate();
//   const monthNames = [
//     'Jan','Feb','Mar','Apr','Mei','Jun',
//     'Jul','Agu','Sep','Okt','Nov','Des',
//   ];
//   const month = monthNames[date.getMonth()];
//   if (!withTime) {
//     return `${day} ${month}`;
//   }
//   // Sisipkan '\n' agar split('\n') nanti efektif
//   const hh = String(date.getHours()).padStart(2, '0');
//   const mm = String(date.getMinutes()).padStart(2, '0');
//   return `${day} ${month}\n${hh}:${mm}`;
// }

// type Sensor = {id_sensor: number; esp_id: string};
// type Blok = {id_detail_blok: number; nama_blok: string; kondisi_blok: string};

// export default function Temperature() {
//   const [barData, setBarData] = useState<barDataItem[]>([]);
//   const [currentDate, setCurrentDate] = React.useState(new Date());
//   const [range, setRange] = useState<'7D' | '1M' | '1Y' | 'Max'>('7D');
//   const [sensorList, setSensorList] = React.useState<Sensor[]>([]);
//   const [selectedSensorIndex, setSelectedSensorIndex] = React.useState(0);

//   const [blokList, setBlokList] = React.useState<Blok[]>([]);
//   const [selectedBlokIndex, setSelectedBlokIndex] = React.useState(0);
//   const segments: MetricType[] = [
//     'Suhu Udara',
//     'Kelembaban Udara',
//     'Cahaya',
//     'Kelembaban Tanah',
//   ];
//   const [sensorType, setSensorType] = React.useState<MetricType>(segments[0]);
//   React.useEffect(() => {
//     fetch('http://localhost:4646/api/bloklist')
//       .then(r => r.json())
//       .then((list: Blok[]) => setBlokList(list))
//       .catch(console.error);
//   }, []);
//   React.useEffect(() => {
//     fetch('http://localhost:4646/api/sensorlist')
//       .then(r => r.json())
//       .then((list: Sensor[]) => setSensorList(list))
//       .catch(console.error);
//   }, []);

//   const uniqueSensors = useMemo(() => {
//     const map = new Map<string, Sensor>();
//     sensorList.forEach(s => {
//       if (!map.has(s.esp_id)) map.set(s.esp_id, s);
//     });
//     return Array.from(map.values());
//   }, [sensorList]);
  

//   // Fetch blok list
//   // React.useEffect(() => {
//   //     if (!sensorList.length || !blokList.length) return;

//   //     const fetchWeekly = async () => {
//   //       const espId = uniqueSensors[selectedSensorIndex].esp_id;
//   //       const blokName = blokList[selectedBlokIndex].nama_blok;
//   //       const { startDate, endDate } = getWeekRange();
//   //       const qs = new URLSearchParams({
//   //         startDate: formatMySQLDatetime(startDate),
//   //         endDate: formatMySQLDatetime(endDate),
//   //         keterangan_sensor: "Suhu Udara",
//   //         esp_id: espId,
//   //         nama_blok: blokName,
//   //       });

//   //       try {
//   //         const resp = await fetch(`http://localhost:4646/api/weekly-data?${qs.toString()}`);
//   //         if (!resp.ok) throw new Error(await resp.text());

//   //         // Baca body hanya sekali saja
//   //         const rawData = await resp.json();

//   //         const points: DataPoint[] = rawData.map((item: any) => {
//   //           const dt = new Date(item.waktu); // Ganti item.timestamp -> item.waktu
//   //           return {
//   //             value: item.nilai_sensor, // Ganti item.value -> item.nilai_sensor
//   //             date: formatLabel(dt, true),
//   //           };
//   //         });

//   //         setBarData(points);
//   //       } catch (error) {
//   //         console.error('fetch weeklydata error:', error);
//   //       }
//   //     };

//   //     fetchWeekly();
//   //   }, [
//   //     range,
//   //     currentDate,
//   //     // transactionType,
//   //     selectedSensorIndex,
//   //     // sensorList,
//   //     selectedBlokIndex,
//   //     blokList,
//   //     uniqueSensors
//   //   ]);
  
//   // React.useEffect(() => {
//   //   if (!sensorList.length || !blokList.length) return;

//   //   const fetchData = async () => {
//   //     const baseURL = 'http://localhost:4646';
//   //     const endpoint =
//   //       range === '1M' ? '/api/monthly-data' : '/api/weekly-data';

//   //     // hitung start/end
//   //     const now = new Date();
//   //     const end = new Date(now);
//   //     end.setHours(23, 59, 59, 999);
//   //     const start = new Date(now);
//   //     start.setDate(now.getDate() - (range === '1M' ? 29 : 6));
//   //     start.setHours(0, 0, 0, 0);

//   //     const params = new URLSearchParams({
//   //       startDate: formatMySQLDatetime(start),
//   //       endDate: formatMySQLDatetime(end),
//   //       keterangan_sensor: sensorType,
//   //       esp_id: uniqueSensors[selectedSensorIndex].esp_id,
//   //       nama_blok: blokList[selectedBlokIndex].nama_blok,
//   //     });

//   //     try {
//   //       const resp = await fetch(`${baseURL}${endpoint}?${params}`);
//   //       if (!resp.ok) throw new Error(await resp.text());
//   //       const raw = await resp.json();

//   //       const points: DataPoint[] = raw.map((item: any) => {
//   //         if (range === '1M') {
//   //           const dt = new Date(item.date + 'T14:00:00');
//   //           return {value: item.value, date: formatLabel(dt, false)};
//   //         } else {
//   //           const dt = new Date(item.waktu);
//   //           return {value: item.nilai_sensor, date: formatLabel(dt, true)};
//   //         }
//   //       });
//   //       setBarData(points);
//   //     } catch (err) {
//   //       console.error('fetch data error:', err);
//   //     }
//   //   };

//   //   fetchData();
//   // }, [
//   //   range,
//   //   selectedSensorIndex,
//   //   selectedBlokIndex,
//   //   sensorList,
//   //   blokList,
//   //   sensorType,
//   //   uniqueSensors,
//   // ]);

//   // React.useEffect(() => {
//   //   if (!sensorList.length || !blokList.length) return;
  
//   //   const fetchData = async () => {
//   //     const baseURL = 'http://localhost:4646';
//   //     const endpoint = range === '1M' ? '/api/monthly-data' : '/api/weekly-data';
  
//   //     const now = new Date();
  
//   //     // 1. Hitung endDate = kemarin pukul 23:59:59.999
//   //     const endDate = new Date(now);
//   //     endDate.setDate(now.getDate() - 1);          // mundur 1 hari :contentReference[oaicite:9]{index=9}
//   //     endDate.setHours(23, 59, 59, 999);           // akhir hari kemarin :contentReference[oaicite:10]{index=10}
  
//   //     // 2. Hitung startDate sesuai range
//   //     const startDate = new Date(endDate);
//   //     if (range === '7D') {
//   //       startDate.setDate(endDate.getDate() - 6);   // mundur 6 hari dari kemarin (total 7 hari) :contentReference[oaicite:11]{index=11}
//   //       startDate.setHours(0, 0, 0, 0);             // set di pukul 00:00:00.000
//   //     } else if (range === '1M') {
//   //       startDate.setDate(endDate.getDate() - 29);  // mundur 29 hari dari kemarin (total 30 hari) :contentReference[oaicite:12]{index=12}
//   //       startDate.setHours(0, 0, 0, 0);             // set di pukul 00:00:00.000
//   //     }
  
//   //     // 3. Format ke MySQL DATETIME: YYYY-MM-DD HH:mm:ss
//   //     const params = new URLSearchParams({
//   //       startDate: formatMySQLDatetime(startDate),
//   //       endDate:   formatMySQLDatetime(endDate),
//   //       keterangan_sensor: sensorType,
//   //       esp_id: uniqueSensors[selectedSensorIndex].esp_id,
//   //       nama_blok: blokList[selectedBlokIndex].nama_blok,
//   //     });
  
//   //     try {
//   //       const resp = await fetch(`${baseURL}${endpoint}?${params.toString()}`);
//   //       if (!resp.ok) throw new Error(await resp.text());
//   //       const raw = await resp.json();
  
//   //       const points: DataPoint[] = raw.map((item: any) => {
//   //         if (range === '1M') {
//   //           // Untuk 1M, API mengembalikan properti 'date' tanpa jam,
//   //           // kemudian kita set jam ke 14:00 agar chart hanya menampilkan tanggal.
//   //           const dt = new Date(item.date + 'T14:00:00');
//   //           return {value: item.value, date: formatLabel(dt, false)};
//   //         } else {
//   //           // Untuk 7D (weekly-data), API mengembalikan properti 'waktu' dengan timestamp penuh
//   //           const dt = new Date(item.waktu);
//   //           return {value: item.nilai_sensor, date: formatLabel(dt, true)};
//   //         }
//   //       });
//   //       setBarData(points);
//   //     } catch (err) {
//   //       console.error('fetch data error:', err);
//   //     }
//   //   };
  
//   //   fetchData();
//   // }, [
//   //   range,
//   //   selectedSensorIndex,
//   //   selectedBlokIndex,
//   //   sensorList,
//   //   blokList,
//   //   sensorType,
//   //   uniqueSensors,
//   // ]);

//   React.useEffect(() => {
//     if (!sensorList.length || !blokList.length) return;

//     const fetchData = async () => {
//       const baseURL = 'http://localhost:4646';
//       const endpoint = range === '1M' ? '/api/monthly-data' : '/api/weekly-data';

//       const now = new Date();

//       // Hitung endDate = kemarin 23:59:59.999
//       const endDate = new Date(now);
//       endDate.setDate(now.getDate() - 1);
//       endDate.setHours(23, 59, 59, 999);

//       // Hitung startDate sesuai range
//       const startDate = new Date(endDate);
//       if (range === '7D') {
//         startDate.setDate(endDate.getDate() - 6);
//         startDate.setHours(0, 0, 0, 0);
//       } else if (range === '1M') {
//         startDate.setDate(endDate.getDate() - 29);
//         startDate.setHours(0, 0, 0, 0);
//       } else {
//         // Untuk 1Y dan Max, implementasi serupa dapat ditambahkan
//         startDate.setDate(endDate.getDate() - 29);
//         startDate.setHours(0, 0, 0, 0);
//       }

//       const params = new URLSearchParams({
//         startDate: formatMySQLDatetime(startDate),
//         endDate: formatMySQLDatetime(endDate),
//         keterangan_sensor: sensorType,
//         esp_id: uniqueSensors[selectedSensorIndex].esp_id,
//         nama_blok: blokList[selectedBlokIndex].nama_blok,
//       });

//       try {
//         const resp = await fetch(`${baseURL}${endpoint}?${params.toString()}`);
//         if (!resp.ok) throw new Error(await resp.text());
//         const raw = await resp.json();

//         const points: DataPoint[] = raw.map((item: any) => {
//           if (range === '1M') {
//             const dt = new Date(item.date + 'T14:00:00');
//             return {value: item.value, date: formatLabel(dt, false)};
//           } else {
//             const dt = new Date(item.waktu);
//             return {value: item.nilai_sensor, date: formatLabel(dt, true)};
//           }
//         });
//         setBarData(points);
//       } catch (err) {
//         console.error('fetch data error:', err);
//       }
//     };

//     fetchData();
//   }, [
//     range,
//     selectedSensorIndex,
//     selectedBlokIndex,
//     sensorList,
//     blokList,
//     sensorType,
//     uniqueSensors,
//   ]);
  
  
//   // Hitung awal & akhir minggu
//   function getWeekRange(): {startDate: Date; endDate: Date} {
//     const end = new Date();
//     end.setHours(23, 59, 59, 999);
//     const start = new Date(end);
//     start.setDate(end.getDate() - 6);
//     start.setHours(0, 0, 0, 0);
//     return {startDate: start, endDate: end};
//   }
  
//   const formatMySQLDatetime = (d: Date) =>
//     new Date(d.getTime() - d.getTimezoneOffset() * 60000)
//       .toISOString()
//       .slice(0, 19)
//       .replace('T', ' ');

//   // Data generation
//   const data7d = useMemo<DataPoint[]>(() => {
//     const times = [0, 4, 8, 12, 16, 20];
//     const baseValues = [29, 32, 33, 31, 34, 30];
//     const points: DataPoint[] = [];
//     const today = new Date();
//     for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
//       const dateBase = new Date(
//         today.getFullYear(),
//         today.getMonth(),
//         today.getDate() - dayOffset,
//       );
//       times.forEach((hour, idx) => {
//         const dt = new Date(dateBase);
//         dt.setHours(hour);
//         dt.setMinutes(0);
//         const variation = Math.floor(Math.random() * 5) - 2;
//         const value = Math.max(0, Math.min(40, baseValues[idx] + variation));
//         points.push({value, date: formatLabel(dt, true)});
//       });
//     }
//     return points;
//   }, []);

//   const data1m = useMemo<DataPoint[]>(() => {
//     const pts: DataPoint[] = [];
//     const today = new Date();
//     // for (let i = 29; i >= 0; i--) {
//     //   const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
//     //   const val = 20 + ((d.getDate() * 3) % 15);
//     //   pts.push({ value: val, date: formatLabel(d) });
//     // }
//     // Generate nilai bervariasi: pola gabungan sinus + random noise
//     for (let i = 29; i >= 0; i--) {
//       const d = new Date(
//         today.getFullYear(),
//         today.getMonth(),
//         today.getDate() - i,
//       );
//       // gunakan indeks hari untuk pola hari-ke hari
//       const dayIdx = d.getDate();
//       // pola sinus untuk fluktuasi harian
//       const sinus = Math.sin((dayIdx / 30) * Math.PI * 2) * 10;
//       // tambahkan noise acak +-5
//       const noise = (Math.random() - 0.5) * 10;
//       // baseline 25 derajat
//       const val = Math.max(0, Math.min(40, 25 + sinus + noise));
//       pts.push({value: Math.round(val), date: formatLabel(d)});
//     }
//     return pts;
//   }, []);

//   // Placeholder untuk 1Y dan Max
//   const data1y = data1m;
//   const dataMax = data1m;

//   const dataMap = {'7D': data7d, '1M': data1m, '1Y': data1y, Max: dataMax};
//   const data = dataMap[range];

//   // Konfigurasi chart per range
//   const chartConfig = useMemo(() => {
//     switch (range) {
//       case '7D':
//         return {
//           spacing: CARD_WIDTH / (data.length + 5.9),
//           initialSpacing: 0,
//           showVerticalLines: false,
//           xLabelsKeys: ['first', 'mid', 'last'],
//           rulesLength: 315.5,
//           chartWidth: 350.5,
//         };
//       case '1M':
//         return {
//           spacing: CARD_WIDTH / ((data.length + 4) / 1),
//           initialSpacing: 0,
//           showVerticalLines: false,
//           xLabelsKeys: ['first','seven', 'fourteen', 'last'],
//           chartWidth: 350.5,
//           rulesLength: 316.5,
//         };
//       case '1Y':
//       case 'Max':
//         return {
//           spacing: CARD_WIDTH / ((data.length - 1) / 4),
//           initialSpacing: -55,
//           chartWidth: 315.5,
//           rulesLength: 316.5,
//           showVerticalLines: false,
//           xLabelsKeys: ['first', 'mid', 'last'],
//         };
//       default:
//         return {
//           spacing: CARD_WIDTH / (data.length - 1),
//           initialSpacing: 0,
//           showVerticalLines: false,
//           xLabelsKeys: ['first', 'mid', 'last'],
//         };
//     }
//   }, [range, data.length]);

//   // Mapping posisi label
//   const idxMap: Record<string, number> = {
//     first: 0,
//     seven: Math.floor((data.length * 1) / 4),
//     fourteen: Math.floor((data.length * 2) / 4),
//     twentyOne: Math.floor((data.length * 3) / 4),
//     mid: Math.floor((data.length - 1) / 2),
//     last: data.length - 1,
//   };

//   // Di bagian xLabels:
//   const xLabels = chartConfig.xLabelsKeys.map(key => {
//     const raw = data[idxMap[key]].date;        // "28 Mei\n09:00"
//     return raw.split('\n')[0];                 // → "28 Mei"
//   });

//   const zeroRule = {
//     ruleType: 'horizontal',
//     value: 0,
//     color: '#ccc',
//     strokeWidth: 1.5,
//   };

  
  

//   return (
//     <>
//       <View style={styles.card}>
//         <Text style={styles.title}>Temperature</Text>
//         {/* Segmented control */}
//         <View style={styles.wraperSegment}>
//           {/* Segmented control untuk range */}
//           <View style={styles.rangeContainer}>
//             {['7D', '1M', '1Y', 'Max'].map(tab => (
//               <TouchableOpacity
//                 key={tab}
//                 style={[
//                   styles.rangeButton,
//                   range === tab && styles.rangeButtonActive,
//                 ]}
//                 onPress={() => setRange(tab as any)}>
//                 <Text
//                   style={[
//                     styles.rangeText,
//                     range === tab && styles.rangeTextActive,
//                   ]}>
//                   {tab}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           {/* Baris untuk blok & sensor selector */}
//           <View style={styles.selectorRow}>
//             <View style={styles.selectorWrapper}>
//               <SegmentedControl
//                 values={blokList.map(b => b.nama_blok)}
//                 selectedIndex={selectedBlokIndex}
//                 onChange={e =>
//                   setSelectedBlokIndex(e.nativeEvent.selectedSegmentIndex)
//                 }
//                 style={styles.selectorControl}
//               />
//             </View>
//             <View style={styles.selectorWrapper}>
//               <SegmentedControl
//                 values={uniqueSensors.map(s => s.esp_id)}
//                 selectedIndex={selectedSensorIndex}
//                 onChange={e =>
//                   setSelectedSensorIndex(e.nativeEvent.selectedSegmentIndex)
//                 }
//                 style={styles.selectorControl}
//               />
//             </View>
//           </View>
//         </View>

//         {/* Chart */}
//         <View style={styles.chartWrapper}>
//           <LineChart
//             data={barData}
//             width={chartConfig.chartWidth}
//             height={220}
//             initialSpacing={chartConfig.initialSpacing}
//             spacing={chartConfig.spacing}
//             areaChart
//             curved={false}
//             color="#B4DC45"
//             hideDataPoints
//             yAxisLabelTexts={['0', '20', '40', '60', '80']}
//             yAxisTextStyle={styles.yAxisText}
//             xAxisColor="transparent"
//             yAxisColor="transparent"
//             noOfSections={4}
//             minValue={0}
//             maxValue={40}
//             rulesType="solid"
//             rulesLength={chartConfig.rulesLength}
//             rulesColor="#eee"
//             extraRules={[zeroRule]}
//             showVerticalLines={chartConfig.showVerticalLines}
//             useGradient
//             startFillColor="#B4DC45"
//             endFillColor="#B4DC45"
//             startOpacity={0.5}
//             endOpacity={0}
//             pointerConfig={{
//               pointerStripHeight: 230,
//               pointerStripColor: '#DEE2E7',
//               pointerStripWidth: 1,
//               // pointerStripType: 'dashed',
//               strokeDashArray: [4, 4],
//               pointerColor: '#B4DC45',
//               activatePointersOnLongPress: true,
//               stripOverPointer: false, // Ensure strip is always over pointer
//               autoAdjustPointerLabelPosition: true, // Auto adjust pointer position
//               pointerLabelWidth: 100, // Define fixed width for pointer label
//               pointerLabelComponent: items => {
//                 const {value, date, x, y} = items[0];
//                 const [d, t] = date.split('\n');

//                 // Tetapkan nilai chartLeftPadding secara eksplisit
//                 const chartLeft = 0; // Misalnya, jika tidak ada padding
//                 const chartWidth = chartConfig.chartWidth;
//                 const chartRight = chartLeft + 20;
//                 const tooltipWidth = 100;

//                 // Hitung posisi tooltip agar tetap dalam batas grafik
//                 let tooltipLeft = x - tooltipWidth / 2;
//                 if (tooltipLeft < chartLeft) {
//                   tooltipLeft = chartLeft;
//                 } else if (tooltipLeft + tooltipWidth > chartRight) {
//                   tooltipLeft = chartRight - tooltipWidth;
//                 }

//                 return (
//                   <View
//                     style={[styles.tooltip, {left: tooltipLeft, top: y - 55}]}>
//                     <Text style={styles.tooltipText}>{value}°</Text>
//                     <View style={styles.tooltipDivider} />
//                     <View style={styles.tooltipDateRow}>
//                       <Text style={styles.tooltipSub}>{d}</Text>
//                       <Text style={styles.tooltipSub}>{t}</Text>
//                     </View>
//                   </View>
//                 );
//               },
//             }}
//           />
//         </View>

//         {/* X-axis labels */}
//         <View style={styles.xLabels}>
//           {xLabels.map((lab, i) => (
//             <Text key={i} style={styles.xLabel}>
//               {lab}
//             </Text>
//           ))}
//         </View>
//       </View>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     margin: PADDING,
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 14,
//     elevation: 3,
//     top: 56,
//     marginBottom: -2.5,
//   },
//   title: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 12,
//     color: '#333',
//     fontFamily: 'Space Grotesk',
//   },
//   // wraperSegment: {
//   //   paddingHorizontal: 8,
//   //   width: 357.5,
//   //   left: -10,
//   //   marginBottom: 12,
//   // },
//   segmentContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#f0f0f0',
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   segment: {
//     flex: 1,
//     paddingVertical: 6,
//     alignItems: 'center',
//   },
//   segmentActive: {
//     backgroundColor: '#B4DC45',
//     borderRadius: 6,
//   },
//   segmentText: {
//     color: '#555',
//     fontSize: 12,
//     fontWeight: 400,
//     fontFamily: 'Space Grotesk',
//   },
//   segmentTextActive: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   chartWrapper: {
//     marginLeft: -10,
//     width: CARD_WIDTH,
//     top: 10,
//   },
//   yAxisText: {
//     fontFamily: 'Space Grotesk',
//     fontWeight: '400',
//     fontSize: 12,
//     lineHeight: 16,
//     letterSpacing: 0.04,
//     color: '#999',
//     marginLeft: -10,
//   },
//   tooltip: {
//     position: 'absolute',
//     flexDirection: 'row',
//     width: 110,
//     backgroundColor: '#F0F8DA',
//     padding: 6,
//     borderRadius: 4,
//     alignItems: 'center',
//   },
//   tooltipText: {
//     color: 'black',
//     fontWeight: '400',
//     fontSize: 10,
//     fontFamily: 'SpaceGrotesk-Regular',
//   },
//   tooltipDivider: {
//     width: 1,
//     height: 14,
//     backgroundColor: '#DEE2E7',
//     borderStyle: 'dashed',
//     marginHorizontal: 4,
//     alignSelf: 'center',
//   },
//   tooltipDateRow: {
//     flexDirection: 'row',
//     gap: 4,
//     alignItems: 'center',
//   },
//   tooltipSub: {
//     color: '#93A071',
//     fontSize: 10,
//     fontFamily: 'SpaceGrotesk-Regular',
//   },
//   xLabels: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 8,
//     marginHorizontal: 17.5,
//     left: 13,
//   },
//   xLabel: {
//     fontFamily: 'Space Grotesk',
//     fontWeight: '400',
//     fontSize: 10,
//   },
//   wraperSegment: {
//     paddingHorizontal: 8,
//     marginBottom: 12,
//   },

//   // Range buttons
//   rangeContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#f0f0f0',
//     borderRadius: 8,
//     overflow: 'hidden',
//     marginBottom: 8,
//   },
//   rangeButton: {
//     flex: 1,
//     paddingVertical: 6,
//     alignItems: 'center',
//   },
//   rangeButtonActive: {
//     backgroundColor: '#B4DC45',
//   },
//   rangeText: {
//     color: '#555',
//     fontSize: 12,
//     fontWeight: '400',
//     fontFamily: 'Space Grotesk',
//   },
//   rangeTextActive: {
//     color: '#fff',
//     fontWeight: '600',
//   },

//   // Row untuk selectors
//   selectorRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   selectorWrapper: {
//     flex: 1,
//     marginHorizontal: 4,
//   },
//   selectorControl: {
//     width: '100%',
//     height: 32,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 6,
//   },

//   // ... styles lain (chartWrapper, card, dll.) tetap
// });
