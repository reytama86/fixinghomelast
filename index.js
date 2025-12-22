import './shim';
import 'react-native-reanimated';
import React from 'react';
import { AppRegistry } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './App';
import { AuthProvider } from './src/Context/AuthContext';
import { ControlProvider } from './src/Context/ControlContext';
import { name as appName } from './app.json';

Ionicons.loadFont();

const Root = () => (
  <SafeAreaProvider>
    <AuthProvider>
      <ControlProvider>
     <App/>
      </ControlProvider>
    </AuthProvider>
  </SafeAreaProvider>
);

AppRegistry.registerComponent(appName, () => Root);
