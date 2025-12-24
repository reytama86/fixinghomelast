import { StyleSheet } from "react-native"

export default StyleSheet.create({
    loadingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 16,
    fontFamily: 'SpaceGrotesk-Regular',
  },
})
