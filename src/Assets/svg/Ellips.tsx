import * as React from "react";
import Svg, { G, Path, Defs } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const Ellips = (props) => (
  <Svg
    width={13}
    height={14}
    viewBox="0 0 13 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G filter="url(#filter0_dii_76_958)">
      <Path
        d="M11.4118 4.70588C11.4118 7.30487 9.30494 9.41177 6.70595 9.41177L2 10L2.00007 4.70588C2.00007 2.1069 4.10696 0 6.70595 0L6.11771 5.29412L11.4118 4.70588Z"
        fill="#EDEFF2"
      />
    </G>
    <Defs></Defs>
  </Svg>
);
export default Ellips;
