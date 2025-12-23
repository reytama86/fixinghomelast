import React from 'react';
import {View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator} from 'react-native';
import {ArrowLeft2} from 'iconsax-react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from 'HomeStack';
import {useDetailBlock} from './useDetailBlock';
import {ExpandableBlock} from './Section/ExpandableBlock';
import {DeviceCard} from './Section/DeviceCard';
import DurationModal from '@Organism/DurationModal';
import ConfirmModal from '@Containers/Tab/HomeScreen/Modal/ConfirmModal';
import {styles} from './styles';

type DetailBlockProps = NativeStackScreenProps<
  HomeStackParamList,
  'DetailBlockOne' | 'DetailBlockTwo'
>;

const DetailBlock: React.FC<DetailBlockProps> = ({navigation, route}) => {
  const {
    blockNumber,
    blockTitle,
    blockControls,
    apiEndpoint,
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
    handleGoBack,
  } = useDetailBlock(route, navigation);

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
      <View style={styles.main}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack}>
              <ArrowLeft2 color="black" variant="Linear" size={24} />
            </TouchableOpacity>
            <Text style={styles.title}>{blockTitle}</Text>
            <View style={{width: 24}} />
          </View>

          {blockControls.expandableBlocks?.map((block, index) => (
            <ExpandableBlock key={index} {...block} onToggle={handleToggle} />
          ))}

          {blockControls.devices.map((device, index) => (
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
        onCancel={() => {
          setShowDurationModal(false);
        }}
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