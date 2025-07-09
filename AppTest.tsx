// AppTest.tsx
import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from './context/AuthContext';
import BackgroundVideo from './components/Main/BackgroundVideo';
import Intro from './Intro';
import Login from './components/Auth/Login';
import MainTabs from './MainTabs';

export type RootStackParamList = {
  Intro: undefined;
  Login: undefined;
  Main: undefined;
};

const backgroundAnimation = require('./assets/videos/topography.mp4.lottie.json');

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppTest: React.FC = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <BackgroundVideo animationSource={backgroundAnimation}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#B4DC45" />
        </View>
      </BackgroundVideo>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          // Flow sebelum login
          <>
            <Stack.Screen name="Intro" component={Intro} />
            <Stack.Screen name="Login" component={Login} />
          </>
        ) : (
          // Flow setelah login
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppTest;
