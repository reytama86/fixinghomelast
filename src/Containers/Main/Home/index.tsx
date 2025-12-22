import React, {useState, useEffect, useCallback, useRef} from 'react';
import {View, ScrollView, BackHandler} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {HomeStackParamList} from '../../../../HomeStack';
import {useControl, usePageControl} from '../../../Context/ControlContext';

import Header from './Section/Header';
import WeatherCard from './Section/WeatherCard';
import SoilStatistic from './Section/SoilStatistic';
import ControlCentre from './Section/ControlCentre';
import FieldList from './Section/FieldList';
import PortableToolsList from './Section/PortableToolsList';
import DurationModal from './Section/Modals/DurationModal';
import ConfirmModal from './Modal/ConfirmModal';

import {styles} from './styles';

import { useHomeData } from '@Hooks/useHomeData';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const Home: React.FC<Props> = ({navigation}) => {
  const {setActivePage} = usePageControl();
  const {homeControl, block1Control, block1RowWater1Control, block1RowWater2Control, block1RowFertilizer1Control, block1RowFertilizer2Control} = useControl();

  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmType, setConfirmType] = useState<'water' | 'fertilizer' | null>(null);
  const [currentProcess, setCurrentProcess] = useState<'water' | 'fertilizer' | null>(null);
  const [inputMinutes, setInputMinutes] = useState<string>('1');
  const [inputSeconds, setInputSeconds] = useState<string>('0');

  const {
    sensorData,
    sensorDataBlock,
    portableData,
    loading,
    fetchSensorData,
    fetchDataBlock,
    fetchPortableData,
  } = useHomeData();

  const focusCallback = useCallback(() => {
    setActivePage('home');
    fetchSensorData();
    fetchDataBlock();
  }, [setActivePage, fetchSensorData, fetchDataBlock]);

  useFocusEffect(focusCallback);

  useEffect(() => {
    const backAction = () => {
      if (showDurationModal) {
        setShowDurationModal(false);
        return true;
      }
      if (showConfirm) {
        setShowConfirm(false);
        return true;
      }
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [showDurationModal, showConfirm]);

  const isBlock1WaterActive = 
    block1Control.isWaterOn ||
    block1RowWater1Control.isWaterOn ||
    block1RowWater2Control.isWaterOn;

  const isBlock1FertilizerActive =
    block1Control.isFertilizerOn ||
    block1RowFertilizer1Control.isFertilizerOn ||
    block1RowFertilizer2Control.isFertilizerOn;

  const isBlock1AnyActive = isBlock1WaterActive || isBlock1FertilizerActive;

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.home}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
          <Header />
          
          <WeatherCard sensorData={sensorData} />
          
          <SoilStatistic sensorData={sensorData} />
          
          <ControlCentre
            controlState={homeControl}
            isBlock1AnyActive={isBlock1AnyActive}
            onToggle={(type) => {
              setCurrentProcess(type);
              setShowDurationModal(true);
            }}
            onStop={(type) => {
              setConfirmType(type);
              setShowConfirm(true);
            }}
          />
          
          <FieldList
            sensorDataBlock={sensorDataBlock}
            navigation={navigation}
          />
          
          <PortableToolsList
            portableData={portableData}
            loading={loading}
            navigation={navigation}
            onRefresh={fetchPortableData}
          />
          
          <View style={{height: 20}} />
        </ScrollView>
      </View>

      <DurationModal
        visible={showDurationModal}
        currentProcess={currentProcess}
        inputMinutes={inputMinutes}
        inputSeconds={inputSeconds}
        onMinutesChange={setInputMinutes}
        onSecondsChange={setInputSeconds}
        onCancel={() => setShowDurationModal(false)}
        onStart={(duration) => {
          if (currentProcess) {
            homeControl.startProcess(currentProcess, duration);
          }
          setShowDurationModal(false);
          setInputMinutes('1');
          setInputSeconds('0');
        }}
      />

      <ConfirmModal
        visible={showConfirm}
        type={confirmType === 'water' ? 'water' : 'fertilizer'}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => {
          if (confirmType) {
            homeControl.stopProcess(confirmType);
          }
          setShowConfirm(false);
        }}
      />
    </SafeAreaView>
  );
};

export default Home;