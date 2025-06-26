import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {ArrowLeft2} from 'iconsax-react-native';
import GaugeSvg from '../../GaugeComponent';
import EllipseIndicator from '../../EllipsIndicator';
import {useRef, useEffect} from 'react';
import {Animated} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Video, VideoRef} from 'react-native-video';
import Ellips from '../../../assets/svg/Ellips';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../../HomeStack'; // pastikan path sesuai lokasi
import {useMqtt} from './Services/UseMqtt';
import {AppState, AppStateStatus} from 'react-native';
import ConfirmModal from './Modal/ConfirmModal';
import {useControlState} from './Services/useControlState';
import {useControl, usePageControl} from '../../../context/ControlContext';
import LottieView from 'lottie-react-native';
import {useFocusEffect} from '@react-navigation/native';
import PowerOffIcon from '../../../assets/svg/PowerOffIcon';
import PowerOnIcon from '../../../assets/svg/PowerOnIcon';

type Props = NativeStackScreenProps<HomeStackParamList, 'DetailBlockTwo'>;
// import Gauge from "../assets/images/Gauge.png";

// const Gauge = require('../assets/images/Gauge.png'

const DetailBlockTwo: React.FC<Props> = ({navigation}) => {
  const gaugeValue = -100;

  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(rotation, {
      toValue: gaugeValue,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [gaugeValue]);

  // Modal states
  const [selectedDuration, setSelectedDuration] = useState<number>(0);
  const [showDurationModal, setShowDurationModal] = useState(false);
  // Modal states - unchanged
    const [inputMinutes, setInputMinutes] = useState<string>('1');
    const [inputSeconds, setInputSeconds] = useState<string>('0');
     const minutesInputRef = useRef<TextInput>(null);
      const secondsInputRef = useRef<TextInput>(null);
      const focusMinutesInput = () => {
        minutesInputRef.current?.focus();
      };
    
      const focusSecondsInput = () => {
        secondsInputRef.current?.focus();
      };
  const [currentProcess, setCurrentProcess] = useState<
    'water' | 'fertilizer' | null
  >(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'water' | 'fertilizer' | null>(
    null,
  );

  // Video refs - separate refs for each video to prevent conflicts
  const waterLottieRef = useRef<LottieView>(null);
  const fertLottieRef = useRef<LottieView>(null);

  // MQTT and control state
  const {block2Control} = useControl();
  const controlState = block2Control;
  const {setActivePage} = usePageControl();

  // Set this page active on focus
  useFocusEffect(
    React.useCallback(() => {
      setActivePage('block2');
      return () => {
        // optional: reset to home or leave empty set
        // setActivePage('home');
      };
    }, [setActivePage]),
  );

  // MQTT message handler
  const handleMqttMessage = useCallback(
    (msg: any) => {
      const {destinationName: topic, payloadString} = msg;
      let payload: any;

      try {
        payload = JSON.parse(payloadString);
      } catch (error) {
        console.error('Error parsing MQTT payload:', error);
        return;
      }

      // Only handle messages for block 1 topics
      if (topic.includes('/blok2')) {
        controlState.handleMqttMessage(topic, payload);
      }
    },
    [controlState],
  );

  // Set MQTT message handler
  // useEffect(() => {
  //   if (client) {
  //     setMessageHandler(handleMqttMessage);
  //   }

  //   return () => {
  //     clearMessageHandler();
  //   };
  // }, [client, handleMqttMessage, setMessageHandler, clearMessageHandler]);

  useEffect(() => {
    if (waterLottieRef.current) {
      try {
        if (controlState.isWaterOn) {
          waterLottieRef.current.play();
        } else {
          waterLottieRef.current.pause();
        }
      } catch (error) {
        console.error('Error controlling water lottie:', error);
      }
    }
  }, [controlState.isWaterOn]);

  useEffect(() => {
    if (fertLottieRef.current) {
      try {
        if (controlState.isFertilizerOn) {
          fertLottieRef.current.play();
        } else {
          fertLottieRef.current.pause();
        }
      } catch (error) {
        console.error('Error controlling fert lottie:', error);
      }
    }
  }, [controlState.isFertilizerOn]);

  // Format functions
  const formatDateForAndroid = useCallback((date: Date) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sept',
      'Oct',
      'Nov',
      'Dec',
    ];

    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  }, []);

  const formatTimeForAndroid = useCallback((date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  }, []);

  const formatTime = useCallback((totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }, []);

  // Colors
  const waterCircleColor = controlState.isWaterOn ? '#B4DC45' : '#BBC3CE';
  const fertCircleColor = controlState.isFertilizerOn ? '#B4DC45' : '#BBC3CE';

  // Handlers
  const handleToggle = useCallback(
    (type: 'water' | 'fertilizer') => {
      if (type === 'water' && controlState.remainingWaterTime > 0) {
        setConfirmType('water');
        return setShowConfirm(true);
      }
      if (type === 'fertilizer' && controlState.remainingFertTime > 0) {
        setConfirmType('fertilizer');
        return setShowConfirm(true);
      }

      setCurrentProcess(type);
      setSelectedDuration(1);
      setShowDurationModal(true);
    },
    [controlState.remainingWaterTime, controlState.remainingFertTime],
  );

  // Fungsi untuk validasi input
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
  
    // Update handleStartProcess untuk menggunakan input values
    const handleStartProcess = useCallback(() => {
      if (!currentProcess) return;
  
      // Validasi input
      const validatedMinutes = validateTimeInput(inputMinutes, 120);
      const validatedSeconds = validateTimeInput(inputSeconds, 59);
  
      // Update state dengan nilai yang valid
      setInputMinutes(validatedMinutes);
      setInputSeconds(validatedSeconds);
  
      // Konversi ke total menit (termasuk detik)
      const totalMinutes =
        parseInt(validatedMinutes) + parseInt(validatedSeconds) / 60;
      const finalMinutes = Math.min(Math.max(totalMinutes, 0.1), 120); // Minimum 6 detik
  
      controlState.startProcess(currentProcess, finalMinutes);
      setShowDurationModal(false);
      setInputMinutes('1');
      setInputSeconds('0');
    }, [currentProcess, inputMinutes, inputSeconds, controlState]);

  const handleConfirmStop = useCallback(() => {
    if (confirmType) {
      controlState.stopProcess(confirmType);
    }
    setShowConfirm(false);
  }, [confirmType, controlState]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}>
      <View style={styles.main}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('HomeFix');
            }}>
            <ArrowLeft2
              color="black"
              variant="Linear"
              size={24}
              style={{transform: [{rotate: '360deg'}]}}
            />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 600,
              fontFamily: 'SpaceGrotesk-Regular',
              right: 5,
              textAlign: 'center',
            }}>
            Block 2
          </Text>
          <ArrowLeft2
            color="black"
            variant="Linear"
            size={24}
            style={{transform: [{rotate: '360deg'}]}}
            opacity={0}
          />
        </View>
        <View style={styles.containerTransmisi}>
          <View style={[styles.cardTransmisi, {marginRight: 12}]}>
            <View style={styles.cardDetailTransmisi}>
              <View style={styles.Transmisi}>
                <GaugeSvg />
                <View style={{top: -100, right: -105}}>
                  <Ellips />
                </View>
              </View>
              <Text style={styles.nameSensorTransmisi}>Temperature</Text>
            </View>
            <Text style={styles.valueTransmisi}>32°</Text>
          </View>
          <View style={styles.cardTransmisi}>
            <View style={styles.cardDetailTransmisi}>
              <View style={styles.Transmisi}>
                <GaugeSvg />
              </View>
              <Text style={styles.nameSensorTransmisi}>Humidity</Text>
            </View>
            <Text style={styles.valueTransmisi}>21%</Text>
          </View>
        </View>
        <View style={styles.cardTwo}>
          <Text style={styles.soilTitle}>Soil Statistic</Text>
          <View style={styles.soilStatisticOne}>
            <View style={styles.detailStatisticOne}>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Soil Temperature</Text>
                <Text style={styles.statValue}>34</Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons name="arrow-down" size={18} color="red" />
                <Text style={styles.statStatus}>Low</Text>
              </View>
            </View>

            <View style={styles.detailStatisticOne}>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Soil Moisture</Text>
                <Text style={styles.statValue}>12 mg/L</Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons name="arrow-down" size={18} color="red" />
                <Text style={styles.statStatus}>Low</Text>
              </View>
            </View>
          </View>

          <View style={styles.soilStatisticTwo}>
            <View style={styles.detailStatisticOne}>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>PH</Text>
                <Text style={styles.statValue}>12 mg/L</Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons name="arrow-down" size={18} color="red" />
                <Text style={styles.statStatus}>Low</Text>
              </View>
            </View>

            <View style={styles.detailStatisticOne}>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Conductivity</Text>
                <Text style={styles.statValue}>12 mg/L</Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons name="arrow-up" size={18} color="green" />
                <Text style={[styles.statStatus, {color: 'green'}]}>Good</Text>
              </View>
            </View>
          </View>
          <View style={styles.soilStatisticTwo}>
            <View style={styles.detailStatisticOne}>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Natrium</Text>
                <Text style={styles.statValue}>12 mg/L</Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons name="arrow-down" size={18} color="red" />
                <Text style={styles.statStatus}>Low</Text>
              </View>
            </View>

            <View style={styles.detailStatisticOne}>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Phosphor</Text>
                <Text style={styles.statValue}>12 mg/L</Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons name="arrow-up" size={18} color="green" />
                <Text style={[styles.statStatus, {color: 'green'}]}>Good</Text>
              </View>
            </View>
          </View>
          <View style={styles.soilStatisticTwo}>
            <View style={styles.detailStatisticOneKal}>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Kalium</Text>
                <Text style={styles.statValue}>12 mg/L</Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons name="arrow-down" size={18} color="red" />
                <Text style={styles.statStatus}>Low</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.controlCentre}>
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
                  source={require('../../../assets/videos/air.mp4.lottie.json')} // Ganti dengan file lottie
                  style={{
                    width: 70,
                    height: 70,
                    opacity: 0.5,
                  }}
                  loop={true}
                  autoPlay={controlState.isWaterOn}
                  resizeMode="cover"
                />
                <View style={styles.informationSprayer}>
                  {/* Water info */}
                  {controlState.remainingWaterTime > 0 ? (
                    <>
                      <Text style={styles.informationSprayerText}>
                        Watering in progress
                      </Text>
                      <Text style={[styles.informationSprayerText]}>
                        {formatTime(controlState.remainingWaterTime)}
                      </Text>
                    </>
                  ) : controlState.lastWaterAction ? (
                    <>
                      <Text style={styles.informationSprayerText}>
                        Last action
                      </Text>
                      <Text style={styles.informationSprayerText}>
                        {formatDateForAndroid(controlState.lastWaterAction)}
                      </Text>
                      <Text style={styles.informationSprayerText}>
                        {formatTimeForAndroid(controlState.lastWaterAction)}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.informationSprayerText}>
                      <Text>
                        No recent{'\n'}
                        water{'\n'}
                        activity
                      </Text>
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
                  {controlState.isFertilizerOn ? (
                    <PowerOnIcon />
                  ) : (
                    <PowerOffIcon />
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.frameVideoPlay}>
                <LottieView
                  ref={fertLottieRef}
                  source={require('../../../assets/videos/pupuk.mp4.lottie.json')} // Ganti dengan file lottie
                  style={{
                    width: 70,
                    height: 70,
                    opacity: 0.5,
                  }}
                  loop={true}
                  autoPlay={controlState.isFertilizerOn}
                  resizeMode="cover"
                />
                <View style={styles.informationSprayer}>
                  {/* Fertilizer info */}
                  {controlState.remainingFertTime > 0 ? (
                    <>
                      <Text style={styles.informationSprayerText}>
                        Fertilizing in progress
                      </Text>
                      <Text style={[styles.informationSprayerText]}>
                        {formatTime(controlState.remainingFertTime)}
                      </Text>
                    </>
                  ) : controlState.lastFertAction ? (
                    <>
                      <Text style={styles.informationSprayerText}>
                        Last action
                      </Text>
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
                      <TouchableOpacity onPress={handleStartProcess}>
                        <View style={styles.buttonStartSpray}>
                          <Text style={styles.confirmText}>Start Watering</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
        <ConfirmModal
          visible={showConfirm}
          type={confirmType === 'water' ? 'water' : 'fertilizer'}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirmStop}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 375,
    height: 32,
    paddingTop: 4,
    // paddingRight: 10,
    // paddingLeft: 10,
    paddingBottom: 4,
    marginTop: 20,
  },
  containerTransmisi: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // flex: 1,
    height: 148,
    marginTop: 12,
    // left : 16,
    gap: 1,
    alignItems: 'center',
  },
  cardTransmisi: {
    overflow: 'hidden',
    backgroundColor: 'white',
    flex: 1,
    height: 148,
    borderRadius: 16,
    alignItems: 'center',

    // padding: 8,
    // paddingRight: 16,
  },
  cardDetailTransmisi: {
    width: 160.5,
    paddingHorizontal: 4,
    height: 132,
    backgroundColor: 'white',
    gap: 4,
    marginTop: 8,
    alignItems: 'center',
  },
  Transmisi: {
    backgroundColor: 'white',
    width: 126,
    height: 112,
  },
  valueTransmisi: {
    position: 'absolute',
    fontSize: 40,
    fontWeight: 600,
    fontFamily: 'SpaceGrotesk-Regular',
    zIndex: 10,
    top: 45,
    textAlign: 'center',
    marginLeft: 10,
  },
  nameSensorTransmisi: {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  cardTwo: {
    width: '100%',
    height: 284,
    borderRadius: 16,
    overflow: 'hidden',
    // justifyContent: 'flex-start',
    padding: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  soilStatisticOne: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
    marginHorizontal: 1,
    gap: 8,
  },
  soilStatisticTwo: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginHorizontal: 1,
    gap: 8,
  },
  detailStatisticOne: {
    paddingHorizontal: 8,
    flex: 1,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEE2E7',
    justifyContent: 'space-between',
    flexDirection: 'row',
    // alignItems: 'center',
  },
  detailStatisticOneKal: {
    paddingHorizontal: 8,
    flex: 0.47,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DEE2E7',
    justifyContent: 'space-between',
    flexDirection: 'row',
    // alignItems: 'center',
  },
  statContent: {
    flex: 1,
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  statExtra: {
    flexDirection: 'column',
    marginTop: 10,
    alignItems: 'center',
    marginLeft: 8,
  },
  statStatus: {
    fontSize: 12.5,
    marginLeft: 4,
  },
  soilTitle: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  controlCentre: {
    marginBottom: 8,
  },
  controlCentreText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: 600,
    marginBottom: 8,
  },
  controlCentreBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    padding: 5,
    paddingHorizontal: 1,
  },
  boxControl: {
    backgroundColor: 'white',
    flex: 1,
    height: 132,
    borderRadius: 16,
    gap: 2,
  },
  frameTopControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 9,
    marginHorizontal: 1,
    gap: 8,
    // marginBottom: 2,
  },
  titleControl: {
    fontSize: 16,
    fontWeight: 500,
  },
  frameVideo: {
    backgroundColor: 'white',
    width: 146,
    height: 70,
    paddingHorizontal: 8,
    // marginTop: 9,
    marginHorizontal: 8,
    marginBottom: 8,
    marginLeft: 20,
  },
  frameVideoPlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  video: {
    width: 70,
    height: 70,
    borderRadius: 8,
    opacity: 0.5,
  },
  informationSprayer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  informationSprayerText: {
    fontSize: 12,
    color: 'black',
    textAlign: 'right',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  circleLevel1: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleLevel2: {
    width: 32.5,
    height: 32.5,
    borderRadius: 16.25,
    borderWidth: 1.25,
    borderColor: '#EFFFC2',
    justifyContent: 'center',
    alignItems: 'center',
    // backdropFilter: 'blur(1.25px)',
  },
  circleLevel3: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.25,
    borderColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    // backdropFilter: 'blur(1.75px)',
  },
  circleLevel4: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 5,
    borderColor: '#B4DC45',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleLevel5: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#B8B8B8DE',
    shadowOffset: {width: 0, height: -0.63},
    shadowOpacity: 0.75,
    shadowRadius: 0.25,
  },
  powerIcon: {},
  powerButtonContainer: {},
  shadow: {
    width: 44.9764518737793,
    height: 39.97906494140625,
    top: -9.75,
    position: 'absolute',
  },
  loadingContainer: {
    padding: 20,
    justifyContent: 'center',
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
  durationText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#B4DC45',
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 5,
  },
  durationButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  confirmText: {
    color: '#353D48',
    fontWeight: '600',
    alignSelf: 'center',
    fontFamily: 'SpaceGrotesk-Regular',
    padding: 5,
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

  // ... styles lainnya
});

export default DetailBlockTwo;
