import React, { useContext } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useDetailBlock} from './useDetailBlock';
import {ExpandableBlock} from './Section/ExpandableBlock';
import {DeviceCard} from './Section/DeviceCard';
import DurationModal from '@Organism/DurationModal';
import ConfirmModal from '@Containers/Tab/HomeScreen/Modal/ConfirmModal';
import {styles} from './styles';
import HeaderBack from '@Molecule/HeaderBack';
import {useHeaderMode} from '@Hooks/useHeaderMode';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '@Constants/RouteParamsList.constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { AuthContext } from '@Context/AuthContext';

type DetailBlockRouteProp = RouteProp<RootStackParamList, 'DetailBlock'>;

const DetailBlock: React.FC = () => {
  const route = useRoute<DetailBlockRouteProp>();
  const {blockId} = route.params;

  const {
    blockTitle,
    blockControls,
    sensorData,
    loading,
    showDurationModal,
    showConfirm,
    currentProcess,
    confirmProcess,
    inputMinutes,
    inputSeconds,
    handleToggle,
    handleStartProcess,
    handleConfirmStop,
    setShowDurationModal,
    setShowConfirm,
    handleMinutesChange,
    handleSecondsChange,
    refreshData, // Tambahkan ini di hook useDetailBlock
  } = useDetailBlock(blockId);

  const {handleScroll, headMode: headerMode} = useHeaderMode();
  const [refreshing, setRefreshing] = React.useState(false);
  const {user} = useContext(AuthContext)

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshData(); // Function ini harus ada di useDetailBlock
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

  const expandableBlocks =
    blockId === 4
      ? [
          {
            title: 'Water',
            animationSource: require('@Assets/videos/air.mp4.lottie.json'),
            blockCount: 2,
            blockType: 'water' as const,
            mainControl: blockControls.main,
            row1Control: blockControls.row1Water,
            row2Control: blockControls.row2Water,
            isDisabled: blockControls.main.isFertilizerOn,
          },
          {
            title: 'Fertilizer',
            animationSource: require('@Assets/videos/pupuk.mp4.lottie.json'),
            blockCount: 2,
            blockType: 'fertilizer' as const,
            mainControl: blockControls.main,
            row1Control: blockControls.row1Fertilizer,
            row2Control: blockControls.row2Fertilizer,
            isDisabled: blockControls.main.isWaterOn,
          },
        ]
      : [];

  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 10;

  const canControl = user?.role !== 'farmer';
  const isFarmer = user?.role === 'farmer';

  return (
    <SafeAreaView style={styles.safe}>
      <HeaderBack
        back={true}
        title={blockTitle}
        animated={true}
        mode={headerMode}
      />
      <View
        style={[
          styles.main,
          {
            paddingTop: HEADER_HEIGHT + insets.top,
          },
        ]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          onScroll={handleScroll}
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

          {canControl && expandableBlocks.map((block, index) => (
            <ExpandableBlock key={index} {...block} onToggle={handleToggle} />
          ))}

          {blockControls.devices?.map((device, index) => (
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
        type={confirmProcess?.type || 'water'}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmStop}
      />
    </SafeAreaView>
  );
};

export default DetailBlock;