import React from 'react';
import {View, Text, Modal} from 'react-native';
import ImgLoadPortable from '@Assets/svg/ImgLoadPortable';
import styles from './styles';

type RescanModalProps = {
  visible: boolean;
  dotCount: number;
  onRequestClose: () => void;
};

export const RescanModal: React.FC<RescanModalProps> = ({
  visible,
  dotCount,
  onRequestClose,
}) => {
  const loadingText = `Gathering Data${'.'.repeat(dotCount)}`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.loadingModalOverlay}>
        <View style={styles.loadingModalContent}>
          <ImgLoadPortable />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      </View>
    </Modal>
  );
};