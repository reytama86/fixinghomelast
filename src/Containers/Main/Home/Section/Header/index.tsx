import React, {useContext} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {Logout} from 'iconsax-react-native';
import { AuthContext } from '@Context/AuthContext';
import styles from './styles'

const Header: React.FC = () => {
  const {logout} = useContext(AuthContext);

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => {}} style={styles.userInfo}>
        <Image
          source={require('@Assets/images/userr.png')}
          style={styles.avatar}
          resizeMode="cover"
        />
        <Text style={styles.username}>Bapak Arik</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => logout()}>
        <Logout
          color="black"
          variant="Outline"
          size={24}
          style={{transform: [{rotate: '180deg'}]}}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Header;