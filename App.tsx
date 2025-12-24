import { storage } from '@Hooks/useMmkv';
import StackNavigator from '../fixinghomelast/src/Navigators/Stack'
// import ModalNoInternet from '@Organism/General/ModalNoInternet';
// import RootLoading from '@Organism/General/RootLoading';
// import ToastMessages from '@Organism/General/Toast';
import React from 'react';
// import { LogLevel, OneSignal } from 'react-native-onesignal';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
// import { RecoilRoot } from 'recoil';

function App(): React.JSX.Element {
  // OneSignal.Debug.setLogLevel(LogLevel.Verbose);
  // OneSignal.initialize('35331465-6cfd-4b30-a3e1-5b84fb5c9ebb');
  // const permission = OneSignal.Notifications.requestPermission(true);

  return (
    
      
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <StackNavigator />
      </SafeAreaProvider>
    
  );
}

export default App;