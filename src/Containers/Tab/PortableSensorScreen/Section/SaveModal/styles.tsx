
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
    width: 364,
    height: 172,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    paddingBottom: 30,
    marginBottom: 20,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    marginTop: -17,
    marginBottom: 10,
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
    width: 162.5,
    height: 36,
    borderColor: '#B4DC45',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmResult: {
    width: 162.5,
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
})
