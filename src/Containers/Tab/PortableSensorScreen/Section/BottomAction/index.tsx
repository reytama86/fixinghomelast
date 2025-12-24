import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import styles from './styles';

type BottomActionsSectionProps = {
  onRescan: () => void;
  onSave: () => void;
};

export const BottomActionsSection: React.FC<BottomActionsSectionProps> = ({
  onRescan,
  onSave,
}) => {
  return (
    <View style={styles.bottomContainer}>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.outlineButton} onPress={onRescan}>
          <Text style={styles.outlineButtonText}>Scan Ulang</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={onSave}>
          <Text style={styles.primaryButtonText}>Save Result</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};