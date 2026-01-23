import React, {useCallback, useState} from 'react';
import {
  ScrollView,
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  BackHandler,
  Platform,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import Temperature from './Section/ListSensor/Temperature';
import Humidity from './Section/ListSensor/Humidity';
import SoilTemperature from './Section/ListSensor/SoilTemperature';
import Light from './Section/ListSensor/Light';
import SoilMoisture from './Section/ListSensor/SoilMoisture';
import SoilEc from './Section/ListSensor/SoilEc';
import SoilPh from './Section/ListSensor/SoilPh';
import SoilNitrogen from './Section/ListSensor/SoilNitrogen';
import SoilPhospor from './Section/ListSensor/SoilPhospor';
import SoilKalium from './Section/ListSensor/SoilKalium';
import HeaderBack from '@Molecule/HeaderBack';
import {useHeaderMode} from '@Hooks/useHeaderMode';
import DownloadReportModal from './Section/DownloadReportModal';
import {styles} from './styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function ChartScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  const handleDownload = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const {handleScroll, headMode} = useHeaderMode();
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 60;
  const FOOTER_HEIGHT = 84;

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBack title="Summary Sensor" back animated mode={headMode} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + insets.top - 100,
          paddingBottom: Platform.OS === 'ios' ? 0 : FOOTER_HEIGHT + insets.bottom + 16,
          marginTop: Platform.OS === 'ios' ? -60 : 0,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        <Temperature />
        <Humidity />
        <Light />
        <SoilTemperature />
        <SoilMoisture />
        <SoilEc />
        <SoilPh />
        <SoilNitrogen />
        <SoilPhospor />
        <SoilKalium />
      </ScrollView>

      <View style={styles.footerWrapper}>
        <View style={styles.footerBox}>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleDownload}>
            <Text style={styles.downloadText}>Download Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      <DownloadReportModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onScreen="Chart"
      />
    </SafeAreaView>
  );
}
