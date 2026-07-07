import React, {useEffect, useRef, useMemo} from 'react';
import {View, Text} from 'react-native';
import LottieView from 'lottie-react-native';
import {PowerButton} from '../PowerButton';
import styles from './styles'

interface WaterControlCardProps {
  title: string;
  animationSource: any;
  isActive: boolean;
  remaining: number;
  lastAction: Date | null;
  isDisabled?: boolean;
  onToggle: () => void;
}

export const WaterControlCard: React.FC<WaterControlCardProps> = ({
  title,
  animationSource,
  isActive,
  remaining,
  lastAction,
  isDisabled = false,
  onToggle,
}) => {
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (!lottieRef.current) return;
    if (isActive) {
      lottieRef.current.play();
    } else {
      lottieRef.current.pause();
    }
  }, [isActive]);

  const formatHelpers = useMemo(
    () => ({
      formatDate: (d: Date) => {
        const months = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
        ];
        return `${d.getDate().toString().padStart(2, '0')} ${
          months[d.getMonth()]
        } ${d.getFullYear()}`;
      },
      formatTime: (d: Date) =>
        `${d.getHours().toString().padStart(2, '0')}:${d
          .getMinutes()
          .toString()
          .padStart(2, '0')}`,
      formatDuration: (sec: number) => {
        const m = Math.floor(sec / 60)
          .toString()
          .padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
      },
    }),
    [],
  );

  const [label, value, time] = useMemo((): [string, string, string] => {
    if (remaining > 0) {
      return ['Watering in', 'progress', formatHelpers.formatDuration(remaining)];
    }

    if (lastAction) {
      return [
        'Last action',
        formatHelpers.formatDate(lastAction),
        formatHelpers.formatTime(lastAction),
      ];
    }

    return ['No recent', 'activity', ''];
  }, [remaining, lastAction, formatHelpers]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.infoWater}>
          <LottieView
            ref={lottieRef}
            source={animationSource}
            style={styles.lottie}
            loop
            renderMode="SOFTWARE"
            cacheComposition={true}
            hardwareAccelerationAndroid={false}
          />
          <View style={styles.infoDetails}>
            <Text style={styles.waterText}>{title}</Text>
            <Text style={styles.blockText}>
              {label} {value}
              {time ? ` · ${time}` : ''}
            </Text>
          </View>
        </View>
        <PowerButton isActive={isActive} onPress={onToggle} disabled={isDisabled} />
      </View>
    </View>
  );
};

export default WaterControlCard;