import { Platform, StyleSheet } from "react-native";

export default StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', 
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30, 
    maxHeight: '90%', 
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 6,
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
    marginTop: 16, 
  },
  cancelResult: {
    width: '48%',
    height: 44, 
    borderColor: '#B4DC45',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center', 
  },
  confirmResult: {
    width: '48%',
    height: 44,
    borderRadius: 8,
    backgroundColor: '#B4DC45',
    alignItems: 'center',
    justifyContent: 'center', 
  },
  textButton: {
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
});