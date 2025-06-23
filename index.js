// index.js
import './shim';
import 'react-native-reanimated';
import React from 'react';
import { AppRegistry } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppTest from './AppTest';
import { AuthProvider } from './context/AuthContext';
import { ControlProvider } from './context/ControlContext';
import { name as appName } from './app.json';

Ionicons.loadFont();

const App = () => (
  <SafeAreaProvider>
    <AuthProvider>
      <ControlProvider>
      <AppTest />
      </ControlProvider>
    </AuthProvider>
  </SafeAreaProvider>
);

AppRegistry.registerComponent(appName, () => App);
