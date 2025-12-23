import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '@Containers/Tab/HomeScreen';
import DetailBlock from '@Containers/DetailBlock';
import ReadSoilDetail from './src/Containers/Tab/PortableSensorScreen/ReadSoilDetail';
import AllPortableTools from './src/Containers/Tab/PortableSensorScreen/AllPortableTools';
import AllBlock from './src/Containers/Tab/HomeScreen/AllBlock';

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
    from?: 'HomeFix' | 'AllBlock'; 
  };
  DetailBlockTwo: {
    from?: 'HomeFix' | 'AllBlock'; 
  };
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
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      
      <Stack.Screen name="DetailBlockOne" component={DetailBlock} />
      <Stack.Screen name="DetailBlockTwo" component={DetailBlock} />
      
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