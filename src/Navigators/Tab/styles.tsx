import { StyleSheet } from "react-native";

export default StyleSheet.create({
  readIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#B4DC45',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabBarContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    fontFamily: 'SpaceGrotesk-Regular'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: 141,
    height: 121,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  modalText: {
    fontSize: 14,
    fontWeight: 400,
    fontFamily: 'SpaceGrotesk-Regular',
    marginTop: 13,
  },
  closeIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconText: {
    fontSize: 16,
    lineHeight: 16,
    fontWeight: '600',
  },
  containerImage: {
    alignItems: "center",
    width: 67,
    height: 53,
  },
  containerText: {
    width: 141,
    borderRadius: 1,
    alignItems: "center",
  }
});