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
  import {HomeStackParamList} from '../../../HomeStack'; 
  
  type Props = NativeStackScreenProps<HomeStackParamList, 'ReadSoilDetail'>;

const ReadSoilDetail: React.FC<Props> = ({ navigation, route }) => {
  const { portableData } = route.params;
  const gaugeValue = -100;

  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: gaugeValue,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [gaugeValue]);

  // Helper function to get sensor value by type with proper formatting
  const getSensorValue = (sensorType: string): string => {
    const sensor = portableData.sensors?.find(s => 
      s.keterangan_sensor?.toLowerCase() === sensorType.toLowerCase()
    );
    
    if (!sensor || sensor.nilai_sensor == null) {
      return 'N/A';
    }
    
    const value = Number(sensor.nilai_sensor);
    if (isNaN(value)) {
      return 'N/A';
    }
    
    switch (sensorType.toLowerCase()) {
      case 'temperature':
        return value.toFixed(0); 
      case 'humidity':
        return value.toFixed(0); 
      case 'ph':
        return value.toFixed(1); 
      case 'ec':
        return Math.round(value).toString(); 
      case 'nitrogen':
      case 'phosphorus':
      case 'kalium':
        return value.toFixed(0);
      default:
        return value.toFixed(0);
    }
  };
  const getSensorNumericValue = (sensorType: string): number => {
    const sensor = portableData.sensors?.find(s => 
      s.keterangan_sensor?.toLowerCase() === sensorType.toLowerCase()
    );
    return sensor?.nilai_sensor ? Number(sensor.nilai_sensor) : NaN;
  };
  const getSensorStatus = (sensorType: string) => {
    const numValue = getSensorNumericValue(sensorType);
    
    if (isNaN(numValue)) {
      return { status: 'N/A', color: 'gray', icon: 'remove' };
    }

    switch (sensorType.toLowerCase()) {
      case 'ph':
        if (numValue < 5.5) return { status: 'Low', color: 'red', icon: 'arrow-down' };
        if (numValue > 6.5) return { status: 'High', color: 'red', icon: 'arrow-up' };
        return { status: 'Good', color: 'green', icon: 'arrow-up' };
      
      case 'ec':
        if (numValue < 200) return { status: 'Low', color: 'red', icon: 'arrow-down' };
        if (numValue > 1000) return { status: 'High', color: 'red', icon: 'arrow-up' };
        return { status: 'Good', color: 'green', icon: 'arrow-up' };
      
      case 'nitrogen':
        if (numValue < 50) return { status: 'Low', color: 'red', icon: 'arrow-down' };
        if (numValue > 150) return { status: 'High', color: 'red', icon: 'arrow-up' };
        return { status: 'Good', color: 'green', icon: 'arrow-up' };
      
      case 'phosphorus':
        if (numValue < 10) return { status: 'Low', color: 'red', icon: 'arrow-down' };
        if (numValue > 25) return { status: 'High', color: 'red', icon: 'arrow-up' };
        return { status: 'Good', color: 'green', icon: 'arrow-up' };
      
      case 'kalium':
        if (numValue < 150) return { status: 'Low', color: 'red', icon: 'arrow-down' };
        if (numValue > 250) return { status: 'High', color: 'red', icon: 'arrow-up' };
        return { status: 'Good', color: 'green', icon: 'arrow-up' };
      
      default:
        return { status: 'Good', color: 'green', icon: 'arrow-up' };
    }
  };

  // di atas component ReadSoilDetail
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
  
    // Tanggal format “Monday, 13 June 2025”
    const datePart = date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  
    // Waktu 24‑jam “15:00”
    const timePart = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  
    return `${datePart} at ${timePart}`;
  };
  

  const temperatureValue = getSensorValue('temperature');
  const humidityValue = getSensorValue('humidity');
  const phValue = getSensorValue('ph');
  const ecValue = getSensorValue('ec');
  const nitrogenValue = getSensorValue('nitrogen');
  const phosphorusValue = getSensorValue('phosphorus');
  const kaliumValue = getSensorValue('kalium');

  const phStatus = getSensorStatus('ph');
  const ecStatus = getSensorStatus('ec');
  const nitrogenStatus = getSensorStatus('nitrogen');
  const phosphorusStatus = getSensorStatus('phosphorus');
  const kaliumStatus = getSensorStatus('kalium');

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
              style={{ transform: [{ rotate: '360deg' }] }}
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
            {portableData.keterangan_portable}
          </Text>
          <ArrowLeft2
            color="black"
            variant="Linear"
            size={24}
            style={{ transform: [{ rotate: '360deg' }] }}
            opacity={0}
          />
        </View>
        <Text style={styles.textInfoTested}>Tested on {formatDate(portableData.created_at)}</Text>
        <View style={styles.containerTransmisi}>
          <View style={[styles.cardTransmisi, { marginRight: 12 }]}>
            <View style={styles.cardDetailTransmisi}>
              <View style={styles.Transmisi}>
                <GaugeSvg />
                <View style={{ top: -100, right: -105 }}>
                  <Ellips />
                </View>
              </View>
              <Text style={styles.nameSensorTransmisi}>Soil Temperature</Text>
            </View>
            <Text style={styles.valueTransmisi}>{temperatureValue}°</Text>
          </View>
          <View style={styles.cardTransmisi}>
            <View style={styles.cardDetailTransmisi}>
              <View style={styles.Transmisi}>
                <GaugeSvg />
              </View>
              <Text style={styles.nameSensorTransmisi}>Soil Humidity</Text>
            </View>
            <Text style={styles.valueTransmisi}>{humidityValue}%</Text>
          </View>
        </View>

        <View style={styles.cardTwo}>
          <Text style={styles.soilTitle}>Soil Statistic</Text>
          <View style={styles.soilStatisticOne}>
            <View style={styles.detailStatisticOne}>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>PH</Text>
                <Text style={styles.statValue}>{phValue}</Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons name={phStatus.icon} size={18} color={phStatus.color} />
                <Text style={[styles.statStatus, { color: phStatus.color }]}>
                  {phStatus.status}
                </Text>
              </View>
            </View>

            <View style={styles.detailStatisticOne}>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Conductivity</Text>
                <Text style={styles.statValue}>{ecValue}</Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons name={ecStatus.icon} size={18} color={ecStatus.color} />
                <Text style={[styles.statStatus, { color: ecStatus.color }]}>
                  {ecStatus.status}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.soilStatisticTwo}>
            <View style={styles.detailStatisticOne}>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Nitrogen</Text>
                <Text style={styles.statValue}>{nitrogenValue} mg/kg</Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons name={nitrogenStatus.icon} size={18} color={nitrogenStatus.color} />
                <Text style={[styles.statStatus, { color: nitrogenStatus.color }]}>
                  {nitrogenStatus.status}
                </Text>
              </View>
            </View>

            <View style={styles.detailStatisticOne}>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Phosphor</Text>
                <Text style={styles.statValue}>{phosphorusValue} mg/kg</Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons name={phosphorusStatus.icon} size={18} color={phosphorusStatus.color} />
                <Text style={[styles.statStatus, { color: phosphorusStatus.color }]}>
                  {phosphorusStatus.status}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.soilStatisticTwo}>
            <View style={styles.detailStatisticOneKal}>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Kalium</Text>
                <Text style={styles.statValue}>{kaliumValue} mg/kg</Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons name={kaliumStatus.icon} size={18} color={kaliumStatus.color} />
                <Text style={[styles.statStatus, { color: kaliumStatus.color }]}>
                  {kaliumStatus.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
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
      marginTop: 14,
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
      height: 223,
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
    textInfoTested: {
        fontSize: 12,
      color: '#919EB0',
      textAlign: 'left',
      fontFamily: 'SpaceGrotesk-Regular',
      top: 8,
      left: 2,

    }
  
    // ... styles lainnya
  });
  
  export default ReadSoilDetail;
  