// Intro.tsx

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './AppTest'; // karena typenya disatukan

type Props = NativeStackScreenProps<RootStackParamList, 'Intro'>;

const { height } = Dimensions.get('window');

const Intro: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace('Login')
    }, 1000);
    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('./assets/iotnew.json')}
        autoPlay
        loop={false}
        style={styles.animation}
      />
      <LottieView
        source={require('./assets/logo.json')}
        autoPlay
        loop={false}
        style={styles.titleAnimation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 350,
    height: 350,
  },
  titleAnimation: {
    position: 'absolute',
    width: 900,
    height: 900,
    marginBottom: 50,
    alignItems: 'center',
    marginLeft: 20,
  },
});

export default Intro;
