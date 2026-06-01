import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ScrollView,
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  BackHandler,
  Platform,
  InteractionManager,
  ActivityIndicator,
} from 'react-native';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

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
import { useHeaderMode } from '@Hooks/useHeaderMode';

import DownloadReportModal from './Section/DownloadReportModal';

import { styles } from './styles';

export default function ChartScreen() {
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] =
    useState(false);

  const [openingModal, setOpeningModal] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription =
        BackHandler.addEventListener(
          'hardwareBackPress',
          onBackPress,
        );

      return () => subscription.remove();
    }, [navigation]),
  );

  const handleDownload = useCallback(() => {
    if (openingModal) return;

    setOpeningModal(true);

    InteractionManager.runAfterInteractions(() => {
      try {
        setModalVisible(true);
      } catch (error) {
        console.error(
          'Open Modal Error:',
          error,
        );
      } finally {
        setOpeningModal(false);
      }
    });
  }, [openingModal]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const { handleScroll, headMode } =
    useHeaderMode();

  const insets = useSafeAreaInsets();

  const HEADER_HEIGHT = 60;
  const FOOTER_HEIGHT = 84;

  const sensorSections = useMemo(
    () => (
      <>
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
      </>
    ),
    [],
  );

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <HeaderBack
          title="Summary Sensor"
          back
          animated
          mode="normal"
        />

        <ScrollView
          contentContainerStyle={{
            paddingTop:
              HEADER_HEIGHT +
              insets.top -
              100,

            paddingBottom:
              Platform.OS === 'ios'
                ? 0
                : FOOTER_HEIGHT +
                  insets.bottom +
                  16,

            marginTop:
              Platform.OS === 'ios'
                ? -60
                : 0,
          }}
          // onScroll={handleScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          {sensorSections}
        </ScrollView>

        <View style={styles.footerWrapper}>
          <View style={styles.footerBox}>
            <TouchableOpacity
              style={[
                styles.downloadButton,
                openingModal &&
                  styles.downloadButtonDisabled,
              ]}
              onPress={handleDownload}
              activeOpacity={0.8}
              disabled={openingModal}
            >
              {openingModal ? (
                <ActivityIndicator
                  size="small"
                  color="#000"
                />
              ) : (
                <Text style={styles.downloadText}>
                  Download Report
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <DownloadReportModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onScreen="Chart"
      />
    </View>
  );
}