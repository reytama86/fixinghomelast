import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    width: '100%',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  containerInfo: {
    flex: 1,
  },
  infoArea: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-SemiBold',
    color: 'black',
    marginBottom: 4,
  },
  sensorList: {
    marginVertical: 4,
  },
  infoSensor: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk-Regular',
    color: 'black',
    marginBottom: 0,
  },
  infoDate: {
    fontSize: 11,
    fontFamily: 'SpaceGrotesk-Regular',
    color: '#999',
    marginTop: 1,
  },
  cutoutButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  arrowIcon: {
    position: 'absolute',
  },
});