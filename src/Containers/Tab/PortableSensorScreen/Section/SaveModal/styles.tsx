
import { Platform, StyleSheet } from "react-native";

export default StyleSheet.create({
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    height: 'auto',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    paddingBottom: 35,
    marginBottom: 0,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 6
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  nameResultText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  inputField: {
    height: 44,
    borderWidth: 1,
    borderColor: '#DEE2E7',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    fontFamily: 'SpaceGrotesk-Regular',
    backgroundColor: '#F9F9F9',
  },
  resultOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelResult: {
    width: '48%',
    height: 36,
    borderColor: '#B4DC45',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmResult: {
    width: '48%',
    height: 36,
    borderRadius: 8,
    backgroundColor: '#B4DC45',
    alignItems: 'center',
  },
  textButton: {
    alignItems: 'center',
    textAlign: 'center',
    top: 6,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  inputLabel: {
  fontSize: 14,
  color: '#333',
  marginBottom: 6,
  fontWeight: '500',
  fontFamily: 'SpaceGrotesk-Regular',
},

})
