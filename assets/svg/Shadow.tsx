import * as React from "react";
import Svg, { G, Path, Defs } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const Shadow = (props) => (
  <Svg
    width={53}
    height={48}
    viewBox="0 0 53 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G filter="url(#filter0_f_63_1077)">
      <Path
        d="M48.6231 24.2382C48.6231 35.2781 38.5547 44.2277 26.1348 44.2277C13.7149 44.2277 3.64661 35.2781 3.64661 24.2382C3.64661 13.1983 13.7149 4.24866 26.1348 4.24866C38.5547 4.24866 48.6231 13.1983 48.6231 24.2382Z"
        fill="#BAC7CB"
        fillOpacity={0.2}
      />
    </G>
    <Defs></Defs>
  </Svg>
);
export default Shadow;
