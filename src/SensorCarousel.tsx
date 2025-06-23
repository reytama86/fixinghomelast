import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  ViewStyle,
} from "react-native";

const { width } = Dimensions.get("window");
const OFFSET = 20;
const SLIDE_SPACING = 20;
// Hitung lebar slide dengan mengurangi OFFSET dan spacing
const SLIDE_WIDTH = width - OFFSET * 2 - SLIDE_SPACING;
// Gunakan snapToInterval = SLIDE_WIDTH + SLIDE_SPACING,
// sehingga padding samping harus disesuaikan:
const SIDE_PADDING = (width - (SLIDE_WIDTH + SLIDE_SPACING)) / 2;

export interface SensorItem {
  title: string;
  value: number | string;
  unit?: string;
  borderColor: string;
}

interface SensorCarouselProps {
  sensors: SensorItem[];
}

const SensorCarousel: React.FC<SensorCarouselProps> = ({ sensors }) => {
  // Grouping: slide 1 = 4, slide 2 = 4, slide 3 = 2
  const grouping = [4, 4, 2];
  let start = 0;
  const slides: SensorItem[][] = grouping.map((count) => {
    const slide = sensors.slice(start, start + count);
    start += count;
    return slide;
  });

  const getCardStyle = (itemsCount: number): ViewStyle => ({ width: "48%" });

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        snapToInterval={SLIDE_WIDTH + SLIDE_SPACING}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingHorizontal: SIDE_PADDING },
        ]}
      >
        {slides.map((slide, slideIndex) => (
          <View
            style={[
              styles.slide,
              {
                width: SLIDE_WIDTH,
                marginRight: SLIDE_SPACING, // Tetap beri jarak antar slide
              },
            ]}
            key={`slide-${slideIndex}`}
          >
            {slide.map((sensor, idx) => (
              <View
                style={[
                  styles.sensorCard,
                  getCardStyle(slide.length),
                  { borderBottomColor: sensor.borderColor },
                ]}
                key={`sensor-${slideIndex}-${idx}`}
              >
                <Text style={styles.sensorTitle}>{sensor.title}</Text>
                <Text style={styles.sensorValue}>
                  {sensor.value !== null && sensor.value !== undefined
                    ? sensor.value
                    : "--"}{" "}
                  {sensor.unit || ""}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    paddingVertical: 25,
    marginBottom: 20,
    marginLeft: -15
  },
  scrollContainer: {
    // paddingHorizontal disetel melalui SIDE_PADDING
  },
  slide: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  sensorCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    borderBottomWidth: 5,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
    textAlign: "center",
  },
  sensorValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
  },
});

export default SensorCarousel;
