import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from 'App'; 

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
        source={require('@Assets/images/agrofiliaaa.png')}
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
    justifyContent: 'center',   
    alignItems: 'center',       
  },
  image: {
    width: width * 0.2,         
    height: width * 0.2,       
  },
});

export default Intro;
