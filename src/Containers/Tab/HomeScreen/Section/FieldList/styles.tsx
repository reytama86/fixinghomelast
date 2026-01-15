import {StyleSheet, Dimensions} from 'react-native';

const {width: screenWidth} = Dimensions.get('window');
const cardWidth = (screenWidth - 45.5) / 2;

export const styles = StyleSheet.create({
  fieldList: {
    height: 201,
    marginBottom: 22.5,
  },
  headerFieldList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-SemiBold',
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
  containerBlock: {
    height: 175,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
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
  vectorLabel1: {
    position: 'absolute',
    width: 10,
    height: 20,
    top: 36,
    left: 70,
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#A3C73F',
  },
  vectorLabel2: {
    position: 'absolute',
    width: 10,
    height: 20,
    top: 40,
    left: 60,
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#A3C73F',
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
    fontFamily: 'SpaceGrotesk-Medium',
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