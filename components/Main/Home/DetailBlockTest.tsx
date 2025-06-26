import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Modal,
  TextInput,
} from 'react-native';
import { ArrowLeft2 } from 'iconsax-react-native';
import LottieView from 'lottie-react-native';
import PowerOffIcon from '../../../assets/svg/PowerOffIcon';
import PowerOnIcon from '../../../assets/svg/PowerOnIcon';
import ConfirmModal from './Modal/ConfirmModal';
import { useControl, usePageControl } from '../../../context/ControlContext';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../HomeStack';

type Props = NativeStackScreenProps<HomeStackParamList, 'DetailBlockOne'>;

// Reusable Power button component
const PowerButton: React.FC<{ isActive: boolean; onPress: () => void }> = ({ isActive, onPress }) => (
  <TouchableOpacity style={styles.powerButton} onPress={onPress}>
    {isActive ? <PowerOnIcon width={42} height={42} /> : <PowerOffIcon width={42} height={42} />}
  </TouchableOpacity>
);

// Expandable block component for Water/Fertilizer
const ExpandableBlock: React.FC<{
  title: string;
  animationSource: any;
  blockCount: number;
  blockType: 'water' | 'fertilizer';
  mainControl: any;
  row1Control: any;
  row2Control: any;
}> = ({ title, animationSource, blockCount, blockType, mainControl, row1Control, row2Control }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [currentProcess, setCurrentProcess] = useState<{ type: 'water' | 'fertilizer'; target: 'main' | 'row1' | 'row2' } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmProcess, setConfirmProcess] = useState<{ type: 'water' | 'fertilizer'; target: 'main' | 'row1' | 'row2' } | null>(null);

  const heightAnim = useRef(new Animated.Value(88)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotateInterpolate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['270deg', '90deg'] });

  const [inputMinutes, setInputMinutes] = useState<string>('1');
const [inputSeconds, setInputSeconds] = useState<string>('0');

const validateTimeInput = (value: string, max: number): string => {
  const numValue = parseInt(value);
  if (isNaN(numValue) || numValue < 0) return '0';
  if (numValue > max) return max.toString();
  return numValue.toString();
};

// Handler untuk perubahan input
const handleMinutesChange = (text: string) => {
  // Hanya izinkan angka
  const numericValue = text.replace(/[^0-9]/g, '');
  setInputMinutes(numericValue);
};

const handleSecondsChange = (text: string) => {
  // Hanya izinkan angka
  const numericValue = text.replace(/[^0-9]/g, '');
  setInputSeconds(numericValue);
};

const minutesInputRef = useRef<TextInput>(null);
  const secondsInputRef = useRef<TextInput>(null);

  const focusMinutesInput = () => {
    minutesInputRef.current?.focus();
  };

  const focusSecondsInput = () => {
    secondsInputRef.current?.focus();
  };


  // Format helpers
  const formatDate = (d: Date) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
    return `${d.getDate().toString().padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };
  const formatTime = (d: Date) => `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  const formatDuration = (sec: number) => {
    const m = Math.floor(sec/60).toString().padStart(2,'0');
    const s = (sec%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  };

  // Derive control states from useControlState
  const deriveState = (ctrl: any) => ({
    isActive: blockType === 'water' ? ctrl.isWaterOn : ctrl.isFertilizerOn,
    remaining: blockType === 'water' ? ctrl.remainingWaterTime : ctrl.remainingFertTime,
    last: blockType === 'water' ? ctrl.lastWaterAction : ctrl.lastFertAction,
  });

  const mainState = deriveState(mainControl);
  const row1State = deriveState(row1Control);
  const row2State = deriveState(row2Control);

  // Expand/collapse animation
  const toggleExpand = () => {
    Animated.parallel([
      Animated.timing(heightAnim, { toValue: expanded ? 88 : 190, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(rotateAnim, { toValue: expanded ? 0 : 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
    setExpanded(prev => !prev);
  };

  // Handle on/off toggles
  const handleToggle = useCallback((target: 'main' | 'row1' | 'row2') => {
    const targetControl = target === 'main' ? mainControl : target === 'row1' ? row1Control : row2Control;
    const isCurrentlyActive = blockType === 'water' ? targetControl.isWaterOn : targetControl.isFertilizerOn;
    
    if (isCurrentlyActive) {
      // If currently active, show confirm modal to stop
      setConfirmProcess({ type: blockType, target });
      setShowConfirm(true);
    } else {
      // If not active, show duration modal to start
      setCurrentProcess({ type: blockType, target });
      setSelectedDuration(1);
      setShowDurationModal(true);
    }
  }, [mainControl, row1Control, row2Control, blockType]);

  // Start process with selected duration
  const handleStart = () => {
    if (!currentProcess) return;

     // Validasi input
  const validatedMinutes = validateTimeInput(inputMinutes, 120);
  const validatedSeconds = validateTimeInput(inputSeconds, 59);
  
  // Update state dengan nilai yang valid
  setInputMinutes(validatedMinutes);
  setInputSeconds(validatedSeconds);

  const totalMinutes = parseInt(validatedMinutes) + (parseInt(validatedSeconds) / 60);
  const finalMinutes = Math.min(Math.max(totalMinutes, 0.1), 120); // Minimum 6 detik
    
    const ctrl = currentProcess.target === 'main' ? mainControl : 
                 currentProcess.target === 'row1' ? row1Control : row2Control;
    
    // Use the startProcess method from useControlState
    ctrl.startProcess(currentProcess.type, finalMinutes);
    
    setShowDurationModal(false);
    setInputMinutes('1');
    setInputSeconds('0');
    setCurrentProcess(null);
  };

  // Confirm stop process
  const handleStop = () => {
    if (!confirmProcess) return;
    
    const ctrl = confirmProcess.target === 'main' ? mainControl : 
                 confirmProcess.target === 'row1' ? row1Control : row2Control;
    
    // Use the stopProcess method from useControlState
    ctrl.stopProcess(confirmProcess.type);
    
    setShowConfirm(false);
    setConfirmProcess(null);
  };

  // Prepare display info for each row
  const getInfo = (key: 'main' | 'row1' | 'row2'): [string, string] => {
    const state = key === 'main' ? mainState : key === 'row1' ? row1State : row2State;
    
    // If currently running, show remaining time
    if (state.remaining > 0) {
      return ['Progress', formatDuration(state.remaining)];
    }
    
    // If not running but has last action, show last action time
    if (state.last) {
      const d = new Date(state.last);
      return [formatDate(d), formatTime(d)];
    }
    
    // Default state
    return ['No recent', blockType];
  };

  const rows = [
    { key: 'row1' as const, label: 'Baris 1' },
    { key: 'row2' as const, label: 'Baris 2' }
  ];

  return (
    <>
      <Animated.View style={[styles.container, { height: heightAnim }]}>        
        {/* Header */}
        <View style={styles.content}>
          <View style={styles.infoWater}>
            <LottieView 
              source={animationSource} 
              style={styles.lottie} 
              loop 
              autoPlay={mainState.isActive} 
            />
            <View style={styles.infoDetails}>
              <Text style={styles.waterText}>{title}</Text>
              <Text style={styles.blockText}>{blockCount} Block</Text>
            </View>
          </View>
          <PowerButton 
            isActive={mainState.isActive} 
            onPress={() => handleToggle('main')} 
          />
        </View>

        {/* Expanded rows */}
        {expanded && (
          <>
            <View style={styles.lineTop} />
            <View style={styles.containerBaris}>
              {rows.map(({ key, label }) => {
                const st = key === 'row1' ? row1State : row2State;
                const info = getInfo(key);
                
                return (
                  <View 
                    key={key} 
                    style={st.isActive ? styles.boxBarisOn : styles.boxBaris}
                  >
                    <View style={styles.infoSpraying}>
                      <Text style={styles.barisTitle}>{label}</Text>
                      <Text style={styles.infoText}>{info[0]}</Text>
                      <Text style={styles.infoTextBold}>{info[1]}</Text>
                    </View>
                    <PowerButton 
                      isActive={st.isActive} 
                      onPress={() => handleToggle(key)} 
                    />
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Toggle expand button */}
        <TouchableOpacity style={styles.toggleButton} onPress={toggleExpand}>
          <Text style={styles.toggleText}>{expanded ? 'Show Less' : 'Show Block'}</Text>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <ArrowLeft2 color="black" variant="Linear" size={16} />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Duration Modal */}
      <Modal
              visible={showDurationModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowDurationModal(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={{marginBottom: -10}}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'SpaceGrotesk-Medium',
                        fontWeight: 500,
                      }}>
                      Set Time For Watering
                    </Text>
                  </View>
                  <View style={styles.durationInputContainer}>
                    <View style={styles.durationMinutes}>
                      <Text
                        style={{
                          fontFamily: 'SpaceGrotesk-Regular',
                          fontWeight: 400,
                          fontSize: 12,
                          color: '#919EB0',
                          alignSelf: 'center',
                        }}>
                        Minutes
                      </Text>
                      <TouchableOpacity
                        style={styles.boxDurationMinutes}
                        onPress={focusMinutesInput}
                        activeOpacity={0.7}>
                        <TextInput
                          ref={minutesInputRef}
                          style={{
                            alignSelf: 'center',
                            fontFamily: 'SpaceGrotesk-Bold',
                            fontSize: 32,
                            bottom: 4,
                            textAlign: 'center',
                            color: '#000',
                            backgroundColor: 'transparent',
                            borderWidth: 0,
                            padding: 0,
                            margin: 0,
                            width: '100%',
                            height: '100%',
                          }}
                          value={inputMinutes}
                          onChangeText={handleMinutesChange}
                          keyboardType="numeric"
                          maxLength={3}
                          placeholder="1"
                          placeholderTextColor="#BBC3CE"
                          selectTextOnFocus={true}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={{alignSelf: 'center'}}>:</Text>
                    <View style={styles.durationMinutes}>
                      <Text
                        style={{
                          fontFamily: 'SpaceGrotesk-Regular',
                          fontWeight: 400,
                          fontSize: 12,
                          color: '#919EB0',
                          alignSelf: 'center',
                        }}>
                        Seconds
                      </Text>
                      <TouchableOpacity
                        style={styles.boxDurationMinutes}
                        onPress={focusSecondsInput}
                        activeOpacity={0.7}>
                        <TextInput
                          ref={secondsInputRef}
                          style={{
                            alignSelf: 'center',
                            fontFamily: 'SpaceGrotesk-Bold',
                            fontSize: 32,
                            bottom: 4,
                            textAlign: 'center',
                            color: '#000',
                            backgroundColor: 'transparent',
                            borderWidth: 0,
                            padding: 0,
                            margin: 0,
                            width: '100%',
                            height: '100%',
                          }}
                          value={inputSeconds}
                          onChangeText={handleSecondsChange}
                          keyboardType="numeric"
                          maxLength={2}
                          placeholder="0"
                          placeholderTextColor="#BBC3CE"
                          selectTextOnFocus={true}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
      
                  <View style={styles.modalButtonContainer}>
                    <TouchableOpacity onPress={() => setShowDurationModal(false)}>
                      <View style={styles.buttonCancelSpray}>
                        <Text style={styles.cancelText}>Cancel</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleStart}>
                      <View style={styles.buttonStartSpray}>
                        <Text style={styles.confirmText}>Start Watering</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

      {/* Confirm Stop Modal */}
      <ConfirmModal 
        visible={showConfirm} 
        type={confirmProcess?.type || 'water'} 
        onCancel={() => setShowConfirm(false)} 
        onConfirm={handleStop} 
      />
    </>
  );
};

// Main screen component
const DetailBlockOne: React.FC<Props> = ({ navigation }) => {
  const {
    block1Control,
    block1RowWater1Control,
    block1RowWater2Control,
    block1RowFertilizer1Control,
    block1RowFertilizer2Control,
  } = useControl();
  
  const { setActivePage } = usePageControl();

  // Set active page when component mounts and cleanup when unmounts
  useFocusEffect(
    React.useCallback(() => {
      console.log('[DetailBlockOne] Setting active page to block1');
      setActivePage('block1');
      
      // return () => {
      //   console.log('[DetailBlockOne] Cleaning up - setting active page to home');
      //   setActivePage('home');
      // };
    }, [setActivePage])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.main}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.replace('HomeFix')}>
            <ArrowLeft2 color="black" variant="Linear" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Block 1</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Water Block */}
        <ExpandableBlock
          title="Water"
          animationSource={require('../../../assets/videos/air.mp4.lottie.json')}
          blockCount={5}
          blockType="water"
          mainControl={block1Control}
          row1Control={block1RowWater1Control}
          row2Control={block1RowWater2Control}
        />

        {/* Fertilizer Block */}
        <ExpandableBlock
          title="Fertilizer"
          animationSource={require('../../../assets/videos/pupuk.mp4.lottie.json')}
          blockCount={5}
          blockType="fertilizer"
          mainControl={block1Control}
          row1Control={block1RowFertilizer1Control}
          row2Control={block1RowFertilizer2Control}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  main: { 
    flex: 1, 
    paddingHorizontal: 16 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    height: 32, 
    marginTop: 20 
  },
  title: { 
    fontSize: 18, 
    fontWeight: '600', 
    fontFamily: 'SpaceGrotesk-Regular' 
  },

  container: { 
    width: '100%', 
    backgroundColor: 'white', 
    borderRadius: 16, 
    marginTop: 15, 
    overflow: 'hidden' 
  },
  content: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 5 
  },
  infoWater: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  lottie: { 
    width: 40, 
    height: 40, 
    opacity: 0.5 
  },
  infoDetails: { 
    marginLeft: 8 
  },
  waterText: { 
    fontSize: 16, 
    fontWeight: '500', 
    fontFamily: 'SpaceGrotesk-Regular' 
  },
  blockText: { 
    fontSize: 12, 
    color: '#C5C5C5', 
    marginTop: -2, 
    fontFamily: 'SpaceGrotesk-Regular' 
  },
  powerButton: { 
    padding: 5 
  },

  toggleButton: { 
    position: 'absolute', 
    bottom: 8, 
    left: 0, 
    right: 0, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  toggleText: { 
    fontFamily: 'SpaceGrotesk-Regular', 
    fontSize: 12, 
    fontWeight: '400', 
    marginRight: 6 
  },
  lineTop: { 
    height: 1, 
    backgroundColor: '#DEE2E7', 
    width: '90%', 
    alignSelf: 'center', 
    marginVertical: 10, 
    marginTop: 1
  },
  containerBaris: { 
    width: '90%', 
    alignSelf: 'center', 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  boxBaris: { 
    width: '48%', 
    backgroundColor: 'white', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#EDEFF2', 
    padding: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  boxBarisOn: { 
    width: '48%', 
    backgroundColor: 'white', 
    borderRadius: 8, 
    borderWidth: 2.5, 
    borderColor: '#B4DC45', 
    padding: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  infoSpraying: { 
    flex: 1 
  },
  barisTitle: { 
    fontFamily: 'SpaceGrotesk-Regular', 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#353D48' 
  },
  infoText: { 
    fontFamily: 'SpaceGrotesk-Regular', 
    fontSize: 12, 
    fontWeight: '400', 
    color: '#BBC3CE' 
  },
  infoTextBold: { 
    fontFamily: 'SpaceGrotesk-Regular', 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#353D48' 
  },

  modalOverlay: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { 
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    width: 343,
    height: 168,
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 12 
  },
  durationInputContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  durationButton: { 
    padding: 15,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginHorizontal: 10,
  },
  durationButtonText: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  durationText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginHorizontal: 16 
  },
  modalButtonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%' 
  },
  confirmButton: { 
    backgroundColor: '#B4DC45', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8 
  },
  confirmText: { 
    color: '#353D48',
    fontWeight: '600',
    alignSelf: 'center',
    fontFamily: 'SpaceGrotesk-Regular',
    padding: 5,
  },
  cancelButton: { 
    backgroundColor: '#f0f0f0', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8 
  },
  cancelText: { 
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: 500,
    fontSize: 14,
    color: '#353D48',
    alignSelf: 'center',
    padding: 5,
  },
  durationMinutes: {
    width: 143.5,
    height: 60,
  },
  boxDurationMinutes: {
    width: 143.5,
    height: 44,
    borderColor: '#919EB0',
    borderWidth: 0.75,
    borderRadius: 8,
  },
  buttonCancelSpray: {
    width: 150.5,
    height: 36,
    borderColor: '#B4DC45',
    borderWidth: 1,
    borderRadius: 8,
  },
  buttonStartSpray: {
    backgroundColor: '#B4DC45',
    borderRadius: 8,
    width: 150.5,
    height: 36,
  },
});

export default DetailBlockOne;