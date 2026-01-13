import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Logout } from 'iconsax-react-native';
import { AuthContext } from '@Context/AuthContext';
import styles from './styles';

const Header: React.FC = () => {
  const { logout, user } = useContext(AuthContext);

  
  const displayName =
    user?.role === 'developer'
      ? 'IOT Developer'
      : user?.role === 'user'
      ? 'Bapak Arik'
      : 'Guest';

  const avatarSource =
    user?.role === 'developer'
      ? require('@Assets/images/developer.jpg') 
      : require('@Assets/images/userr.png');     

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => {}} style={styles.userInfo}>
        <Image
          source={avatarSource}
          style={styles.avatar}
          resizeMode="cover"
        />
        <Text style={styles.username}>{displayName}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => logout()}>
        <Logout
          color="black"
          variant="Outline"
          size={24}
          style={{ transform: [{ rotate: '180deg' }] }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
