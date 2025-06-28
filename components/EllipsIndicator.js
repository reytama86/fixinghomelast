import React from 'react';
import { Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const EllipseIndicator = ({ rotation }) => {
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -6,
        left: 50,
        transform: [
          {
            rotate: rotation.interpolate({
              inputRange: [0, 180],
              outputRange: ['0deg', '180deg'],
            }),
          },
        ],
      }}>
      <Svg width="13" height="14" viewBox="0 0 13 14" fill="none">
        <Path
          d="M11.4118 4.70588C11.4118 7.30487 9.30494 9.41177 6.70595 9.41177L2 10L2.00007 4.70588C2.00007 2.1069 4.10696 0 6.70595 0L6.11771 5.29412L11.4118 4.70588Z"
          fill="#EDEFF2"
        />
      </Svg>
    </Animated.View>
  );
};

export default EllipseIndicator;
