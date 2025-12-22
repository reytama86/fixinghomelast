import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  fieldPortableList: {
    height: 201,
  },
  headerFieldPortable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Medium',
  },
  showAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  showAllText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: '400',
    color: '#B4DC45',
  },
  containerBlockPortable: {
    height: 175,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    marginHorizontal: -10,
  },
  cardContentPortable: {
    flex: 1,
    position: 'relative',
  },
  containerInfoPortable: {
    width: 184,
    height: 116,
    left: 12,
    top: 12,
  },
  infoArea: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 13,
    marginBottom: 5,
  },
  infoSensor: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 12,
    fontWeight: '600',
  },
  infoDateSensor: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 12,
    fontWeight: '400',
    marginTop: 6,
    color: '#919EB0',
  },
  loadingPortable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  cutoutButton: {
    position: 'absolute',
    width: 36,
    height: 36,
    bottom: 0,
    right: 0,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    position: 'absolute',
    transform: [{rotate: '230deg'}],
  },
});