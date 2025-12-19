import * as React from "react";
import Svg, {
  ForeignObject,
  Path,
  Defs,
  ClipPath,
  LinearGradient,
  Stop,
} from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: div */
const CloudMinTwo = (props) => (
  <Svg
    width={61}
    height={38}
    viewBox="0 0 61 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <ForeignObject
      x={-7.14286}
      y={-6.81046}
      width={75.2943}
      height={51.6574}
    ></ForeignObject>
    <Path
      data-figma-bg-blur-radius={7.14286}
      d="M61.0086 27.4681C61.0086 33.1213 56.4173 37.7041 50.7518 37.7041H13.6375C6.10626 37.7041 0 31.6111 0 24.0921C0 16.5752 6.10626 10.48 13.6375 10.48C14.313 10.48 14.9769 10.5317 15.6278 10.6259C18.7076 4.52139 25.0414 0.332397 32.3581 0.332397C41.2115 0.332397 48.6283 6.46782 50.5768 14.7107C50.7712 15.5337 50.9116 16.3768 50.9923 17.2357V17.2379C56.5441 17.3644 61.0086 21.8955 61.0086 27.4681Z"
      fill="url(#paint0_linear_63_1080)"
    />
    <Defs>
      <ClipPath
        id="bgblur_0_63_1080_clip_path"
        
      >
        <Path
        transform="translate(7.14286 6.81046)"
         d="M61.0086 27.4681C61.0086 33.1213 56.4173 37.7041 50.7518 37.7041H13.6375C6.10626 37.7041 0 31.6111 0 24.0921C0 16.5752 6.10626 10.48 13.6375 10.48C14.313 10.48 14.9769 10.5317 15.6278 10.6259C18.7076 4.52139 25.0414 0.332397 32.3581 0.332397C41.2115 0.332397 48.6283 6.46782 50.5768 14.7107C50.7712 15.5337 50.9116 16.3768 50.9923 17.2357V17.2379C56.5441 17.3644 61.0086 21.8955 61.0086 27.4681Z" />
      </ClipPath>
      <LinearGradient
        id="paint0_linear_63_1080"
        x1={9.66235}
        y1={6.88044}
        x2={52.9433}
        y2={37.7041}
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset={0.416176} stopColor="white" stopOpacity={0.7} />
        <Stop offset={1} stopColor="white" stopOpacity={0} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default CloudMinTwo;
