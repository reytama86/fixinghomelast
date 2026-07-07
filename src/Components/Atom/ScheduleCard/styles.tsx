import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  statusDotOn: {
    backgroundColor: '#B4DC45',
  },
  statusDotOff: {
    backgroundColor: '#DEE2E7',
  },
  title: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 14,
    color: '#353D48',
  },
  subtitle: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 12,
    color: '#BBC3CE',
    marginTop: 2,
  },
  editText: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 13,
    color: '#7BA428',
  },
});