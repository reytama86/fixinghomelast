import React, {useContext} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import {useDetailBlock} from './useDetailBlock';
import {WaterControlCard} from './Section/WaterControlCard';
import ScheduleCard from '@Atom/ScheduleCard';
import ScheduleEditModal from '@Organism/ScheduleEditModal';
import {DeviceCard} from './Section/DeviceCard';
import DurationModal from '@Organism/DurationModal';
import ConfirmModal from '@Containers/Tab/HomeScreen/Modal/ConfirmModal';
import {styles} from './styles';
import HeaderBack from '@Molecule/HeaderBack';
import {useHeaderMode} from '@Hooks/useHeaderMode';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '@Constants/RouteParamsList.constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AuthContext} from '@Context/AuthContext';
import FertilizerBlock01 from './Section/FertilizerBlock01';

type DetailBlockRouteProp = RouteProp<RootStackParamList, 'DetailBlock'>;

const DetailBlock: React.FC = () => {
  const route = useRoute<DetailBlockRouteProp>();
  const {blockId} = route.params;

  const {user} = useContext(AuthContext);
  const {handleScroll, headMode: headerMode} = useHeaderMode();
  const [refreshing, setRefreshing] = React.useState(false);
  const insets = useSafeAreaInsets();

  const {
    blockTitle,
    blockControls,
    hasControl,
    hasSensor,
    hasSchedule,
    sensorData,
    loading,
    showDurationModal,
    showConfirm,
    showScheduleModal,
    inputMinutes,
    inputSeconds,
    handleToggle,
    handleStartProcess,
    handleConfirmStop,
    handleOpenSchedule,
    handleSaveSchedule,
    handleDeleteSchedule,
    setShowDurationModal,
    setShowConfirm,
    setShowScheduleModal,
    handleMinutesChange,
    handleSecondsChange,
    refreshData,
  } = useDetailBlock(blockId);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  if (loading && !sensorData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B4DC45" />
        <Text style={styles.loadingText}>Loading sensor data...</Text>
      </View>
    );
  }

  const HEADER_HEIGHT = 10;
  const canControl = user?.role !== 'farmer';
  const isFarmer = user?.role === 'farmer';

  const renderControl = () => {
    if (!canControl || !hasControl) return null;

    if (blockControls.type === 'block01') {
      return <FertilizerBlock01 control={blockControls.block01} />;
    }

    // blockControls.type === 'simple' -> berlaku untuk Block 4, 3, dan 2
    return (
      <>
        <WaterControlCard
          title="Water"
          animationSource={require('@Assets/videos/air.mp4.lottie.json')}
          isActive={blockControls.main.isWaterOn}
          remaining={blockControls.main.remainingWaterTime}
          lastAction={blockControls.main.lastWaterAction}
          onToggle={handleToggle}
        />
        {hasSchedule && blockControls.schedule && (
          <ScheduleCard
            schedule={blockControls.schedule.schedule}
            onPress={handleOpenSchedule}
          />
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <HeaderBack
        back={true}
        title={blockTitle}
        animated={true}
        mode='normal'
      />
      <View
        style={[
          styles.main,
          {
            paddingTop: Platform.OS === 'ios' ? 0 : HEADER_HEIGHT + insets.top,
          },
        ]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#B4DC45']}
              tintColor="#B4DC45"
              progressViewOffset={HEADER_HEIGHT + insets.top}
            />
          }>
          <View style={{height: 30}} />

          {renderControl()}

          {hasSensor &&
            blockControls.devices?.map((device, index) => (
              <DeviceCard
                key={index}
                deviceNumber={device}
                sensorData={sensorData}
                isFarmer={isFarmer}
              />
            ))}
        </ScrollView>
      </View>

      <DurationModal
        visible={showDurationModal}
        currentProcess="water"
        inputMinutes={inputMinutes}
        inputSeconds={inputSeconds}
        onMinutesChange={handleMinutesChange}
        onSecondsChange={handleSecondsChange}
        onCancel={() => setShowDurationModal(false)}
        onStart={handleStartProcess}
      />

      <ConfirmModal
        visible={showConfirm}
        type="water"
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmStop}
      />

      {hasSchedule &&
        blockControls.type === 'simple' &&
        blockControls.schedule && (
          <ScheduleEditModal
            visible={showScheduleModal}
            schedule={blockControls.schedule.schedule}
            onCancel={() => setShowScheduleModal(false)}
            onSave={handleSaveSchedule}
            onDelete={handleDeleteSchedule}
          />
        )}
    </SafeAreaView>
  );
};

export default DetailBlock;