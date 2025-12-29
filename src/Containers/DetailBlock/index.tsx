import React from 'react';
import {View, Text, SafeAreaView, ScrollView, ActivityIndicator} from 'react-native';
import {useDetailBlock} from './useDetailBlock';
import {ExpandableBlock} from './Section/ExpandableBlock';
import {DeviceCard} from './Section/DeviceCard';
import DurationModal from '@Organism/DurationModal';
import ConfirmModal from '@Containers/Tab/HomeScreen/Modal/ConfirmModal';
import {styles} from './styles';
import HeaderBack from '@Molecule/HeaderBack';
import {useHeaderMode} from '@Hooks/useHeaderMode'; 
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '@Constants/RouteParamsList.constants';

type DetailBlockRouteProp = RouteProp<
  RootStackParamList,
  'DetailBlock'
>;


const DetailBlock: React.FC<any> = ({}) => {
  const route = useRoute<DetailBlockRouteProp>();
  const { blockId } = route.params;

  const {
    blockTitle,
    blockControls,
    sensorData,
    loading,
    showDurationModal,
    showConfirm,
    currentProcess,
    confirmType,
    inputMinutes,
    inputSeconds,
    handleToggle,
    handleStartProcess,
    handleConfirmStop,
    setShowDurationModal,
    setShowConfirm,
    handleMinutesChange,
    handleSecondsChange,
  } = useDetailBlock(blockId);

  const {handleScroll, headMode: headerMode} = useHeaderMode();

  if (loading && !sensorData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B4DC45" />
        <Text style={styles.loadingText}>Loading sensor data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <HeaderBack
        back={true}
        title={blockTitle}
        animated={true}
        mode={headerMode}
      />

      <View style={styles.main}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          <View style={{height: 30}} />

          {blockControls.expandableBlocks?.map((block, index) => (
            <ExpandableBlock key={index} {...block} onToggle={handleToggle} />
          ))}
          
          {blockControls.devices?.map((device, index) => (
            <DeviceCard key={index} deviceNumber={device} sensorData={sensorData} />
          ))}
        </ScrollView>
      </View>

      <DurationModal
        visible={showDurationModal}
        currentProcess={currentProcess?.type || null}
        inputMinutes={inputMinutes}
        inputSeconds={inputSeconds}
        onMinutesChange={handleMinutesChange}
        onSecondsChange={handleSecondsChange}
        onCancel={() => setShowDurationModal(false)}
        onStart={handleStartProcess}
      />

      <ConfirmModal
        visible={showConfirm}
        type={confirmType || 'water'}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmStop}
      />
    </SafeAreaView>
  );
};

export default DetailBlock;