import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import React, {useContext, useState} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Graph, Home, User, Key } from 'iconsax-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../AppTest'  // pastikan path sesuai lokasi
import { AuthContext } from '../../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const Login: React.FC<Props> = ({navigation}) => {
  const {login, isLoading} = useContext(AuthContext);
  
  // State untuk input form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username tidak boleh kosong');
      return;
    }
    
    if (!password) {
      Alert.alert('Error', 'Password tidak boleh kosong');
      return;
    }
    
    const result = await login(username, password);
    
    if (!result.success) {
      Alert.alert('Login Gagal', result.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 , marginTop: -65}}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.main}>
            <View style={styles.greeting}>
              <Text style={styles.greetingText}>Hi,</Text>
              <Text style={styles.greetingText}>Selamat Datang</Text>
            </View>

            <View style={styles.formLogin}>
              <Text style={styles.label}>Username*</Text>
              <KeyboardAvoidingView
                behavior="padding"
                keyboardVerticalOffset={80}
                style={styles.inputWrapper}
              >
                <User color="#C7C7CD" variant="Linear" size={20} />
                <TextInput
                  placeholder="Masukkan Username"
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </KeyboardAvoidingView>
            </View>

            <View style={styles.formLogin}>
              <Text style={styles.label}>Password*</Text>
              <KeyboardAvoidingView
                behavior="padding"
                keyboardVerticalOffset={80}
                style={styles.inputWrapper}
              >
                <Key color="#C7C7CD" variant="Outline" size={20} />
                <TextInput
                  placeholder="Masukkan Password"
                  secureTextEntry
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                />
              </KeyboardAvoidingView>
            </View>

            <Text style={styles.forgotText}>
              Lupa password?{' '}
              <Text style={styles.forgotLink}>
                Atur ulang password disini
              </Text>
            </Text>

            <TouchableOpacity 
              style={[
                styles.loginButton, 
                isLoading && styles.loginButtonDisabled
              ]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Loading...' : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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

export default Login;