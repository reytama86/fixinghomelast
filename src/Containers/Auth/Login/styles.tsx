import { StyleSheet } from "react-native";

export default StyleSheet.create({
    main: {
      flex: 1,
      paddingHorizontal: 16,
    },
    greeting: {
      paddingTop: 387,
      marginBottom: 35,
    },
    greetingText: {
      fontSize: 28,
      fontFamily: 'SpaceGrotesk-Regular',
      fontWeight: '400'
    },
    formLogin: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      marginBottom: 4,
      color: '#333',
      fontWeight: '500',
      fontFamily: 'SpaceGrotesk-Regular',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      height: 44,
      backgroundColor: '#fff',
      borderRadius: 8,
      paddingHorizontal: 12,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 0,
    },
    input: {
      flex: 1,
      marginLeft: 8,
      fontSize: 14,
      fontFamily: 'SpaceGrotesk-Regular',
    },
    loginButton: {
        width: '100%',
        height: 44,
        backgroundColor: '#B4DC45',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 80,
      },
      loginButtonDisabled: {
        backgroundColor: '#D3D3D3',
      },
      loginButtonText: {
        fontSize: 14,
        color: 'black',
        fontFamily: 'SpaceGrotesk-Regular',
      },      
      forgotText: {
        fontSize: 14,
        color: '#333',
        marginTop: -10,
        marginBottom: 16,
        fontFamily: 'SpaceGrotesk-Regular',
      },
      forgotLink: {
        color: '#B4DC45',
        textDecorationLine: 'underline',
        fontSize: 14,
        fontFamily: 'SpaceGrotesk-Regular',
      },
});