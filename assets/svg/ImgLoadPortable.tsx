// ImgLoadPortable.tsx
import * as React from "react";
import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import Svg, {
  Path,
  G,
  Ellipse,
  Rect,
  Defs,
  LinearGradient,
  Stop,
  Image,
} from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const ImgLoadPortable = (props) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    startAnimation();
  }, [animatedValue]);

  // Interpolasi untuk mengubah posisi Y dari 16 (atas) ke sekitar 42 (bawah)
  // Range disesuaikan agar garis tetap dalam container
  const animatedY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 42], // Bergerak dari atas ke bawah dalam container
  });

  return (
    <Svg
      width={75}
      height={59}
      viewBox="0 0 75 59"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Defs>
        <LinearGradient
          id="paint0_linear"
          x1={8}
          y1={28.26}
          x2={4}
          y2={28.24}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#D9D9D9" />
          <Stop offset={0.403846} stopColor="#AFAFAF" />
          <Stop offset={1} stopColor="#D9D9D9" />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear"
          x1={71}
          y1={28.26}
          x2={67}
          y2={28.24}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#D9D9D9" />
          <Stop offset={0.403846} stopColor="#AFAFAF" />
          <Stop offset={1} stopColor="#D9D9D9" />
        </LinearGradient>
        <LinearGradient
          id="paint2_linear"
          x1={8.61}
          y1={8.99993}
          x2={59.32}
          y2={64.46}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="white" stopOpacity={0} />
          <Stop offset={0.499313} stopColor="#3295FF" />
          <Stop offset={1} stopColor="white" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient
          id="paint3_linear"
          x1={37.5}
          y1={0}
          x2={37.5}
          y2={2}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#990000" />
          <Stop offset={0.509615} stopColor="#990000" />
          <Stop offset={1} stopColor="#990000" />
        </LinearGradient>
      </Defs>
      
      {/* Main shapes */}
      <Path
        d="M4 6.5C4 6.5 4 5 6 5C8 5 8 6.5 8 6.5V51.5L4 51V6.5Z"
        fill="url(#paint0_linear)"
      />
      <Path
        d="M67 6.5C67 6.5 67 5 69 5C71 5 71 6.5 71 6.5V51L67 51.5V6.5Z"
        fill="url(#paint1_linear)"
      />
      
      {/* Ellipses dengan shadow */}
      {/* Shadow bawah - lebih lebar untuk efek depth */}
      <G>
        <Ellipse cx={37.5} cy={53} rx={35} ry={7} fill="black" fillOpacity={0.15} />
        <Ellipse cx={37.5} cy={52.5} rx={34} ry={6.8} fill="black" fillOpacity={0.1} />
        <Ellipse cx={37.5} cy={51.5} rx={33.5} ry={6.5} fill="white" />
      </G>
      
      {/* Shadow atas - untuk efek floating */}
      <G>
        <Ellipse cx={37.5} cy={4.5} rx={35} ry={7} fill="black" fillOpacity={0.1} />
        <Ellipse cx={37.5} cy={5.5} rx={34} ry={6.8} fill="black" fillOpacity={0.08} />
        <Ellipse cx={37.5} cy={6.5} rx={33.5} ry={6.5} fill="white" />
      </G>
      
      {/* Shadow tengah existing */}
      <G>
        <Ellipse cx={37} cy={47} rx={17} ry={4} fill="black" fillOpacity={0.38} />
      </G>
      
      <Path
        d="M4 6.67871C4 6.67871 5.22881 12.9999 36.3644 12.9999C67.5 12.9999 71 6.99994 71 6.99994V49.4999C71 49.4999 65.2288 56.4999 36.3644 55.9999C7.5 55.4999 4 49.9999 4 49.9999V6.67871Z"
        fill="url(#paint2_linear)"
        fillOpacity={0.16}
      />
      
      {/* Gambar daun vanili di dalam tabung - di belakang garis */}
      <G>
        <Image
          x={10}
          y={15}
          width={54}
          height={30}
          href={require('../images/daunvanili.png')}
          opacity={0.7}
        />
      </G>

      {/* Shadow untuk garis merah */}
      <G>
        <AnimatedRect
          x={10}
          y={animatedY}
          width={55}
          height={1.5}
          fill="black"
          fillOpacity={0.3}
        />
      </G>
      
      {/* Animated Rectangle - Garis merah yang bergerak naik turun */}
      <G>
        <AnimatedRect
          x={8}
          y={animatedY}
          width={59}
          height={1.2}
          fill="url(#paint3_linear)"
        />
      </G>
    </Svg>
  );
};

export default ImgLoadPortable;