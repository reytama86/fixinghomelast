import RouteName from '@Constants/RouteName.constants';
import { RootStackParamList } from '@Constants/RouteParamsList.constants';
import SplashScreen from '@Containers/SplashScreen';
import Login from '@Containers/Auth/Login';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { Platform, StatusBar, View, ActivityIndicator } from 'react-native';
import TabNavigator from './Tab';
import { AuthorizedScreens } from './Config';
import { AuthContext } from '@Context/AuthContext';
import { useNotificationHandler } from '../../utils/NotificationHandler' // ✅ Adjust path

const Stack = createStackNavigator<RootStackParamList>();

// ✅ Component wrapper untuk notification handler
const NotificationHandlerComponent = () => {
  useNotificationHandler();
  return null;
};

export default function StackNavigator() {
  const { userToken, isLoading, user } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#B4DC45" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* ✅ Setup notification handler hanya untuk developer */}
      {user?.role === 'developer' && <NotificationHandlerComponent />}
      
      <StatusBar
        barStyle={'dark-content'}
        translucent
        backgroundColor={'transparent'}
      />
      
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'android' ? 'fade' : 'default',
        }}
      >
        {!userToken ? (
          <Stack.Group>
            <Stack.Screen
              name={RouteName.SplashScreenNavigation}
              component={SplashScreen}
            />
            <Stack.Screen
              name={RouteName.LoginNavigation}
              component={Login}
            />
          </Stack.Group>
        ) : (
          <>
            <Stack.Screen
              name={RouteName.TabNavigation}
              component={TabNavigator}
              options={{
                transitionSpec: {
                  open: {
                    animation: 'timing',
                    config: { duration: 300 },
                  },
                  close: {
                    animation: 'timing',
                    config: { duration: 300 },
                  },
                },
                cardStyleInterpolator: ({ current }) => ({
                  cardStyle: {
                    opacity: current.progress,
                  },
                }),
              }}
            />
            <Stack.Group
              screenOptions={{
                presentation: 'card',
                animation: 'slide_from_right',
              }}
            >
              {AuthorizedScreens.map((screen, key) => (
                <Stack.Screen
                  key={key}
                  name={screen.name as keyof RootStackParamList}
                  component={screen.component}
                  options={screen.options}
                />
              ))}
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}