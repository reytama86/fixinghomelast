import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Animated} from 'react-native';
import styles from './styles';

type SaveModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (resultName: string) => Promise<void>;
  modalAnimation: Animated.Value;
};

export const SaveModal: React.FC<SaveModalProps> = ({
  visible,
  onClose,
  onSave,
  modalAnimation,
}) => {
  const [resultName, setResultName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const modalTranslateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const handleSave = async () => {
    if (!resultName.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(resultName);
      setResultName('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}>
          <Animated.View
            style={[styles.modalContainer, {transform: [{translateY: modalTranslateY}]}]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save Result</Text>
            </View>
            <Text style={styles.nameResultText}>Name the result</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Enter your result name"
              placeholderTextColor="#999"
              value={resultName}
              onChangeText={setResultName}
              editable={!isSaving}
            />
            <View style={styles.resultOption}>
              <TouchableOpacity
                style={styles.cancelResult}
                onPress={onClose}
                disabled={isSaving}>
                <Text style={styles.textButton}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmResult, isSaving && {opacity: 0.6}]}
                onPress={handleSave}
                disabled={isSaving || !resultName.trim()}>
                {isSaving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.textButton}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};