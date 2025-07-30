// HomeStack.tsx - Updated with AllPortableTools screen
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeFix from './components/Main/Home/Home';
import DetailBlockOne from './components/Main/Home/DetailBlockOne';
import DetailBlockTwo from './components/Main/Home/DetailBlockTwo';
import ReadSoilDetail from './components/Main/ReadSoil/ReadSoilDetail';
import AllPortableTools from './components/Main/ReadSoil/AllPortableTools'; // Import halaman baru

// Define the sensor data structure
export type SensorData = {
  keterangan_sensor: string;
  nilai_sensor: number;
};

// Define the portable tool data structure
export type PortableToolData = {
  id: number;
  keterangan_portable: string;
  created_at: string;
  sensors: SensorData[];
};

export type HomeStackParamList = {
  HomeFix: undefined;
  DetailBlockOne: undefined;
  DetailBlockTwo: undefined;
  ReadSoilDetail: {
    portableData: PortableToolData;
  };
  AllPortableTools: undefined; // Tambahkan screen baru
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_left', 
        animationTypeForReplace: 'pop',
      }}
    >
      <Stack.Screen name="HomeFix" component={HomeFix} />
      <Stack.Screen name="DetailBlockOne" component={DetailBlockOne} />
      <Stack.Screen name="DetailBlockTwo" component={DetailBlockTwo} />
      <Stack.Screen 
        name="ReadSoilDetail" 
        component={ReadSoilDetail}
        options={{
          animation: 'slide_from_right', 
        }}
      />
      <Stack.Screen 
        name="AllPortableTools" 
        component={AllPortableTools}
        options={{
          animation: 'slide_from_right', 
        }}
      />
    </Stack.Navigator>
  );
}