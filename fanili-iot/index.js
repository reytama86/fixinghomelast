// /**
//  * @format
//  */
// import './shim'; // Pastikan ini di baris paling atas
// import {AppRegistry} from 'react-native';
// import App from './App';
// import AppNavigator from './AppNavigator';
// import ToDoList from './ToDoList';
// import toDoListt from './Intro';
// import AppTest from './AppTest';
// import Login from './LoginTest';
// import HomeTest from './HomeTest';
// import 'react-native-reanimated';
// import {name as appName} from './app.json';
// import Home from './coba';

// AppRegistry.registerComponent(appName, () => Login);
import React from 'react';
import {AppRegistry} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import {SafeAreaProvider} from 'react-native-safe-area-context';
import HomeTest from './HomeTest';
import AppTest from './AppTest';
import Login from './LoginTest';

Ionicons.loadFont(); 
import {name as appName} from './app.json';


const App = () => (
  <SafeAreaProvider>
    <AppTest/>
    {/* <Login/> */}
  </SafeAreaProvider>
);

AppRegistry.registerComponent(appName, () => App);
