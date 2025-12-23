import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

interface BackgroundVideoProps {
  children: React.ReactNode;
  animationSource?: any; // Lottie animation file
  speed?: number;
  loop?: boolean;
  opacity?: number;
}

const BackgroundVideo: React.FC<BackgroundVideoProps> = ({
  children,
  animationSource,
  speed = 1,
  loop = true,
  opacity = 0.3,
}) => {
  return (
    <View style={styles.container}>
      {/* Background Lottie Animation */}
      {animationSource && (
        <LottieView
          source={animationSource}
          autoPlay
          loop={loop}
          speed={speed}
          style={[styles.backgroundAnimation, { opacity }]}
          resizeMode="cover"
        />
      )}
      
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    zIndex: -1,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default BackgroundVideo;