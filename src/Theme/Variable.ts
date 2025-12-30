import {PixelRatio, Platform} from 'react-native';
// import {width} from './Layout';

export const Colors = {
  primaryMain: '#2F4B93',
  primarySurface: '#00AEEF',
  primaryHover: '#256E7A',
  primaryPressed: '#1B525A',
  primaryLight: '#7C8BED',
  primaryDark: '#27297B',
  primaryVibrant: '#7C8BED',
  primaryGrayish: '#3E4856',

  mutedPurple: '#746E82',
  softMauve: '#857E95',
  ashPurple: '#9892A6',

  neutral: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  semiTransparent: '#2F31931A',      
  semiTransparentWhite: '#FFFFFF80', 
  fullTransparent: '#FFFFFF00',

  nightBlue: '#18274B',
  mediumGray: '#A9A9A9',
  skeleton: '#DBDBDB',
  lightGray: '#E0E0E0',
  neutralGray: '#D4D4D4',

  neutral10: '#FCFCFD',
  neutral20: '#EDEFF2',
  neutral30: '#DEE2E7',
  neutral40: '#CDD2DB',
  neutral50: '#BBC3CE',
  neutral60: '#A9B3C1',
  neutral70: '#919EB0',
  neutral80: '#718198',
  neutral90: '#556377',
  neutral100: '#353D48',

  primaryLimeMain: '#B4DC45',    
  primaryLimeSurface: '#EEF9D2', 
  primaryLimePressed: '#9EB83A',
  primaryLimeText: '#2F3193',    

  dangerMain: '#D42701',
  dangerSurface: '#FFF2F1',
  dangerOutline: '#FA2D00',

  infoMain: '#004FE0',
  infoSurface: '#EAF3FF',
  infoOutline: '#0B45D9',

  alertMain: '#E9B62F',
  alertSurface: '#FFF5E0',
  alertOutline: '#F4DA97',

  successMain: '#22970F',
  successSurface: '#E8FAEB',
  successOutline: '#4FFF2F',
} as const;

export type ColorsType = typeof Colors;
export default Colors;
