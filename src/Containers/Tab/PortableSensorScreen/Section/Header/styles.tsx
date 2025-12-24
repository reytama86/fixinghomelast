import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  placeholderButton: {
    width: 40,
  },
  textInfoTested: {
    fontSize: 12,
    color: '#919EB0',
    textAlign: 'left',
    fontFamily: 'SpaceGrotesk-Regular',
    marginTop: 8,
    marginLeft: 18,
  },
});
