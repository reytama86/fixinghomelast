import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';  // Masking :contentReference[oaicite:2]{index=2}
import { BlurView } from '@react-native-community/blur';          // Blur effect :contentReference[oaicite:3]{index=3}
// import EllipsCloud from './EllipsCloud';
import EllipsCloud from '../../../assets/svg/ellipsCloud';

const CloudBlurMask = () => (
  <View style={styles.container}>
    <MaskedView
      style={styles.maskWrapper}
      maskElement={
        <View style={styles.maskElement}>
          {/* SVG mask, area ini akan menahan BlurView */}
          <EllipsCloud width={59} height={11} />
        </View>
      }
    >
      {/* BlurView hanya terlihat di area SVG mask */}
      <BlurView
        style={styles.blurFill}
        blurType="chromeMaterialLight"
        blurAmount={32}
        reducedTransparencyFallbackColor="#FFFFFF"
      />
    </MaskedView>
  </View>
);

export default CloudBlurMask;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 70,
    left: 15,
    width: 59,
    height: 11,
  },
  maskWrapper: {
    flex: 1,  // Menutupi seluruh area container
  },
  maskElement: {
    flex: 1,
    // Pusatkan SVG jika perlu
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurFill: {
    flex: 1,  // BlurView memenuhi area mask
  },
});
