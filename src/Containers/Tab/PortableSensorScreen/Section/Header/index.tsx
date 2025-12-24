import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {ArrowLeft2} from 'iconsax-react-native';
import styles from './styles';

type HeaderProps = {
  title: string;
  onBackPress: () => void;
};

export const Header: React.FC<HeaderProps> = ({title, onBackPress}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <ArrowLeft2 color="#1F2937" variant="Linear" size={24} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.placeholderButton} />
    </View>
  );
};