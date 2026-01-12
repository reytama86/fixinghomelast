import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  separator: {
    height: 16,
  },
  footerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  footerBox: {
    height: 84,
    backgroundColor: '#fff',
    marginHorizontal: 0,
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 6,
  },
    downloadButton: {
    width: 351,
    height: 36,
    backgroundColor: '#B4DC45',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  downloadText: {
    color: 'Black',
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Regular',
  },
});