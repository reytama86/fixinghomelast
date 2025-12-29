import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  containerAnimated: {
    width: '100%',
    paddingHorizontal: 10,
    alignItems: 'center',
    // backgroundColor: 'red',
    justifyContent: 'flex-end',
    position: 'absolute',
    zIndex: 2,
    paddingVertical: 10,
    flex: 1,
  },
  back: {
    position: 'absolute',
    left: 10,
    paddingBottom: 10,
    paddingRight: 10,
    bottom: 0,
    zIndex: 999,
  },
  backNormal: {
    position: 'absolute',
    left: 10,
    paddingBottom: 10,
    paddingRight: 10,
    zIndex: 999,
  },
  right: {
    position: 'absolute',
    right: 10,
    paddingBottom: 10,
    paddingRight: 10,
  },
});
