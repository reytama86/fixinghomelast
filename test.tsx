import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { io } from "socket.io-client";

interface SensorData {
  temperature: number;
  humidity: number;
  light: number;
  soil: number;
  created_at?: string;
}


const App: React.FC = () => {
  // Sensor state
  const [temperature, setTemperature] = useState<number>(0);
  const [humidity, setHumidity] = useState<number>(0);
  const [light, setLight] = useState<number>(0);
  const [soil, setSoil] = useState<number>(0);
  // Slider state
  const [tempMin, setTempMin] = useState<number>(0);
  const [tempMax, setTempMax] = useState<number>(0);
  const [soilMin, setSoilMin] = useState<number>(0);
  const [soilMax, setSoilMax] = useState<number>(0);
  // Mode: false = manual, true = otomatis
  const [isAutomatic, setIsAutomatic] = useState<boolean>(false);
  // Toggle state
  const [isWaterOn, setIsWaterOn] = useState<boolean>(false);
  const [isFertilizerOn, setIsFertilizerOn] = useState<boolean>(false);

  // Inisialisasi koneksi Socket.IO untuk real-time update
  useEffect(() => {
    // Ganti "localhost" dengan IP server jika menggunakan perangkat fisik atau emulator yang memerlukan alamat khusus
    const socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    socket.on("sensorUpdate", (data: { type: string; value: string }) => {
      const val = Number(data.value);
      if (data.type === "temperature") {
        setTemperature(val);
      } else if (data.type === "humidity") {
        setHumidity(val);
      } else if (data.type === "light") {
        setLight(val);
      } else if (data.type === "soil") {
        setSoil(val);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fungsi toggling untuk mode, air, dan pupuk (sesuai kebutuhan)
  const toggleMode = () => setIsAutomatic((prev) => !prev);
  const toggleWater = () => {
    if (isAutomatic) return;
    setIsWaterOn((prev) => !prev);
  };
  const toggleFertilizer = () => {
    if (isAutomatic) return;
    setIsFertilizerOn((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sensorContainer}>
        <View style={[styles.sensorCard, styles.temperatureCard]}>
          <Text style={styles.sensorTitle}>Temperature</Text>
          <Text style={styles.sensorValue}>
            {temperature > 0 ? temperature.toFixed(2) + "°C" : "--"}
          </Text>
        </View>
        <View style={[styles.sensorCard, styles.humidityCard]}>
          <Text style={styles.sensorTitle}>Humidity</Text>
          <Text style={styles.sensorValue}>
            {humidity > 0 ? humidity.toFixed(2) + "%" : "--"}
          </Text>
        </View>
        <View style={[styles.sensorCard, styles.lightCard]}>
          <Text style={styles.sensorTitle}>Light</Text>
          <Text style={styles.sensorValue}>
            {light > 0 ? light + " Lux" : "--"}
          </Text>
        </View>
        <View style={[styles.sensorCard, styles.soilCard]}>
          <Text style={styles.sensorTitle}>Soil</Text>
          <Text style={styles.sensorValue}>
            {soil > 0 ? soil.toFixed(2) + "%" : "--"}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.sliderContainer} contentContainerStyle={styles.sliderContent}>
        <View style={styles.sliderGroup}>
          <Text style={styles.sliderLabel}>Temperature Min: {tempMin}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={tempMin}
            onValueChange={setTempMin}
            onSlidingComplete={(value: number) => console.log("Temperature Min:", value)}
            minimumTrackTintColor="#E74C3C"
            maximumTrackTintColor="#ecf0f1"
            thumbTintColor="#E74C3C"
          />
        </View>
        <View style={styles.sliderGroup}>
          <Text style={styles.sliderLabel}>Temperature Max: {tempMax}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={tempMax}
            onValueChange={setTempMax}
            onSlidingComplete={(value: number) => console.log("Temperature Max:", value)}
            minimumTrackTintColor="#E74C3C"
            maximumTrackTintColor="#ecf0f1"
            thumbTintColor="#E74C3C"
          />
        </View>
        <View style={styles.sliderGroup}>
          <Text style={styles.sliderLabel}>Soil Min: {soilMin}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={soilMin}
            onValueChange={setSoilMin}
            onSlidingComplete={(value: number) => console.log("Soil Min:", value)}
            minimumTrackTintColor="#2ECC71"
            maximumTrackTintColor="#ecf0f1"
            thumbTintColor="#2ECC71"
          />
        </View>
        <View style={styles.sliderGroup}>
          <Text style={styles.sliderLabel}>Soil Max: {soilMax}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={soilMax}
            onValueChange={setSoilMax}
            onSlidingComplete={(value: number) => console.log("Soil Max:", value)}
            minimumTrackTintColor="#2ECC71"
            maximumTrackTintColor="#ecf0f1"
            thumbTintColor="#2ECC71"
          />
        </View>
        <View style={styles.toggleContainer}>
          <TouchableOpacity style={styles.modeButton} onPress={toggleMode}>
            <Text style={styles.modeButtonText}>
              Mode: {isAutomatic ? "Otomatis" : "Manual"}
            </Text>
          </TouchableOpacity>
          <View style={styles.toggleSwitches}>
            <View style={styles.toggleItem}>
              <Text style={styles.toggleLabel}>Air</Text>
              <TouchableOpacity
                style={[styles.toggleSwitch, isWaterOn ? styles.toggleOn : styles.toggleOff]}
                onPress={toggleWater}
              >
                <View style={styles.toggleCircle} />
              </TouchableOpacity>
            </View>
            <View style={styles.toggleItem}>
              <Text style={styles.toggleLabel}>Pupuk</Text>
              <TouchableOpacity
                style={[styles.toggleSwitch, isFertilizerOn ? styles.toggleOn : styles.toggleOff]}
                onPress={toggleFertilizer}
              >
                <View style={styles.toggleCircle} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f9fc", padding: 20 },
  sensorContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  sensorCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderBottomWidth: 4,
  },
  sensorTitle: { fontSize: 16, fontWeight: "600", color: "#777", marginBottom: 10 },
  sensorValue: { fontSize: 28, fontWeight: "700", color: "#333" },
  temperatureCard: { borderBottomColor: "#E74C3C" },
  humidityCard: { borderBottomColor: "#3498DB" },
  lightCard: { borderBottomColor: "#F1C40F" },
  soilCard: { borderBottomColor: "#2ECC71" },
  sliderContainer: { flex: 1 },
  sliderContent: { paddingBottom: 30 },
  sliderGroup: { marginBottom: 30 },
  sliderLabel: { fontSize: 16, marginBottom: 10, color: "#555" },
  slider: { width: "100%", height: 40 },
  toggleContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    position: "relative",
  },
  modeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#8e44ad",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modeButtonText: { color: "#fff", fontWeight: "700" },
  toggleSwitches: { flexDirection: "row", justifyContent: "space-around", marginTop: 40 },
  toggleItem: { alignItems: "center" },
  toggleLabel: { fontSize: 16, marginBottom: 10, color: "#555" },
  toggleSwitch: { width: 50, height: 30, borderRadius: 15, justifyContent: "center", padding: 2 },
  toggleOn: { backgroundColor: "#27ae60", alignItems: "flex-end" },
  toggleOff: { backgroundColor: "#bdc3c7", alignItems: "flex-start" },
  toggleCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#fff" },
});

export default App;
