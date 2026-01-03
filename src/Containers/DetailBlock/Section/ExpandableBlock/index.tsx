import React, {useState, useRef, useCallback, useMemo, useEffect} from 'react';
import {View, Text, TouchableOpacity, Animated, Easing, Alert} from 'react-native';
import {ArrowLeft2} from 'iconsax-react-native';
import LottieView from 'lottie-react-native';
import {PowerButton} from '../PowerButton';
import {styles} from './styles';

interface ExpandableBlockProps {
  title: string;
  animationSource: any;
  blockCount: number;
  blockType: 'water' | 'fertilizer';
  mainControl: any;
  row1Control?: any;
  row2Control?: any;
  isDisabled?: boolean;
  onToggle: (type: 'water' | 'fertilizer', target: 'main' | 'row1' | 'row2') => void;
}

export const ExpandableBlock: React.FC<ExpandableBlockProps> = ({
  title,
  animationSource,
  blockCount,
  blockType,
  mainControl,
  row1Control,
  row2Control,
  isDisabled = false,
  onToggle,
}) => {
  const [expanded, setExpanded] = useState(false);
  const lottieRef = useRef<any>(null);

  const heightAnim = useRef(new Animated.Value(88)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const rotateInterpolate = useMemo(
    () =>
      rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['270deg', '90deg'],
      }),
    [rotateAnim],
  );

  const deriveState = useCallback(
    (ctrl: any) => ({
      isActive: blockType === 'water' ? ctrl.isWaterOn : ctrl.isFertilizerOn,
      remaining: blockType === 'water' ? ctrl.remainingWaterTime : ctrl.remainingFertTime,
      last: blockType === 'water' ? ctrl.lastWaterAction : ctrl.lastFertAction,
    }),
    [blockType],
  );

  const mainState = useMemo(() => deriveState(mainControl), [deriveState, mainControl]);
  const row1State = useMemo(
    () => (row1Control ? deriveState(row1Control) : null),
    [deriveState, row1Control],
  );
  const row2State = useMemo(
    () => (row2Control ? deriveState(row2Control) : null),
    [deriveState, row2Control],
  );

  useEffect(() => {
    const isAnyActive =
      mainState.isActive ||
      (row1State && row1State.isActive) ||
      (row2State && row2State.isActive);

    if (lottieRef.current) {
      if (isAnyActive) {
        lottieRef.current.play();
      } else {
        lottieRef.current.pause();
      }
    }
  }, [mainState.isActive, row1State, row2State]);

  const toggleExpand = useCallback(() => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: expanded ? 88 : 215,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: expanded ? 0 : 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
    setExpanded(prev => !prev);
  }, [expanded, heightAnim, rotateAnim]);

  const isAnyRowActive = useMemo(() => {
    if (!row1Control || !row2Control) return false;
    const row1Active = blockType === 'water' ? row1Control.isWaterOn : row1Control.isFertilizerOn;
    const row2Active = blockType === 'water' ? row2Control.isWaterOn : row2Control.isFertilizerOn;
    return row1Active || row2Active;
  }, [blockType, row1Control, row2Control]);

  const handleToggleMain = useCallback(() => {
    if (isDisabled) return;

    if (isAnyRowActive && !mainState.isActive) {
      Alert.alert(
        'Cannot Start',
        'Please stop row processes first before starting main control.',
      );
      return;
    }

    onToggle(blockType, 'main');
  }, [isDisabled, isAnyRowActive, mainState.isActive, onToggle, blockType]);

  const handleToggleRow = useCallback(
    (target: 'row1' | 'row2') => {
      if (isDisabled) return;

      if (mainState.isActive) {
        Alert.alert('Cannot Start', 'Please stop main control first before starting row control.');
        return;
      }

      onToggle(blockType, target);
    },
    [isDisabled, mainState.isActive, onToggle, blockType],
  );

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

  const getInfo = useCallback(
    (state: any): [string, string, string] => {
      if (state.remaining > 0) {
        const processType = blockType === 'water' ? 'Watering' : 'Fertilizing';
        return [`${processType} in`, 'progress', formatHelpers.formatDuration(state.remaining)];
      }

      if (state.last) {
        const d = new Date(state.last);
        return ['Last action', formatHelpers.formatDate(d), formatHelpers.formatTime(d)];
      }

      return ['No recent', blockType, ''];
    },
    [blockType, formatHelpers],
  );

  const rows = useMemo(
    () => [
      {key: 'row1' as const, label: 'Baris 1 & 5', state: row1State},
      {key: 'row2' as const, label: 'Baris 2,3,4', state: row2State},
    ],
    [row1State, row2State],
  );

  return (
    <Animated.View style={[styles.container, {height: heightAnim}]}>
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
            <Text style={styles.blockText}>{blockCount} Block</Text>
          </View>
        </View>
        <PowerButton
          isActive={mainState.isActive}
          onPress={handleToggleMain}
          disabled={isDisabled || (isAnyRowActive && !mainState.isActive)}
        />
      </View>

      {expanded && row1Control && row2Control && (
        <>
          <View style={styles.lineTop} />

          <View style={styles.containerBaris}>
            {rows.map(({key, label, state}) => {
              if (!state) return null;
              
              const info = getInfo(state);
              const isInProgress = info[1] === 'progress';

              return (
                <View key={key} style={state.isActive ? styles.boxBarisOn : styles.boxBaris}>
                  <View style={styles.infoSpraying}>
                    <Text style={styles.barisTitle}>{label}</Text>
                    <Text style={styles.infoText}>{info[0]}</Text>
                    <Text style={styles.infoTextBold}>{info[1]}</Text>
                    {info[2] && (
                      <Text
                        style={[
                          styles.infoTextBold,
                          isInProgress && {
                            fontFamily: 'SpaceGrotesk-Medium',
                            color: 'black',
                            fontSize: 12,
                          },
                        ]}>
                        {info[2]}
                      </Text>
                    )}
                  </View>
                  <PowerButton
                    isActive={state.isActive}
                    onPress={() => handleToggleRow(key)}
                    disabled={isDisabled || mainState.isActive}
                  />
                </View>
              );
            })}
          </View>
        </>
      )}

      <TouchableOpacity style={styles.toggleButton} onPress={toggleExpand}>
        <Text style={styles.toggleText}>{expanded ? 'Show Less' : 'Show Block'}</Text>
        <Animated.View style={{transform: [{rotate: rotateInterpolate}]}}>
          <ArrowLeft2 color="black" variant="Linear" size={16} />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ExpandableBlock;