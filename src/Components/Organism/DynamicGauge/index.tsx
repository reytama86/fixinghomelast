import React, { useMemo } from 'react';
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
    min: 0,
    max: 100,
    idealMin: 24,
    idealMax: 26,
  },
  humidity: {
    min: 0,
    max: 100,
    idealMin: 60,
    idealMax: 75,
  },
};

const GAUGE_CONFIG = {
  centerX: 63.75,
  centerY: 63.75,
  radius: 66,
  startAngle: Math.PI,
  endAngle: 0,
  indicatorWidth: 13,
  indicatorHeight: 14,
  extendedMin: -15,
  extendedMax: 115,
};

const DynamicGauge: React.FC<DynamicGaugeProps> = ({
  value,
  type,
  width = 127,
  height = 106,
  style,
}) => {
  const threshold = useMemo(() => THRESHOLDS[type], [type]);

  const calculatePercentage = useMemo(() => {
    const { extendedMin, extendedMax } = GAUGE_CONFIG;
    const midPoint = type === 'temperature' ? 26 : 75;
    const maxValue = 100;
    
    const clampedValue = Math.max(0, Math.min(maxValue, value));
    
    if (clampedValue <= midPoint) {
      return extendedMin + ((clampedValue / midPoint) * (50 - extendedMin));
    } else {
      const progress = (clampedValue - midPoint) / (maxValue - midPoint);
      return 50 - (progress * (50 - extendedMin)); 
    }
  }, [value, type]);

  /**
   * Hitung posisi X,Y pada arc berdasarkan persentase
   */
  const indicatorPosition = useMemo(() => {
    const { centerX, centerY, radius, startAngle, endAngle } = GAUGE_CONFIG;
    const angle = startAngle - (calculatePercentage / 100) * (startAngle - endAngle);
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY - radius * Math.sin(angle),
    };
  }, [calculatePercentage]);

  /**
   * Hitung rotasi indikator berdasarkan nilai dan tipe
   * Menggunakan interpolasi linear untuk transisi smooth
   * Setelah ideal max, rotasi balik ke kanan (mirror effect)
   */
  const getRotation = useMemo((): string => {
    const interpolate = (val: number, ranges: Array<[number, number, number, number]>): number => {
      for (const [min, max, startRot, endRot] of ranges) {
        if (val >= min && val <= max) {
          const progress = (val - min) / (max - min);
          return startRot + (progress * (endRot - startRot));
        }
      }
      return 0;
    };

    if (type === 'temperature') {
      const ranges: Array<[number, number, number, number]> = [
        [0, 10, 85, 10],
        [10, 20, 10, -20],
        [20, 24, -20, -35],
        [24, 25.4, -35, -35], 
        [25.5, 25.9, -40,-35],
        [26, 100, -40, 15],
        [100, 100, 15, 85],
      ];
      return `${interpolate(value, ranges)}deg`;
    } else {
      const ranges: Array<[number, number, number, number]> = [
        [0, 29, -35, -15],
        [30, 35, 20, -15],
        [36, 40, 20, -15],
        [50, 60, -15, -5],
        [60, 75, -5, -40], 
        [76, 77, -30, -30],
        [78, 80, -30, 0],
        [81, 88, -15, 0],
        [89, 92, 15, 35],
        [93, 94, 40, 35],
        [95.0, 95.9, 50, 35],
        [96.0, 96.9, 70, 35],
        [97, 100, 70, 70],
      ];
      return `${interpolate(value, ranges)}deg`;
    }
  }, [value, type]);

  const shouldFlip = calculatePercentage < 50;

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

      <View
        style={{
          position: 'absolute',
          left: indicatorPosition.x - GAUGE_CONFIG.indicatorWidth / 2,
          top: indicatorPosition.y - GAUGE_CONFIG.indicatorHeight / 2,
          transform: [
            { scaleX: shouldFlip ? -1 : 1 },
            { rotate: getRotation }
          ],
        }}
      >
        <Svg 
          width={GAUGE_CONFIG.indicatorWidth} 
          height={GAUGE_CONFIG.indicatorHeight} 
          viewBox="0 0 17 18" 
          fill="none"
        >
          <G filter="url(#filter0_dii_76_958)">
            <Path
              d="M14.9231 6.11765C14.9231 9.48719 12.2453 12.2353 8.76923 12.2353L2.61538 13L2.61546 6.11765C2.61546 2.74811 5.29326 0 8.76923 0L7.98462 6.88235L14.9231 6.11765Z"
              fill="#B8BCC4"
            />
          </G>
        </Svg>
      </View>
    </View>
  );
};

export default DynamicGauge;