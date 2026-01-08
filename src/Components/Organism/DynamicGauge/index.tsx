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
    // Map ke range -15% sampai 115% agar 0 dan 100 mentok di merah
    
    if (type === 'temperature') {
      // Temperature: 0 = -15%, 26 = 50%, 100 = 115%
      const midVal = 26;
      
      if (val <= midVal) {
        // 0-26 mapped ke -15% sampai 50%
        return -15 + ((val / midVal) * 65); // -15 + (0 to 65)
      } else {
        // 27-100 mapped ke 50% sampai 115%
        return 50 + (((val - midVal) / (100 - midVal)) * 65); // 50 + (0 to 65)
      }
    } else if (type === 'humidity') {
      // Humidity: 0 = -15%, 75 = 50%, 100 = 115%
      const midVal = 75;
      
      if (val <= midVal) {
        // 0-75 mapped ke -15% sampai 50%
        return -15 + ((val / midVal) * 65); // -15 + (0 to 65)
      } else {
        // 76-100 mapped ke 50% sampai 115%
        return 50 + (((val - midVal) / (100 - midVal)) * 65); // 50 + (0 to 65)
      }
    }
    
    // Fallback
    const { min, max } = threshold;
    const clampedValue = Math.max(min, Math.min(max, val));
    return ((clampedValue - min) / (max - min)) * 100;
  };

  // Hitung posisi pada arc path berdasarkan persentase
  const getPointOnArc = (percentage: number) => {
    const centerX = 63.75;
    const centerY = 63.75;
    const radius = 66;
    
    const startAngle = Math.PI;
    const endAngle = 0;
    
    const angle = startAngle - (percentage / 100) * (startAngle - endAngle);
    
    const x = centerX + radius * Math.cos(angle);
    const y = centerY - radius * Math.sin(angle);

    return { x, y };
  };

  const percentage = calculatePercentage(value);
  const ellipsPosition = getPointOnArc(percentage);

  const ellipsWidth = 13;
  const ellipsHeight = 14;

  const shouldFlip = percentage < 50;

  // Hitung rotasi dinamis berdasarkan nilai dan tipe
  const getRotation = (): string => {
    if (type === 'temperature') {
      if (value <= 2) {
        const progress = value / 19;
        const rotation = 85 + (progress * 20);
        return `${rotation}deg`;
      }else if (value <= 5) {
        const progress = value / 19;
        const rotation = 70 + (progress * 20);
        return `${rotation}deg`;
      }else if (value <= 8) {
        const progress = value / 19;
        const rotation = 40 + (progress * 20);
        return `${rotation}deg`;
      }
      else if (value <= 10) {
        const progress = value / 19;
        const rotation = 10 + (progress * 20);
        return `${rotation}deg`;
      }
       else if (value >= 11 && value <= 12) {
        const progress = (value - 20) / 3;
        const rotation = 45 + (progress * 10);
        return `${rotation}deg`;
      }
       else if (value >= 20 && value <= 21.99) {
        const progress = (value - 20) / 3;
        const rotation = -20 + (progress * 10);
        return `${rotation}deg`;
      }
      else if (value >= 22 && value <= 23.99) {
        const progress = (value - 20) / 3;
        const rotation = -35 + (progress * 10);
        return `${rotation}deg`;
      }
      else if (value >= 24 && value <= 26.99) {
        const progress = (value - 24) / 2;
        const rotation = -35 + (progress * 5);
        return `${rotation}deg`;
      } else if (value >= 27 && value <= 35.99) {
        const progress = (value - 27) / 8;
        const rotation = progress * 15;
        return `${rotation}deg`;
      } else if (value >= 36) {
        const progress = Math.min((value - 36) / 64, 1);
        const rotation = 15 + (progress * 20);
        return `${rotation}deg`;
      }
    } else if (type === 'humidity') {
      if (value <= 50) {
        const progress = value / 50;
        const rotation = -35 + (progress * 20);
        return `${rotation}deg`;
      } else if (value >= 51 && value <= 59) {
        const progress = (value - 51) / 8;
        const rotation = -15 + (progress * 10);
        return `${rotation}deg`;
      } else if (value >= 60 && value <= 75) {
        const progress = (value - 60) / 15;
        const rotation = -5 + (progress * 5);
        return `${rotation}deg`;
      } else if (value >= 76 && value <= 80) {
        const progress = (value - 76) / 4;
        const rotation = progress * 15;
        return `${rotation}deg`;
      } else if (value >= 81) {
        const progress = Math.min((value - 81) / 19, 1);
        const rotation = 15 + (progress * 20);
        return `${rotation}deg`;
      }
    }
    return '0deg';
  };

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
          left: ellipsPosition.x - ellipsWidth / 2,
          top: ellipsPosition.y - ellipsHeight / 2,
          transform: [
            { scaleX: shouldFlip ? -1 : 1 },
            { rotate: getRotation() }
          ],
        }}
      >
        <Svg width={ellipsWidth} height={ellipsHeight} viewBox="0 0 17 18" fill="none">
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