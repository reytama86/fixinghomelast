import React, {useEffect, useRef, useMemo} from 'react';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import LottieView from 'lottie-react-native';
import { PowerOffIcon } from '@Assets/svg/Static';
import { PowerOnIcon } from '@Assets/svg/Static';
import {styles} from './styles';

interface ControlState {
  isWaterOn: boolean;
  isFertilizerOn: boolean;
  remainingWaterTime: number;
  remainingFertTime: number;
  lastWaterAction: Date | null;
  lastFertAction: Date | null;
}

interface ControlCentreProps {
  controlState: ControlState;
  isBlock1AnyActive: boolean;
  onToggle: (type: 'water' | 'fertilizer') => void;
  onStop: (type: 'water' | 'fertilizer') => void;
}

const ControlCentre: React.FC<ControlCentreProps> = ({
  controlState,
  isBlock1AnyActive,
  onToggle,
  onStop,
}) => {
  const waterLottieRef = useRef<LottieView>(null);
  const fertLottieRef = useRef<LottieView>(null);

  const formatFunctions = useMemo(
    () => ({
      formatDateForAndroid: (date: Date) => {
        const months = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
        ];
        const day = date.getDate().toString().padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
      },
      formatTimeForAndroid: (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      },
      formatTime: (totalSeconds: number): string => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`;
      },
    }),
    [],
  );

  const {formatDateForAndroid, formatTimeForAndroid, formatTime} = formatFunctions;

  useEffect(() => {
    const updateAnimations = () => {
      try {
        if (waterLottieRef.current) {
          if (controlState.isWaterOn) {
            waterLottieRef.current.play();
          } else {
            waterLottieRef.current.pause();
          }
        }

        if (fertLottieRef.current) {
          if (controlState.isFertilizerOn) {
            fertLottieRef.current.play();
          } else {
            fertLottieRef.current.pause();
          }
        }
      } catch (error) {
        console.error('Error controlling animations:', error);
      }
    };

    updateAnimations();
  }, [controlState.isWaterOn, controlState.isFertilizerOn]);

  const handleToggle = (type: 'water' | 'fertilizer') => {
    if (isBlock1AnyActive) {
      Alert.alert(
        'Block 1 Active',
        'Terdapat proses penyiraman atau pemupukan aktif di Detail Block One. Mohon hentikan terlebih dahulu.',
        [{text: 'OK', style: 'default'}],
      );
      return;
    }

    if (type === 'water' && controlState.remainingWaterTime > 0) {
      return onStop('water');
    }
    if (type === 'fertilizer' && controlState.remainingFertTime > 0) {
      return onStop('fertilizer');
    }

    if (type === 'water' && controlState.remainingFertTime > 0) {
      Alert.alert(
        'Fertilizer Active',
        'Fertilizer is currently running. Please wait until it finishes or stop it first.',
        [{text: 'OK', style: 'default'}],
      );
      return;
    }
    if (type === 'fertilizer' && controlState.remainingWaterTime > 0) {
      Alert.alert(
        'Water Active',
        'Watering is currently running. Please wait until it finishes or stop it first.',
        [{text: 'OK', style: 'default'}],
      );
      return;
    }

    onToggle(type);
  };

  return (
    <View style={styles.controlCentre}>
      <Text style={styles.controlCentreText}>Control Centre</Text>
      <View style={styles.controlCentreBox}>
        <View style={styles.boxControl}>
          <View style={styles.frameTopControl}>
            <Text style={styles.titleControl}>Water</Text>
            <TouchableOpacity
              style={styles.powerButtonContainer}
              onPress={() => handleToggle('water')}>
              {controlState.isWaterOn ? <PowerOnIcon /> : <PowerOffIcon />}
            </TouchableOpacity>
          </View>
          <View style={styles.frameVideoPlay}>
            <LottieView
              ref={waterLottieRef}
              source={require('@Assets/videos/air.mp4.lottie.json')}
              style={styles.lottieVideo}
              loop={true}
              autoPlay={controlState.isWaterOn}
              resizeMode="cover"
              renderMode="SOFTWARE"
              hardwareAccelerationAndroid={false}
              cacheComposition={true}
            />
            <View style={styles.informationSprayer}>
              {controlState.remainingWaterTime > 0 ? (
                <>
                  <Text style={styles.informationSprayerText}>
                    Watering in progress
                  </Text>
                  <Text style={styles.informationSprayerRemain}>
                    {formatTime(controlState.remainingWaterTime)}
                  </Text>
                </>
              ) : controlState.lastWaterAction ? (
                <>
                  <Text style={styles.informationSprayerText}>Last action</Text>
                  <Text style={styles.informationSprayerText}>
                    {formatDateForAndroid(controlState.lastWaterAction)}
                  </Text>
                  <Text style={styles.informationSprayerText}>
                    {formatTimeForAndroid(controlState.lastWaterAction)}
                  </Text>
                </>
              ) : (
                <Text style={styles.informationSprayerText}>
                  No recent{'\n'}water{'\n'}activity
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.boxControl}>
          <View style={styles.frameTopControl}>
            <Text style={styles.titleControl}>Fertilizer</Text>
            <TouchableOpacity
              style={styles.powerButtonContainer}
              onPress={() => handleToggle('fertilizer')}>
              {controlState.isFertilizerOn ? <PowerOnIcon /> : <PowerOffIcon />}
            </TouchableOpacity>
          </View>
          <View style={styles.frameVideoPlay}>
            <LottieView
              ref={fertLottieRef}
              source={require('@Assets/videos/pupuk.mp4.lottie.json')}
              style={styles.lottieVideo}
              loop={true}
              autoPlay={controlState.isFertilizerOn}
              resizeMode="cover"
              renderMode="SOFTWARE"
              hardwareAccelerationAndroid={false}
              cacheComposition={true}
            />
            <View style={styles.informationSprayer}>
              {controlState.remainingFertTime > 0 ? (
                <>
                  <Text style={styles.informationSprayerText}>
                    Fertilizing in progress
                  </Text>
                  <Text style={styles.informationSprayerRemain}>
                    {formatTime(controlState.remainingFertTime)}
                  </Text>
                </>
              ) : controlState.lastFertAction ? (
                <>
                  <Text style={styles.informationSprayerText}>Last action</Text>
                  <Text style={styles.informationSprayerText}>
                    {formatDateForAndroid(controlState.lastFertAction)}
                  </Text>
                  <Text style={styles.informationSprayerText}>
                    {formatTimeForAndroid(controlState.lastFertAction)}
                  </Text>
                </>
              ) : (
                <Text style={styles.informationSprayerText}>
                  No recent fertilizer activity
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ControlCentre;