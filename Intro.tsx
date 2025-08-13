// Intro.tsx

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from './AppTest'; // karena typenya disatukan

type Props = NativeStackScreenProps<RootStackParamList, 'Intro'>;

const { width, height } = Dimensions.get('window');

const Intro: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace('Login');
    }, 1000);
    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/images/agrofiliaaa.png')} // ganti dengan nama file gambarmu
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',   // vertical center
    alignItems: 'center',       // horizontal center
  },
  image: {
    width: width * 0.2,         // 60% dari lebar layar
    height: width * 0.2,        // buat kotak, sesuaikan proporsi sesuai gambar
  },
});

export default Intro;
