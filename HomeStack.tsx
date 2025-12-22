import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '@Containers/Main/Home';
import DetailBlockOne from './src/Containers/Main/Home/DetailBlockOne';
import DetailBlockTwo from './src/Containers/Main/Home/DetailBlockTwo';
import ReadSoilDetail from './src/Containers/Main/ReadSoil/ReadSoilDetail';
import AllPortableTools from './src/Containers/Main/ReadSoil/AllPortableTools';
import AllBlock from './src/Containers/Main/Home/AllBlock';


export type SensorData = {
  keterangan_sensor: string;
  nilai_sensor: number;
};

export type PortableToolData = {
  id: number;
  keterangan_portable: string;
  created_at: string;
  sensors: SensorData[];
};

export type HomeStackParamList = {
  Home: undefined;
  DetailBlockOne: {
    from?: 'Home' | 'AllBlock'; 
  } | undefined;
  DetailBlockTwo: {
    from?: 'Home' | 'AllBlock';
  } | undefined;
  ReadSoilDetail: {
    portableData: PortableToolData;
  };
  AllPortableTools: undefined;
  AllBlock: undefined;
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
      <Stack.Screen name="Home" component={Home} />
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
      <Stack.Screen 
        name="AllBlock" 
        component={AllBlock}
        options={{
          animation: 'slide_from_right', 
        }}
      />
    </Stack.Navigator>
  );
}