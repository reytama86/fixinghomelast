import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  controlCentre: {
    marginBottom: 8,
  },
  controlCentreText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Medium',
    fontWeight: '600',
    marginBottom: 8,
  },
  controlCentreBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12.5,
  },
  boxControl: {
    backgroundColor: 'white',
    flex: 1,
    height: 132,
    borderRadius: 16,
    gap: 2,
  },
  frameTopControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 9,
    marginHorizontal: 1,
    gap: 8,
  },
  titleControl: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'SpaceGrotesk-Medium',
  },
  powerButtonContainer: {},
  frameVideoPlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lottieVideo: {
    width: 70,
    height: 70,
    opacity: 0.5,
  },
  informationSprayer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  informationSprayerText: {
    fontSize: 12,
    color: '#BBC3CE',
    textAlign: 'right',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  informationSprayerRemain: {
    fontSize: 12,
    color: 'black',
    textAlign: 'right',
    fontFamily: 'SpaceGrotesk-Medium',
  },
});