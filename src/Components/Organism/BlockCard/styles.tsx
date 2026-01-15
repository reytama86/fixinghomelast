import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  blockCard: {
    marginBottom: 0,
  },
  cardBlockContent: {
    flex: 1,
    position: 'relative',
  },
  containerVector: {
    position: 'absolute',
    width: 147,
    height: 87.5,
    top: 16,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  svgContainer: {
    width: 100,
    height: 85,
    left: 20,
    top: 0,
    backgroundColor: '#white',
  },
  containerTextBlock: {
    alignItems: 'flex-start',
    top: 111,
    paddingHorizontal: 12,
    width: '100%',
    height: 52,
  },
  textBlockHeader: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-SemiBold',
  },
  textBlock: {
    fontSize: 14,
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