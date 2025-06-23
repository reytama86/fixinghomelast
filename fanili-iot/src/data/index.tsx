/**
 * @format
 */
import { Buffer } from "buffer";
global.Buffer = Buffer;

// Polyfill untuk window.location (diperlukan oleh paho-mqtt)
declare var window: any;
if (typeof window === "undefined") {
  global.window = {} as any;
}
if (!window.location) {
  window.location = { protocol: "file:" } as any;
}

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import Slider from "@react-native-community/slider";
import * as Paho from "paho-mqtt";

interface SensorMessage {
  timestamp: number;
  temperature: number;
  humidity: number;
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
  // MQTT state
  const [isConnected, setIsConnected] = useState<boolean>(false);
  // Toggle state
  const [isWaterOn, setIsWaterOn] = useState<boolean>(false);
  const [isFertilizerOn, setIsFertilizerOn] = useState<boolean>(false);
  // Mode: false = manual, true = otomatis
  const [isAutomatic, setIsAutomatic] = useState<boolean>(false);
  const clientRef = useRef<Paho.Client | null>(null);

  useEffect(() => {
    const client = new Paho.Client(
      "broker.emqx.io",
      8083,
      "clientId-" + Math.floor(Math.random() * 1000)
    );
    clientRef.current = client;

    const onMessage = (message: Paho.Message) => {
      const topic = message.destinationName;
      const payload = parseFloat(message.payloadString);
      if (isNaN(payload)) {
        console.warn(`Invalid number on topic ${topic}: ${message.payloadString}`);
        return;
      }
      // Update state berdasarkan topik
      switch (topic) {
        case "sensor/data/921892819282":
          setTemperature(payload);
          break;
        case "sensor/data/9218928192812":
          setHumidity(payload);
          break;
        case "sensor/data/9218928192813":
          setLight(payload);
          break;
        case "sensor/data/9218928192814":
          setSoil(payload);
          break;
        default:
          break;
      }
    };

    client.connect({
      onSuccess: () => {
        setIsConnected(true);
        // Subscribe ke topik sensor
        client.subscribe("sensor/data/921892819282"); // Temperature
        client.subscribe("sensor/data/9218928192812"); // Humidity
        client.subscribe("sensor/data/9218928192813"); // Light
        client.subscribe("sensor/data/9218928192814"); // Soil
        client.onMessageArrived = onMessage;
      },
      onFailure: (err: any) => {
        console.error("Connection failed:", err);
      },
    });

    return () => {
      client.disconnect();
    };
  }, []);

  const publishValue = (topicSuffix: string, value: number) => {
    if (!isConnected || !clientRef.current) {
      Alert.alert("Error", "MQTT client belum terkoneksi");
      return;
    }
    const msg = new Paho.Message(value.toString());
    msg.destinationName = `sensor/data/${topicSuffix}`;
    clientRef.current.send(msg);
  };

  const toggleMode = () =>
    setIsAutomatic((prev) => {
      const newMode = !prev;
      publishValue("921892819286", newMode ? 0 : 1);
      return newMode;
    });

  const toggleWater = () => {
    if (isAutomatic) return;
    setIsWaterOn((prev) => {
      const newState = !prev;
      publishValue("921892819287", newState ? 1 : 0);
      return newState;
    });
  };

  const toggleFertilizer = () => {
    if (isAutomatic) return;
    setIsFertilizerOn((prev) => {
      const newState = !prev;
      publishValue("921892819287", newState ? 2 : 0);
      return newState;
    });
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
            onSlidingComplete={(value: number) => publishValue("921892819286", value)}
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
            onSlidingComplete={(value: number) => publishValue("921892819283", value)}
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
            onSlidingComplete={(value: number) => publishValue("921892819284", value)}
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
            onSlidingComplete={(value: number) => publishValue("921892819285", value)}
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
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  sensorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
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
  sensorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#777",
    marginBottom: 10,
  },
  sensorValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
  },
  temperatureCard: {
    borderBottomColor: "#E74C3C",
  },
  humidityCard: {
    borderBottomColor: "#3498DB",
  },
  lightCard: {
    borderBottomColor: "#F1C40F",
  },
  soilCard: {
    borderBottomColor: "#2ECC71",
  },
  sliderContainer: {
    flex: 1,
  },
  sliderContent: {
    paddingBottom: 30,
  },
  sliderGroup: {
    marginBottom: 30,
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: "#555",
  },
  slider: {
    width: "100%",
    height: 40,
  },
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
  modeButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  toggleSwitches: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 40,
  },
  toggleItem: {
    alignItems: "center",
  },
  toggleLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: "#555",
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    padding: 2,
  },
  toggleOn: {
    backgroundColor: "#27ae60",
    alignItems: "flex-end",
  },
  toggleOff: {
    backgroundColor: "#bdc3c7",
    alignItems: "flex-start",
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
  },
});

export default App;
