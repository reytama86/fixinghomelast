import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 15,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  infoWater: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lottie: {
    width: 40,
    height: 40,
    opacity: 0.5,
  },
  infoDetails: {
    marginLeft: 8,
  },
  waterText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  blockText: {
    fontSize: 12,
    color: '#C5C5C5',
    marginTop: -2,
    fontFamily: 'SpaceGrotesk-Regular',
  },
});