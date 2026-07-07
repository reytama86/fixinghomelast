import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
  },
  heading: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 18,
    color: '#353D48',
  },
  label: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 12,
    color: '#BBC3CE',
    marginTop: 2,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  field: {
    flex: 1,
  },
  fieldLabel: {
    fontFamily: 'SpaceGrotesk-Regular',
    fontSize: 12,
    color: '#8A93A1',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EDEFF2',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 16,
    color: '#353D48',
    marginBottom: 14,
  },
  colon: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 18,
    color: '#BBC3CE',
    marginHorizontal: 8,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 6,
  },
  deleteButton: {
    marginRight: 'auto',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  deleteText: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 13,
    color: '#E0584F',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 13,
    color: '#8A93A1',
  },
  saveButton: {
    backgroundColor: '#B4DC45',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 8,
  },
  saveText: {
    fontFamily: 'SpaceGrotesk-Medium',
    fontSize: 13,
    color: 'white',
  },
});