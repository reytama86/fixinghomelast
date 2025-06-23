// HomeStack.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeFix from './components/Main/Home/Home';
import DetailBlockOne from './components/Main/Home/DetailBlockOne';
import DetailBlockTwo from './components/Main/Home/DetailBlockTwo';

export type HomeStackParamList = {
  HomeFix: undefined;
  DetailBlockOne: undefined;
  DetailBlockTwo: undefined;
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
    </Stack.Navigator>
  );
}
