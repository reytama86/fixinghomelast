import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Svg, {
  G,
  Path,
  ClipPath,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';

interface ThresholdConfig {
  min: number;
  max: number;
  idealMin: number;
  idealMax: number;
}

interface DynamicGaugeProps {
  value: number;
  type: 'temperature' | 'humidity';
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

const THRESHOLDS: Record<'temperature' | 'humidity', ThresholdConfig> = {
  temperature: {
    min: 20,
    max: 35,
    idealMin: 24,
    idealMax: 26,
  },
  humidity: {
    min: 50,
    max: 80,
    idealMin: 60,
    idealMax: 75,
  },
};

const DynamicGauge: React.FC<DynamicGaugeProps> = ({
  value,
  type,
  width = 127,
  height = 106,
  style,
}) => {
  const threshold = THRESHOLDS[type];

  // Fungsi untuk menghitung persentase posisi value dalam range
  const calculatePercentage = (val: number): number => {
    const { min, max } = threshold;
    const clampedValue = Math.max(min, Math.min(max, val));
    return ((clampedValue - min) / (max - min)) * 100;
  };

  // Hitung posisi pada arc path berdasarkan persentase
  const getPointOnArc = (percentage: number) => {
    // Parameter arc dari SVG path
    // Gauge adalah semicircle dari 180° (kiri) ke 0° (kanan)
    const centerX = 63.75; // Pusat arc (dari analisis path)
    const centerY = 63.75; // Pusat Y arc
    const radius = 53.57; // Radius arc (dari path: sqrt((63.75)^2 + (63.75)^2) ≈ 53.57)
    
    // Konversi percentage ke angle (0% = 180°, 100% = 0°)
    const startAngle = 180; // Mulai dari kiri (180°)
    const endAngle = 0; // Sampai kanan (0°)
    const angle = startAngle - (percentage / 100) * (startAngle - endAngle);
    
    // Konversi angle ke radian
    const radian = (angle * Math.PI) / 180;
    
    // Hitung koordinat X, Y pada lingkaran
    const x = centerX + radius * Math.cos(radian);
    const y = centerY - radius * Math.sin(radian);
    
    return { x, y };
  };

  const percentage = calculatePercentage(value);
  const ellipsPosition = getPointOnArc(percentage);

  return (
    <View style={[{ width, height, position: 'relative' }, style]}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 127 106"
        fill="none"
        style={{ position: 'absolute' }}
      >
        <Defs>
          <ClipPath id="clip">
            <Path
              d="M104.699 103.949C106.686 105.936 109.927 105.949 111.748 103.807C118.68 95.6529 123.441 85.8428 125.539 75.2907C127.97 63.0699 126.723 50.4027 121.954 38.8909C117.186 27.3792 109.111 17.5399 98.7509 10.6174C88.3906 3.69489 76.2102 5.69377e-07 63.75 0C51.2898 -5.69377e-07 39.1094 3.69488 28.7491 10.6174C18.3888 17.5399 10.3139 27.3792 5.54559 38.8909C0.777269 50.4027 -0.470342 63.0699 1.96053 75.2907C4.05947 85.8428 8.81952 95.6529 15.7522 103.807C17.5731 105.949 20.8136 105.936 22.8014 103.949C24.7891 101.961 24.7674 98.7524 22.9801 96.5826C17.4536 89.8734 13.6507 81.8814 11.9447 73.3047C9.90666 63.0586 10.9527 52.4382 14.9505 42.7866C18.9483 33.135 25.7184 24.8856 34.4047 19.0816C43.0909 13.2777 53.3032 10.1798 63.75 10.1798C74.1968 10.1798 84.4091 13.2777 93.0953 19.0816C101.782 24.8856 108.552 33.135 112.549 42.7866C116.547 52.4382 117.593 63.0586 115.555 73.3047C113.849 81.8814 110.046 89.8734 104.52 96.5826C102.733 98.7524 102.711 101.961 104.699 103.949Z"
            />
          </ClipPath>
          <RadialGradient
            id="gradient"
            cx="15"
            cy="120"
            rx="150"
            ry="200"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0.127" stopColor="#FF0000" />
            <Stop offset="0.247" stopColor="#FF5D00" />
            <Stop offset="0.357" stopColor="#FFD000" />
            <Stop offset="0.495" stopColor="#FFF200" />
            <Stop offset="0.626" stopColor="#99FF00" />
            <Stop offset="0.744" stopColor="#6AFF00" />
            <Stop offset="0.873" stopColor="#79FF9D" />
          </RadialGradient>
        </Defs>
        <G clipPath="url(#clip)">
          <Path
            d="M104.699 103.949C106.686 105.936 109.927 105.949 111.748 103.807C118.68 95.6529 123.441 85.8428 125.539 75.2907C127.97 63.0699 126.723 50.4027 121.954 38.8909C117.186 27.3792 109.111 17.5399 98.7509 10.6174C88.3906 3.69489 76.2102 5.69377e-07 63.75 0C51.2898 -5.69377e-07 39.1094 3.69488 28.7491 10.6174C18.3888 17.5399 10.3139 27.3792 5.54559 38.8909C0.777269 50.4027 -0.470342 63.0699 1.96053 75.2907C4.05947 85.8428 8.81952 95.6529 15.7522 103.807C17.5731 105.949 20.8136 105.936 22.8014 103.949C24.7891 101.961 24.7674 98.7524 22.9801 96.5826C17.4536 89.8734 13.6507 81.8814 11.9447 73.3047C9.90666 63.0586 10.9527 52.4382 14.9505 42.7866C18.9483 33.135 25.7184 24.8856 34.4047 19.0816C43.0909 13.2777 53.3032 10.1798 63.75 10.1798C74.1968 10.1798 84.4091 13.2777 93.0953 19.0816C101.782 24.8856 108.552 33.135 112.549 42.7866C116.547 52.4382 117.593 63.0586 115.555 73.3047C113.849 81.8814 110.046 89.8734 104.52 96.5826C102.733 98.7524 102.711 101.961 104.699 103.949Z"
            fill="url(#gradient)"
          />
        </G>
      </Svg>

      {/* Ellips Indicator */}
      <View
        style={{
          position: 'absolute',
          left: ellipsPosition.x - 6.5, // Center ellips (width 13 / 2)
          top: ellipsPosition.y - 7, // Center ellips (height 14 / 2)
        }}
      >
        <Svg width={13} height={14} viewBox="0 0 13 14" fill="none">
          <G filter="url(#filter0_dii_76_958)">
            <Path
              d="M11.4118 4.70588C11.4118 7.30487 9.30494 9.41177 6.70595 9.41177L2 10L2.00007 4.70588C2.00007 2.1069 4.10696 0 6.70595 0L6.11771 5.29412L11.4118 4.70588Z"
              fill="#EDEFF2"
            />
          </G>
        </Svg>
      </View>
    </View>
  );
};

export default DynamicGauge;