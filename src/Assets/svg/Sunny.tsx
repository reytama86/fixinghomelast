import * as React from "react";
import Svg, { G, Path, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const Sunny = (props) => (
  <Svg
    width={176}
    height={212}
    viewBox="0 0 176 212"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G filter="url(#filter0_f_1_58)">
      <Path
        d="M160.542 192.134C160.542 194.705 128.025 196.789 87.9137 196.789C47.8021 196.789 15.2852 194.705 15.2852 192.134C15.2852 189.562 47.8021 187.478 87.9137 187.478C128.025 187.478 160.542 189.562 160.542 192.134Z"
        fill="#BAC7CB"
      />
    </G>
    <Path
      d="M157.19 69.1C157.19 107.257 126.257 138.19 88.1 138.19C49.9425 138.19 19.0098 107.257 19.0098 69.1C19.0098 30.9425 49.9425 0.00976562 88.1 0.00976562C126.257 0.00976562 157.19 30.9425 157.19 69.1Z"
      fill="url(#paint0_linear_1_58)"
    />
    <Defs>
      <LinearGradient
        id="paint0_linear_1_58"
        x1={115.932}
        y1={6.40632}
        x2={57.723}
        y2={138.175}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#FFD88B" />
        <Stop offset={1} stopColor="#FFA900" />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default Sunny;
