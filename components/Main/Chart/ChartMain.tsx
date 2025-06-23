// src/screens/DashboardScreen.tsx
import React from 'react';
import { ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import Temperature from './Temperature';
import Humidity from './Humidity';
import SoilTemperature from './SoilTemperature';
import Light from './Light';
import SoilMoisture from './SoilMoisture';
import SoilEc from './SoilEc';
import SoilPh from './SoilPh';
import SoilNitrogen from './SoilNitrogen';
import SoilPhospor from './SoilPhospor';
import SoilKalium from './SoilKalium';

export default function ChartMain() {
  return (
    <SafeAreaView style={{flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! - 40 : 0}}>
      <ScrollView
    contentContainerStyle={{
      marginTop: -50,  // geser konten ke atas
    }}>
        <Temperature />
        <Humidity/>
        <Light/> 
        <SoilTemperature/>
        <SoilMoisture/>
        <SoilEc/>
        <SoilPh/>
        <SoilNitrogen/>
        <SoilPhospor/>
        <SoilKalium/>     
      </ScrollView>
    </SafeAreaView>
  );
}
