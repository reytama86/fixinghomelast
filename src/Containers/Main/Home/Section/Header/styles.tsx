import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 19.5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 100,
    marginRight: 10,
  },
  username: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 14,
    color: '#333',
  },
});