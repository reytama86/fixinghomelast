import * as React from "react";
import Svg, { G, Path, Defs } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const EllipsCloud = (props) => (
  <Svg
    width={59}
    height={11}
    viewBox="0 0 59 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G filter="url(#filter0_f_63_1083)">
      <Path
        d="M54.9214 5.37043C54.9214 6.27042 43.5399 7.00001 29.5 7.00001C15.4601 7.00001 4.07849 6.27042 4.07849 5.37043C4.07849 4.47043 15.4601 3.74084 29.5 3.74084C43.5399 3.74084 54.9214 4.47043 54.9214 5.37043Z"
        fill="white"
      />
    </G>
    <Defs></Defs>
  </Svg>
);
export default EllipsCloud;
