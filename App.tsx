import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from './src/Context/AuthContext';
import BackgroundVideo from '@Containers/Main/BackgroundVideo'
import Intro from '@Containers/SplashScreen';
import Login from '@Containers/Auth/Login';
import MainTabs from '@Containers/MainTab';

export type RootStackParamList = {
  Intro: undefined;
  Login: undefined;
  Main: undefined;
};

const backgroundAnimation = require('@Assets/videos/bgtypography.json');

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
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
    <BackgroundVideo animationSource={backgroundAnimation}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <>
            <Stack.Screen name="Intro" component={Intro} />
            <Stack.Screen name="Login" component={Login} />
          </>
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </BackgroundVideo>
  </NavigationContainer>
);

};

export default App;
