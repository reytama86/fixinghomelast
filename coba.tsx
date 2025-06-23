// /**
//  * @format
//  */
// import { Buffer } from "buffer";
// global.Buffer = Buffer;

// // Polyfill untuk window.location (diperlukan oleh paho-mqtt)
// declare var window: any;
// if (typeof window === "undefined") {
//   global.window = {} as any;
// }
// if (!window.location) {
//   window.location = { protocol: "file:" } as any;
// }

// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Alert,
//   TouchableOpacity,
//   Modal,
//   Pressable,
//   SafeAreaView,
//   TouchableHighlight
// } from "react-native";
// import Slider from "@react-native-community/slider";
// import * as Paho from "paho-mqtt";
// import { io } from "socket.io-client";
// import SensorCarousel, { SensorItem } from "../src/SensorCarousel";
// import DateTimePicker from "@react-native-community/datetimepicker"

// const Home: React.FC = (props) => {
//   // Sensor states
//   const [temperature, setTemperature] = useState<number>(0);
//   const [humidity, setHumidity] = useState<number>(0);
//   const [light, setLight] = useState<number>(0);
//   const [soil, setSoil] = useState<number>(0);

//   // Slider states
//   const [tempMin, setTempMin] = useState<number>(0);
//   const [tempMax, setTempMax] = useState<number>(0);
//   const [soilMin, setSoilMin] = useState<number>(0);
//   const [soilMax, setSoilMax] = useState<number>(0);

//   const {defaultDate, onDataChange} = props

//   // Set time 
//   const [date, setDate] = useState<Date>(new Date(defaultDate));
//   const [show, setShow] = useState(false)

//   const onChange = (e, selectedDate) => {
//     setShow(false)
//     if(selectedDate){
//       setDate(new Date(selectedDate))
//     }
//   }

//   const onAndroidChange = (e, selectedDate) => {
//     setShow(false)
//     if (selectedDate) {
//       setDate(new date(selectedDate))
//     }
//   }
  

//   const renderDatePicker = () => {
//     <>
//       <DateTimePicker
//         display={Platform.os == 'ios' ? 'spinner' : 'default'}
//         timeZoneOffsetInMinutes={0}
//         value={new Date(date)}
//         mode="date"
//         minimumDate={new Date (1920, 10, 20)}
//         maximumDate={new Date()}
//         onChange={Platform.os == 'ios' ? onChange : onAndroidChange}
//       />
//     </>
//   }
//   // MQTT and control states
//   const [isConnected, setIsConnected] = useState<boolean>(false);
//   const [isWaterOn, setIsWaterOn] = useState<boolean>(false);
//   const [isFertilizerOn, setIsFertilizerOn] = useState<boolean>(false);
//   const [isAutomatic, setIsAutomatic] = useState<boolean>(false);
//   const clientRef = useRef<Paho.Client | null>(null);

//   useEffect(() => {
//     const client: any = new Paho.Client(
//       "broker.emqx.io",
//       8083,
//       "clientId-" + Math.floor(Math.random() * 1000)
//     );
//     clientRef.current = client;

//     client.onConnectionLost = (responseObject: any) => {
//       console.log("MQTT connection lost:", responseObject.errorMessage);
//       setIsConnected(false);
//       // Coba reconnect setelah 5 detik
//       setTimeout(() => {
//         if (clientRef.current) {
//           (clientRef.current as any).connect({
//             onSuccess: () => {
//               setIsConnected(true);
//               console.log("Reconnected to MQTT broker");
//               (clientRef.current as any).subscribe("sensor/data/1106200396");
//               (clientRef.current as any).subscribe("sensor/data/110620039614");
//               (clientRef.current as any).subscribe("sensor/data/110620039615");
//               (clientRef.current as any).subscribe("sensor/data/921892819284");
//               (clientRef.current as any).subscribe("sensor/data/921892819285");
//             },
//             onFailure: (err: any) => {
//               console.error("Reconnect failed:", err);
//             },
//           });
//         }
//       }, 5000);
//     };

//     const socket = io("http://localhost:4646");
//     socket.on("connect", () => {
//       console.log("Connected to Socket.IO server");
//     });
//     socket.on("sensorUpdate", (data: { type: string; value: string }) => {
//       const val = Number(data.value);
//       if (data.type === "temperature") {
//         setTemperature(val);
//       } else if (data.type === "humidity") {
//         setHumidity(val);
//       } else if (data.type === "light") {
//         setLight(val);
//       } else if (data.type === "soil") {
//         setSoil(val);
//       }
//     });

//     client.connect({
//       onSuccess: () => {
//         setIsConnected(true);
//         console.log("MQTT connected");
//         (clientRef.current as any).subscribe("sensor/data/1106200396");
//         (clientRef.current as any).subscribe("sensor/data/110620039614");
//         (clientRef.current as any).subscribe("sensor/data/110620039615");
//         (clientRef.current as any).subscribe("sensor/data/921892819284");
//         (clientRef.current as any).subscribe("sensor/data/921892819285");
//       },
//       onFailure: (err: any) => {
//         console.error("Connection failed:", err);
//       },
//     });

//     return () => {
//       if (clientRef.current && (clientRef.current as any).connected) {
//         (clientRef.current as any).disconnect();
//       }
//     };
//   }, []);

//   const publishValue = (topicSuffix: string, value: number) => {
//     if (!isConnected || !clientRef.current) {
//       Alert.alert("Error", "MQTT client belum terkoneksi");
//       return;
//     }
//     const msg = new Paho.Message(value.toString());
//     msg.destinationName = `sensor/data/${topicSuffix}`;
//     (clientRef.current as any).send(msg);
//   };

//   const toggleMode = () =>
//     setIsAutomatic((prev) => {
//       const newMode = !prev;
//       publishValue("110620039611", newMode ? 0 : 1);
//       return newMode;
//     });

//   const toggleWater = () => {
//     if (isAutomatic) return;
//     setIsWaterOn((prev) => {
//       const newState = !prev;
//       publishValue("1106200396", newState ? 1 : 0);
//       return newState;
//     });
//   };

//   const toggleFertilizer = () => {
//     if (isAutomatic) return;
//     setIsFertilizerOn((prev) => {
//       const newState = !prev;
//       publishValue("110620039613", newState ? 1 : 0);
//       return newState;
//     });
//   };

//   // Data sensor untuk slider carousel (total 10 box)
//   const sensors: SensorItem[] = [
//     {
//       title: "Temperature",
//       value: temperature > 0 ? temperature.toFixed(2) : "--",
//       unit: "°C",
//       borderColor: "#E74C3C",
//     },
//     {
//       title: "Humidity",
//       value: humidity > 0 ? humidity.toFixed(2) : "--",
//       unit: "%",
//       borderColor: "#3498DB",
//     },
//     {
//       title: "Light",
//       value: light > 0 ? light.toString() : "--",
//       unit: "Lux",
//       borderColor: "#F1C40F",
//     },
//     {
//       title: "Temperature Soil",
//       value: soil > 0 ? soil.toFixed(2) : "--",
//       unit: "°C",
//       borderColor: "#9B59B6",
//     },
//     {
//       title: "Humidity Soil",
//       value: soil > 0 ? soil.toFixed(2) : "--",
//       unit: "%",
//       borderColor: "#1ABC9C",
//     },
//     {
//       title: "Conductivity",
//       value: "--",
//       unit: "µS/cm",
//       borderColor: "#34495E",
//     },
//     {
//       title: "PH",
//       value: "--",
//       unit: "",
//       borderColor: "#F39C12",
//     },
//     {
//       title: "N",
//       value: "--",
//       unit: "mg/L",
//       borderColor: "#2ECC71",
//     },
//     {
//       title: "P",
//       value: "--",
//       unit: "mg/L",
//       borderColor: "#E67E22",
//     },
//     {
//       title: "K",
//       value: "--",
//       unit: "mg/L",
//       borderColor: "#C0392B",
//     },
//   ];

//   return (
//     <SafeAreaView>
//     <View style={styles.container}>
//       <SensorCarousel sensors={sensors} />
//       <ScrollView
//         style={styles.sliderContainer}
//         contentContainerStyle={styles.sliderContent}
//       >
//         {/* Container untuk slider Temperature Max dan Soil Min secara sebaris */}
//         <View style={styles.rowContainer}>
//           <View style={styles.sliderGroup}>
//             <Text style={styles.sliderLabel}>
//               Temperature Max: {tempMax}
//             </Text>
//             <Slider
//               style={styles.slider}
//               minimumValue={0}
//               maximumValue={100}
//               step={1}
//               value={tempMax}
//               onValueChange={setTempMax}
//               onSlidingComplete={(value: number) =>
//                 publishValue("110620039615", value)
//               }
//               minimumTrackTintColor="#E74C3C"
//               maximumTrackTintColor="#ecf0f1"
//               thumbTintColor="#E74C3C"
//             />
//           </View>
//           <View style={styles.sliderGroup}>
//             <Text style={styles.sliderLabel}>Soil Min: {soilMin}</Text>
//             <Slider
//               style={styles.slider}
//               minimumValue={0}
//               maximumValue={100}
//               step={1}
//               value={soilMin}
//               onValueChange={setSoilMin}
//               onSlidingComplete={(value: number) =>
//                 publishValue("110620039616", value)
//               }
//               minimumTrackTintColor="#2ECC71"
//               maximumTrackTintColor="#ecf0f1"
//               thumbTintColor="#2ECC71"
//             />
//           </View>
//         <Pressable
//         style={styles.box}
//         onPress={() => {setShow(true)}}
//         activeOpacity={0}
//         >
//           <View>
//             <Text style={styles.text}>{`${date.getFullYear()}${
//               date.getMonth() + 1
//             }${date.getDate()}`</Text>
//             {Platform.os =/= "ios" && show && renderDatePicker()}
//             {Platform.os == "ios" && (
//               <Modal transparent={True}
//               animationType="slide"
//               visible={show}
//               supportedOrientations={["portrait"]}
//               onRequestClose={()=>setShow(!show)}
//             >
//               <View style={styles.screen}>
//                 <TouchableHighlight underlayColor={"#fff"}
//                 style={styles.pickerContainer}
//                 <View>
//                   <View>
//                     <TouchableHighlight underlayColor={'transparent'} onPress={onCancelPress} style = {{styles.btnText, styles.btnCancel}}>
//                     </TouchableHighlight>
//                   </View>
//                 </View>
//                 </TouchableHighlight>
//               </View>
//             </Modal>
//             )

//             }            
//             }}

//             </Text>
//           </View>
//         </Pressable>
//         </View>
//         {/* Tempatkan slider dan kontrol lainnya jika diperlukan */}
//         <View style={styles.toggleContainer}>
//           <TouchableOpacity style={styles.modeButton} onPress={toggleMode}>
//             <Text style={styles.modeButtonText}>
//               Mode: {isAutomatic ? "Otomatis" : "Manual"}
//             </Text>
//           </TouchableOpacity>
//           <View style={styles.toggleSwitches}>
//             <View style={styles.toggleItem}>
//               <Text style={styles.toggleLabel}>Air</Text>
//               <TouchableOpacity
//                 style={[
//                   styles.toggleSwitch,
//                   isWaterOn ? styles.toggleOn : styles.toggleOff,
//                 ]}
//                 onPress={toggleWater}
//               >
//                 <View style={styles.toggleCircle} />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.toggleItem}>
//               <Text style={styles.toggleLabel}>Pupuk</Text>
//               <TouchableOpacity
//                 style={[
//                   styles.toggleSwitch,
//                   isFertilizerOn ? styles.toggleOn : styles.toggleOff,
//                 ]}
//                 onPress={toggleFertilizer}
//               >
//                 <View style={styles.toggleCircle} />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f7f9fc",
//     padding: 20,
//   },
//   sliderContainer: {
//     flex: 1,
//     marginTop: -10,
//   },
//   sliderContent: {
//     paddingBottom: 30,
//   },
//   rowContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 25,
//   },
//   sliderGroup: {
//     width: "48%",
//     marginHorizontal: 5,
//   },  
//   sliderLabel: {
//     fontSize: 16,
//     marginBottom: 8,
//     color: "#555",
//   },
//   slider: {
//     width: "100%",
//     height: 40,
//   },
//   toggleContainer: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 15,
//     marginTop: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//     position: "relative",
//   },
//   modeButton: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     backgroundColor: "#8e44ad",
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   modeButtonText: {
//     color: "#fff",
//     fontWeight: "700",
//   },
//   toggleSwitches: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginTop: 45,
//   },
//   toggleItem: {
//     alignItems: "center",
//   },
//   toggleLabel: {
//     fontSize: 16,
//     marginBottom: 10,
//     color: "#555",
//   },
//   toggleSwitch: {
//     width: 50,
//     height: 30,
//     borderRadius: 15,
//     justifyContent: "center",
//     padding: 2,
//   },
//   toggleOn: {
//     backgroundColor: "#27ae60",
//     alignItems: "flex-end",
//   },
//   toggleOff: {
//     backgroundColor: "#bdc3c7",
//     alignItems: "flex-start",
//   },
//   toggleCircle: {
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     backgroundColor: "#fff",
//   },
// });

// export default Home;
