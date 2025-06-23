import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
  StatusBar,
  FlatList
  // Video
} from 'react-native';
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Path, SvgFromUri} from 'react-native-svg';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList, PortableToolData, SensorData} from '../../../HomeStack';
import EllipsCloud from '../../../assets/svg/ellipsCloud';
import CloudMin from '../../../assets/svg/cloudMin';
import CloudOne from '../../../assets/svg/cloudOne';
import CloudTwo from '../../../assets/svg/cloudTwo';
import Shadow from '../../../assets/svg/Shadow';
import {useMqtt} from './Services/UseMqtt';
import {useControlState} from './Services/useControlState';
import * as Paho from 'paho-mqtt';
import Video, {VideoRef} from 'react-native-video';
import {fetchCurrentWeather} from '../../../api/weather';
import {AppState, AppStateStatus} from 'react-native';
import {weatherImages} from '../../../constants/index';
import ConfirmModal from './Modal/ConfirmModal';
import LottieView from 'lottie-react-native'; // Pastikan Dimensions sudah diimpor
import ReadSoilDetail from '../ReadSoil/ReadSoilDetail';
// ... import lainnya

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeFix'>;

import {
  Logout,
  Maximize,
  Maximize1,
  Maximize3,
  Maximize4,
  ArrowDown,
} from 'iconsax-react-native';
import CloudMinTwo from '../../../assets/svg/cloudMinTwo';
import CloudMinThree from '../../../assets/svg/cloudMinThree';
import {AuthContext} from '../../../context/AuthContext';
import {useControl, usePageControl} from '../../../context/ControlContext';
import { useFocusEffect } from '@react-navigation/native';

const HomeFix: React.FC<Props> = ({navigation}) => {

  type WeatherData = {
    is_day: number;
    description: string;
    temp: number;
    humidity: number;
    wind_speed: number;
  };
  
  const {logout} = useContext(AuthContext);
  
  // Weather state - optimized
  const [weather, setWeather] = useState<WeatherData | null>(null);
  
  // Modal states - unchanged
  const [selectedDuration, setSelectedDuration] = useState<number>(0);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [currentProcess, setCurrentProcess] = useState<'water' | 'fertilizer' | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'water' | 'fertilizer' | null>(null);
  
  // FIXED: Proper typing for animation refs
  const waterLottieRef = useRef<LottieView>(null);
  const fertLottieRef = useRef<LottieView>(null);

  // MQTT and control state
  const {isConnected, publish, homeControl} = useControl();
  const controlState = homeControl;
  const { setActivePage } = usePageControl();

  // OPTIMIZED: Memoize focus effect callback
  const focusCallback = useCallback(() => {
    setActivePage('home');
  }, [setActivePage]);

  useFocusEffect(focusCallback);

  const [portableData, setPortableData] = useState<PortableToolData[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function for debouncing - MOVED TO TOP
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  // OPTIMIZED: Memoize CornerCut component to prevent recreations
  const CornerCutComponent = useMemo(() => {
    return ({width = 300, height = 400, cutSize = 50, backgroundColor = '#ffffff', borderRadius = 16, children}: any) => {
      const createPath = () => `
        M ${borderRadius} 0
        L ${width - borderRadius} 0
        Q ${width} 0 ${width} ${borderRadius}
        L ${width} ${height - cutSize - borderRadius}
        Q ${width} ${height - cutSize} ${width - borderRadius} ${height - cutSize}
        L ${width - cutSize + borderRadius} ${height - cutSize}
        Q ${width - cutSize} ${height - cutSize} ${width - cutSize} ${height - cutSize + borderRadius}
        L ${width - cutSize} ${height - borderRadius}
        Q ${width - cutSize} ${height} ${width - cutSize - borderRadius} ${height}
        L ${borderRadius} ${height}
        Q 0 ${height} 0 ${height - borderRadius}
        L 0 ${borderRadius}
        Q 0 0 ${borderRadius} 0
        Z
      `;

      return (
        <View style={[styles.cornerCutContainer, {width, height}]}>
          <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
            <Path d={createPath()} fill={backgroundColor} />
          </Svg>
          {children}
        </View>
      );
    };
  }, []);

  // OPTIMIZED: Reduce weather fetching frequency and add error handling
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    let isComponentMounted = true;

    async function loadWeather() {
      try {
        const w = await fetchCurrentWeather();
        if (w && isComponentMounted) {
          setWeather(w);
        }
      } catch (error) {
        console.error('Error loading weather:', error);
      }
    }

    loadWeather();
    intervalId = setInterval(loadWeather, 10 * 60 * 1000);

    return () => {
      isComponentMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // OPTIMIZED: Debounced portable data fetch
  const fetchPortableData = useCallback(
    debounce(async () => {
      try {
        setLoading(true);
        const response = await fetch('http://10.0.2.2:4646/api/portable-tools?limit=5&sort=created_at&order=desc');
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data = await response.json();
        setPortableData(data);
      } catch (error) {
        console.error('Error fetching portable data:', error);
      } finally {
        setLoading(false);
      }
    }, 3000), 
    [debounce]
  );

  // OPTIMIZED: Memoize format functions
  const formatFunctions = useMemo(() => ({
    formatDateForAndroid: (date: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
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
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    formatDate: (dateString: string): string => {
      const date = new Date(dateString);
      const datePart = date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
      });
      const timePart = date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      return `${datePart} at ${timePart}`;
    }
  }), []);

  // FIXED: Destructure format functions
  const { formatDateForAndroid, formatTimeForAndroid, formatTime, formatDate } = formatFunctions;

  // OPTIMIZED: Memoize portable item renderer
  const renderPortableItem = useCallback(({ item }: { item: PortableToolData }) => {
    const formatSensorValue = (sensor: SensorData | undefined, decimals: number = 1, unit: string = ''): string => {
      if (!sensor || sensor.nilai_sensor == null) return 'N/A';
      const value = Number(sensor.nilai_sensor);
      return isNaN(value) ? 'N/A' : `${value.toFixed(decimals)}${unit}`;
    };

    // Find sensors
    const temperatureSensor = item.sensors?.find(s => s.keterangan_sensor?.toLowerCase() === 'temperature');
    const humiditySensor = item.sensors?.find(s => s.keterangan_sensor?.toLowerCase() === 'humidity');
    const phSensor = item.sensors?.find(s => s.keterangan_sensor?.toLowerCase() === 'ph');
    const ecSensor = item.sensors?.find(s => s.keterangan_sensor?.toLowerCase() === 'ec');

    return (
      <View style={[styles.containerBlockPortable, { marginRight: 23 }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ReadSoilDetail', { portableData: item })}>
          <CornerCutComponent
            width={254}
            height={140}
            cutSize={40.5}
            backgroundColor="#ffffff"
            borderRadius={22}>
            <View style={styles.cardContentPortable}>
              <View style={styles.containerInfoPortable}>
                <Text style={styles.infoArea}>{item.keterangan_portable}</Text>
                <Text style={styles.infoSensor}>
                  Temperature: {formatSensorValue(temperatureSensor, 1, '°')}
                </Text>
                <Text style={styles.infoSensor}>
                  Soil Humidity: {formatSensorValue(humiditySensor, 0, '%')}
                </Text>
                <Text style={styles.infoSensor}>
                  PH: {formatSensorValue(phSensor, 1, '')}
                </Text>
                <Text style={styles.infoSensor}>
                  EC: {formatSensorValue(ecSensor, 0, '')}
                </Text>
                <Text style={styles.infoDateSensor}>
                  {formatDate(item.created_at)}
                </Text>
              </View>
              <View style={styles.cutoutButton}>
                <Svg width={36} height={36} viewBox="0 0 36 36">
                  <Path
                    d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05888 27.9411 0 18 0C8.05888 0 0 8.05888 0 18C0 27.9411 8.05888 36 18 36Z"
                    fill="#B4DC45"
                  />
                </Svg>
                <ArrowDown variant="Linear" size={26} color="white" style={styles.arrowIcon} />
              </View>
            </View>
          </CornerCutComponent>
        </TouchableOpacity>
      </View>
    );
  }, [navigation, CornerCutComponent, formatDate]);

  useEffect(() => {
    fetchPortableData();
  }, [fetchPortableData]);

  // FIXED: Animation effect with proper refs
  useEffect(() => {
    const updateAnimations = () => {
      try {
        // Water animation
        if (waterLottieRef.current) {
          if (controlState.isWaterOn) {
            waterLottieRef.current.play();
          } else {
            waterLottieRef.current.pause();
          }
        }

        // Fertilizer animation  
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

  // OPTIMIZED: Memoize weather icon logic
  const weatherInfo = useMemo(() => {
    if (!weather) return { Icon: null, timeKey: 'Day', descKey: '' };
    
    const timeKey = weather.is_day === 1 ? 'Day' : 'Night';
    const descKey = weather.description.toLowerCase();
    const Icon = weatherImages[timeKey][descKey] || weatherImages[timeKey].other;
    
    return { Icon, timeKey, descKey };
  }, [weather]);

  // FIXED: Extract Icon properly
  const { Icon } = weatherInfo;

  // OPTIMIZED: Memoize colors
  const colors = useMemo(() => ({
    waterCircle: controlState.isWaterOn ? '#B4DC45' : '#BBC3CE',
    fertCircle: controlState.isFertilizerOn ? '#B4DC45' : '#BBC3CE'
  }), [controlState.isWaterOn, controlState.isFertilizerOn]);

  // FIXED: Extract colors properly
  const { waterCircle: waterCircleColor, fertCircle: fertCircleColor } = colors;

  // OPTIMIZED: Stable handlers with useCallback
  const handleToggle = useCallback((type: 'water' | 'fertilizer') => {
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
  }, [controlState.remainingWaterTime, controlState.remainingFertTime]);

  const handleStartProcess = useCallback(() => {
    if (!currentProcess) return;
    const minutes = Math.min(Math.max(selectedDuration, 1), 120);
    controlState.startProcess(currentProcess, minutes);
    setShowDurationModal(false);
  }, [currentProcess, selectedDuration, controlState]);

  const handleConfirmStop = useCallback(() => {
    if (confirmType) {
      controlState.stopProcess(confirmType);
    }
    setShowConfirm(false);
  }, [confirmType, controlState]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.home}>
        <ScrollView contentContainerStyle={{paddingBottom: 50}}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {}} style={styles.userInfo}>
              <Image
                source={{
                  uri: 'https://xsgames.co/randomusers/avatar.php?g=male',
                }}
                style={styles.avatar}
              />
              <Text style={styles.username}>Bapak Arik</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { logout(); }}>
              <Logout
                color="black"
                variant="Outline"
                size={24}
                style={{transform: [{rotate: '180deg'}]}}
              />
            </TouchableOpacity>
          </View>

          <ImageBackground
            source={require('../../../assets/images/weather.png')}
            style={styles.card}
            imageStyle={styles.image}>
            <View style={styles.location}>
              <Ionicons name="location" size={20} color={'white'} />
              <Text style={styles.locationText}>Rembangan, Jember</Text>
            </View>
            <View style={styles.weatherSectionTwo}>
              <Text
                style={{
                  fontSize: 40,
                  fontFamily: 'SpaceGrotesk-Regular',
                  color: 'white',
                  fontWeight: '600',
                  textAlign: 'center',
                  top: -6,
                }}>
                18°
              </Text>
              <View style={styles.detailSectionTwo}>
                <Text style={styles.detailSectionTwoText}>Humidity : 70% </Text>
                <Text style={styles.detailSectionTwoText}>Light : 1800 Lux </Text>
              </View>
              <View style={styles.cloud}>
                {Icon ? <Icon width={80} height={80} /> : null}
              </View>
            </View>

            <LinearGradient
              colors={['rgba(255,255,255,0)', '#FFFFFF', 'rgba(255,255,255,0)']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.gradientLine}
            />
            <View style={styles.detailSectionThree}>
              <View style={{flex: 1}}>
                <Text style={styles.detailSectionThreeText}>Soil Temperature</Text>
                <Text style={styles.detailSectionThreeText}>12°</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.detailSectionThreeText}>Soil Moisture</Text>
                <Text style={styles.detailSectionThreeText}>45%</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.detailSectionThreeText}>Conductivity</Text>
                <Text style={styles.detailSectionThreeText}>18 S/cm</Text>
              </View>
            </View>
          </ImageBackground>

          <View style={styles.cardTwo}>
            <Text style={styles.soilTitle}>Soil Statistic</Text>
            <View style={styles.soilStatisticOne}>
              <View style={styles.detailStatisticOne}>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>PH</Text>
                  <Text style={styles.statValue}>34</Text>
                </View>
                <View style={styles.statExtra}>
                  <Ionicons name="arrow-down" size={18} color="red" />
                  <Text style={styles.statStatus}>Low</Text>
                </View>
              </View>

              <View style={styles.detailStatisticOne}>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Nitrogen</Text>
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
                  <Text style={styles.statLabel}>Phosphor</Text>
                  <Text style={styles.statValue}>12 mg/L</Text>
                </View>
                <View style={styles.statExtra}>
                  <Ionicons name="arrow-down" size={18} color="red" />
                  <Text style={styles.statStatus}>Low</Text>
                </View>
              </View>

              <View style={styles.detailStatisticOne}>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Kalium</Text>
                  <Text style={styles.statValue}>12 mg/L</Text>
                </View>
                <View style={styles.statExtra}>
                  <Ionicons name="arrow-up" size={18} color="green" />
                  <Text style={[styles.statStatus, {color: 'green'}]}>Good</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.controlCentre}>
            <Text style={styles.controlCentreText}>Control Centre</Text>
            <View style={styles.controlCentreBox}>
              <View style={styles.boxControl}>
                <View style={styles.frameTopControl}>
                  <Text style={styles.titleControl}>Water</Text>
                  <TouchableOpacity
                    style={styles.powerButtonContainer}
                    onPress={() => handleToggle('water')}>
                    <View style={styles.circleLevel1}>
                      <View style={styles.circleLevel2}>
                        <View style={styles.circleLevel3}>
                          <View
                            style={[
                              styles.circleLevel4,
                              {borderColor: waterCircleColor},
                            ]}>
                            <View
                              style={[
                                styles.circleLevel5,
                                {
                                  shadowColor: '#a5a5c7',
                                  shadowOffset: { width: 0, height: -1 },
                                  shadowOpacity: 0.25,
                                  shadowRadius: 0.75,
                                },
                              ]}>
                              <Ionicons
                                name="power-outline"
                                size={24}
                                color={waterCircleColor}
                                style={styles.powerIcon}
                              />
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.frameVideoPlay}>
                  <LottieView
                    ref={waterLottieRef}
                    source={require('../../../assets/videos/air.mp4.lottie.json')}
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
                    {controlState.remainingWaterTime > 0 ? (
                      <>
                        <Text style={styles.informationSprayerText}>
                          Watering in progress
                        </Text>
                        <Text style={styles.informationSprayerText}>
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
                    <View style={styles.circleLevel1}>
                      <View style={styles.circleLevel2}>
                        <View style={styles.circleLevel3}>
                          <View
                            style={[
                              styles.circleLevel4,
                              {borderColor: fertCircleColor},
                            ]}>
                            <View
                              style={[
                                styles.circleLevel5,
                                {
                                  shadowColor: '#a5a5c7',
                                  shadowOffset: { width: 0, height: -1 },
                                  shadowOpacity: 0.25,
                                  shadowRadius: 0.75,
                                },
                              ]}>
                              <Ionicons
                                name="power-outline"
                                size={24}
                                color={fertCircleColor}
                                style={styles.powerIcon}
                              />
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.frameVideoPlay}>
                  <LottieView
                    ref={fertLottieRef}
                    source={require('../../../assets/videos/pupuk.mp4.lottie.json')}
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
                    {controlState.remainingFertTime > 0 ? (
                      <>
                        <Text style={styles.informationSprayerText}>
                          Fertilizing in progress
                        </Text>
                        <Text style={styles.informationSprayerText}>
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
          <View style={styles.fieldList}>
            <View style={styles.headerFieldList}>
              <Text style={{fontSize: 14, fontWeight: 600}}>Field List</Text>
              <TouchableOpacity>
                <View style={styles.showAll}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: 'SpaceGrotesk-Regular',
                      fontWeight: 400,
                      color: '#B4DC45',
                    }}>
                    Show All
                  </Text>
                  <Maximize1 color="#B4DC45" variant="Broken" size={24} />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.containerBlock}>
              <TouchableOpacity
                onPress={() => {
                  navigation.replace('DetailBlockOne');
                }}>
                <CornerCutComponent
                  width={cardWidth}
                  height={175}
                  cutSize={40.5}
                  backgroundColor="#ffffff"
                  borderRadius={22}>
                  <View style={styles.cardBlockContent}>
                    <View style={styles.containerVector}>
                      {/* Frame notifikasi Fertilizer */}
                      <View style={styles.notifIconFertilizer}>
                        {/* <Video
              source={require('../../../assets/videos/pupuk.mp4')}
              style={{width: 24, height: 24}}
              resizeMode="cover"
              repeat
              muted
              paused={true}
            /> */}
                      </View>
                      <View style={styles.notifIconWater}>
                        {/* <Video
              source={require('../../../assets/videos/air.mp4')}
              style={{width: 24, height: 24}}
              resizeMode="cover"
              repeat
              muted
              paused={true}
            /> */}
                      </View>
                      <View style={styles.svgContainer}>
                        <Svg
                          width={103.5}
                          height={87.5}
                          viewBox="0 0 103 89"
                          fill="none">
                          {/* fill shape */}
                          <Path
                            d="M14.5 53C14.1413 48.3364 6.51668 22.4115 1.58114 6.17196C0.798561 3.59703 2.72462 1 5.41584 1H44.0326C44.98 1 45.8966 1.33629 46.6193 1.94897L68.5 20.5L100.231 49.9647C101.976 51.5849 101.928 54.3613 100.128 55.9199L64.9215 86.4033C63.5061 87.6288 61.43 87.7086 59.9247 86.5954L14.5 53Z"
                            fill="#F0F8DA"
                          />
                          {/* stroke shape */}
                          <Path
                            d="M14.5 53C14.1413 48.3364 6.51668 22.4115 1.58114 6.17196C0.798561 3.59703 2.72462 1 5.41584 1H44.0326C44.98 1 45.8966 1.33629 46.6193 1.94897L68.5 20.5M14.5 53L59.9247 86.5954C61.43 87.7086 63.5061 87.6288 64.9215 86.4033L100.128 55.9199C101.928 54.3613 101.976 51.5849 100.231 49.9647L68.5 20.5M14.5 53L68.5 20.5"
                            stroke="#A3C73F"
                            strokeWidth={2}
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </View>
                      <Text style={styles.vectorLabel1}>1</Text>
                    </View>
                    <View style={styles.containerTextBlock}>
                      <Text style={styles.textBlockHeader}>Block 1</Text>
                      <Text style={styles.textBlock}>Temperature: 32°</Text>
                      <Text style={styles.textBlock}>Humidity : 78%</Text>
                    </View>
                    {/* Tombol panah dengan Iconsax */}
                    <View style={styles.cutoutButton}>
                      {/* Background lingkaran hijau */}
                      <Svg width={36} height={36} viewBox="0 0 36 36">
                        <Path
                          d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05888 27.9411 0 18 0C8.05888 0 0 8.05888 0 18C0 27.9411 8.05888 36 18 36Z"
                          fill="#B4DC45"
                        />
                      </Svg>
                      {/* Ikon panah dari Iconsax */}
                      <ArrowDown
                        variant="Linear"
                        size={26}
                        color="white"
                        style={styles.arrowIcon}
                      />
                    </View>
                  </View>
                </CornerCutComponent>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  navigation.replace('DetailBlockTwo');
                }}>
                <CornerCutComponent
                  width={cardWidth}
                  height={175}
                  cutSize={40.5}
                  backgroundColor="#ffffff"
                  borderRadius={22}>
                  <View style={styles.cardBlockContent}>
                    <View style={styles.containerVector}>
                      {/* Frame notifikasi Fertilizer */}
                      {/* <View style={styles.notifIconFertilizer}>
            <Video
              source={require('./assets/videos/pupuk.mp4')}
              style={{ width: 24, height: 24 }}
              resizeMode="cover"
              repeat
              muted
              paused={true}
            />
          </View>
          <View style={styles.notifIconWater}>
            <Video
              source={require('./assets/videos/air.mp4')}
              style={{ width: 24, height: 24 }}
              resizeMode="cover"
              repeat
              muted
              paused={true}
            />
          </View> */}
                      <View style={styles.svgContainer}>
                        <Svg
                          width={102}
                          height={77}
                          viewBox="0 0 102 77"
                          fill="none">
                          <Path
                            d="M1.49996 43.5C1.14581 38.8961 14.7443 18.9287 17.8669 14.4109C18.2851 13.8058 18.8567 13.3446 19.5312 13.0509L45.6306 1.68501C47.7332 0.769373 50.1736 1.80538 50.9753 3.95399L62 33.5L97.6325 47.988C101.055 49.3794 100.923 54.2696 97.4307 55.4746L38.7879 75.7105C37.3813 76.1959 35.8216 75.8604 34.739 74.8397L1.49996 43.5Z"
                            fill="#F0F8DA"
                          />
                          <Path
                            d="M1.49996 43.5C1.14581 38.8961 14.7443 18.9287 17.8669 14.4109C18.2851 13.8058 18.8567 13.3446 19.5312 13.0509L45.6306 1.68501C47.7332 0.769373 50.1736 1.80538 50.9753 3.95399L62 33.5M1.49996 43.5L34.739 74.8397C35.8216 75.8604 37.3813 76.1959 38.7879 75.7105L97.4307 55.4746C100.923 54.2696 101.055 49.3794 97.6325 47.988L62 33.5M1.49996 43.5L62 33.5"
                            stroke="#A3C73F"
                            strokeWidth={2}
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </View>
                      <Text style={styles.vectorLabel2}>2</Text>
                    </View>
                    <View style={styles.containerTextBlock}>
                      <Text style={styles.textBlockHeader}>Block 2</Text>
                      <Text style={styles.textBlock}>Temperature: 32°</Text>
                      <Text style={styles.textBlock}>Humidity : 70%</Text>
                    </View>
                    {/* Tombol panah dengan Iconsax */}
                    <View style={styles.cutoutButton}>
                      {/* Background lingkaran hijau */}
                      <Svg width={36} height={36} viewBox="0 0 36 36">
                        <Path
                          d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05888 27.9411 0 18 0C8.05888 0 0 8.05888 0 18C0 27.9411 8.05888 36 18 36Z"
                          fill="#B4DC45"
                        />
                      </Svg>
                      {/* Ikon panah dari Iconsax */}
                      <ArrowDown
                        variant="Linear"
                        size={26}
                        color="white"
                        style={styles.arrowIcon}
                      />
                    </View>
                  </View>
                </CornerCutComponent>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.fieldPortableList}>
      <View style={styles.headerFieldPortable}>
        <Text style={{ fontSize: 14, fontWeight: 600 }}>
          Portable Tools Scanning History
        </Text>
        <TouchableOpacity onPress={() => {
          // Handle show all action
          console.log('Show all portable tools');
        }}>
          <View style={styles.showAll}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'SpaceGrotesk-Regular',
                fontWeight: 400,
                color: '#B4DC45',
              }}>
              Show All
            </Text>
            <Maximize1 color="#B4DC45" variant="Broken" size={24} />
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingPortable}>
          <ActivityIndicator size="large" color="#B4DC45" />
          <Text style={styles.loadingText}>Loading portable tools data...</Text>
        </View>
      ) : (
        <FlatList
          data={portableData}
          renderItem={renderPortableItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          snapToInterval={270} // 254 + 16 margin
          snapToAlignment="start"
          decelerationRate="fast"
          onRefresh={fetchPortableData}
          refreshing={loading}
        />
      )}
    </View>
        </ScrollView>
      </View>
      <Modal
        visible={showDurationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDurationModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{fontSize: 24}}>Set Duration (minutes)</Text>
            <View style={styles.durationInputContainer}>
              <TouchableOpacity
                onPress={() => setSelectedDuration(d => Math.max(1, d - 1))}
                style={styles.durationButton}>
                <Text style={styles.durationButtonText}>–</Text>
              </TouchableOpacity>
              <Text style={styles.durationText}>{selectedDuration}</Text>
              <TouchableOpacity
                onPress={() => setSelectedDuration(d => Math.min(120, d + 1))}
                style={styles.durationButton}>
                <Text style={styles.durationButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                onPress={handleStartProcess}
                style={styles.confirmButton}>
                <Text style={styles.confirmText}>Start</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowDurationModal(false)}
                style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
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
    </SafeAreaView>
  );
};

const CARD_RADIUS = 1;
const CUTOUT_DIAM = 50;
const CUTOUT_RADIUS = CUTOUT_DIAM / 2;
const {width: screenWidth} = Dimensions.get('window');
const cardWidth = (screenWidth - 45.5) / 2;

const styles = StyleSheet.create({
  home: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 19.5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 100,
    marginRight: 10,
  },
  username: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 14,
    color: '#333',
  },
  card: {
    width: '100%',
    height: 162,
    borderRadius: 16,
    overflow: 'hidden',
    // justifyContent: 'flex-start',
    padding: 1,
    marginTop: 12,
  },
  image: {
    borderRadius: 16,
  },
  location: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 100,
    marginLeft: -5,
    marginTop: 10,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: 400,
    color: 'white',
    marginLeft: 4,
  },
  weatherSectionTwo: {
    width: 159,
    height: 44,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -90, // tambahkan sedikit spasi setelah location
    // marginLeft: 16, // sejajar dengan location
    borderRadius: 12,
    gap: 10, // aktifkan jika desainnya rounded
  },

  weatherText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 6,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  detailSectionTwo: {
    flexDirection: 'column',
    gap: 1,
    alignContent: 'center',
  },
  detailSectionTwoText: {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: 'SpaceGrotesk-Regular',
    color: 'white',
  },
  gradientLine: {
    width: 319,
    height: 2,
    opacity: 0.62,
    marginTop: 20,
    alignSelf: 'center',
    borderRadius: 1,
    marginBottom: 10,
  },
  // detailSectionThree: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   width: 314,
  //   height: 36,
  //   alignItems: "center",
  // },
  detailSectionThree: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // pakai paddingHorizontal yang sama dengan container utama
    paddingHorizontal: 16,
    height: 36,
    // jangan set width tetap — biarkan melebar sesuai parent
    width: '100%',
  },
  detailSectionThreeText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'SpaceGrotesk-Regular',
    color: 'white',
  },
  cardTwo: {
    width: '100%',
    height: 164,
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
  ph: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: -8,
    gap: 2,
  },
  nitrogen: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: -8,
    gap: 2,
  },
  phosphor: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: -8,
    gap: 2,
  },
  kalium: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: -8,
    gap: 2,
  },
  arrowOne: {
    marginHorizontal: -8,
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
    gap: 12.5,
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
    elevation: 2,
  },
  powerIcon: {},
  powerButtonContainer: {},
  fieldList: {
    height: 201,
    marginBottom: 22.5,
  },
  headerFieldList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  showAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  containerBlock: {
    height: 175,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  cardBlock: {
    backgroundColor: 'white',
    width: cardWidth,
    height: 175,
    borderRadius: 16,
    gap: 1,
  },
  containerTextBlock: {
    alignItems: 'flex-start',
    top: 111,
    paddingHorizontal: 12,
    width: '100%',
    height: 52,
  },
  textBlockHeader: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  textBlock: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  containerVector: {
    position: 'absolute',
    width: 147,
    height: 87.5,
    top: 16,
    left: 10,
    // example background or children can be added here
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  notifIconWater: {
    position: 'absolute',
    width: 24,
    height: 24,
    top: -12,
    left: -4,
    borderRadius: 24,
    borderWidth: 0.34,
    borderColor: '#ddd',
    overflow: 'hidden',
    zIndex: 10, // agar video terpotong sesuai radius
  },
  notifIconFertilizer: {
    position: 'absolute',
    width: 24,
    height: 24,
    top: -12,
    left: 24,
    borderRadius: 24,
    borderWidth: 0.34,
    borderColor: '#ddd',
    overflow: 'hidden',
    zIndex: 10,
  },
  svgContainer: {
    width: 100, // +8px
    height: 85, // -2px atau sesuai proporsi
    left: 20,
    top: 0, // memastikan isi clip ke dalam radius
    backgroundColor: '#white',
  },
  vectorLabel1: {
    position: 'absolute',
    width: 10,
    height: 20,
    top: 36,
    left: 70, // 22px offset wrapper + left teks 70px
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#A3C73F',
  },
  vectorLabel2: {
    position: 'absolute',
    width: 10,
    height: 20,
    top: 40,
    left: 60, // 22px offset wrapper + left teks 70px
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#A3C73F',
  },
  // … style lainnya …
  cutoutMask: {
    position: 'absolute',
    width: CUTOUT_DIAM,
    height: CUTOUT_DIAM,
    borderRadius: CUTOUT_RADIUS,
    backgroundColor: '#f5f5f5', // warna background layar
    bottom: -CUTOUT_RADIUS + 18,
    right: -CUTOUT_RADIUS + 16,
    zIndex: 1,
  },
  cutoutButton: {
    position: 'absolute',
    width: 36,
    height: 36,
    bottom: 0, // adjusted positioning
    right: 0, // adjusted positioning
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    position: 'absolute',
    transform: [{rotate: '230deg'}],
  },
  cloud: {
    flex: 1,
    height: 76.05,
    backgroundColor: 'transparent',
    marginBottom: 20,
    left: 115,
    alignItems: 'center',
  },
  ellipsCloud: {
    top: 70,
    left: 15,
  },
  cloudOne: {
    width: 61.00855255126953,
    height: 37.37173080444336,
    top: 10,
    zIndex: 10,
    paddingHorizontal: 5,
  },
  cloudTwo: {
    width: 83,
    height: 50.84294128417969,
    top: -50,
    paddingHorizontal: 16,
  },
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
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
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
    color: 'white',
    fontWeight: '600',
  },
  cancelText: {
    color: '#333',
  },
  cornerCutContainer: {
    overflow: 'hidden',
  },
  cardBlockContent: {
    flex: 1,
    position: 'relative',
  },
  fieldPortableList: {
    height: 201,
  },
  headerFieldPortable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  containerBlockPortable: {
    height: 175,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    marginHorizontal: -10,
  },
  cardContentPortable: {
    flex: 1,
    position: 'relative',
  },
  containerInfoPortable: {
    width: 184,
    height: 116,
    left: 12,
    top: 12,
  },
  infoArea: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 5,
  },
  infoSensor: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 12,
    fontWeight: "600",
  },
  infoDateSensor: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 12,
    fontWeight: "400",
    marginTop: 6,
    color: "#919EB0"
  },
  loadingPortable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  loadingContainerHome: {
    paddingTop: 350,
    justifyContent: 'center',
  },
});

export default HomeFix;
