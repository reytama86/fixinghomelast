import React, {useRef, useCallback} from 'react';
import {View, Text, Modal, TouchableOpacity, TextInput} from 'react-native';
import {styles} from './styles';

interface DurationModalProps {
  visible: boolean;
  currentProcess: {
    type: 'water' | 'fertilizer';
    target?: 'main' | 'row1' | 'row2';
  } | null; // ✅ FIXED: Accept object dengan type dan target
  inputMinutes: string;
  inputSeconds: string;
  onMinutesChange: (text: string) => void;
  onSecondsChange: (text: string) => void;
  onCancel: () => void;
  onStart: () => void;
}

export const DurationModal: React.FC<DurationModalProps> = ({
  visible,
  currentProcess,
  inputMinutes,
  inputSeconds,
  onMinutesChange,
  onSecondsChange,
  onCancel,
  onStart,
}) => {
  const minutesInputRef = useRef<TextInput>(null);
  const secondsInputRef = useRef<TextInput>(null);

  const focusMinutesInput = useCallback(() => {
    minutesInputRef.current?.focus();
  }, []);

  const focusSecondsInput = useCallback(() => {
    secondsInputRef.current?.focus();
  }, []);

  // ✅ FIXED: Extract type from object
  const processType = currentProcess?.type || 'water';
  const processTitle = processType === 'water' ? 'Set Time For Watering' : 'Set Time For Fertilizing';
  const startButtonText = processType === 'water' ? 'Start Watering' : 'Start Fertilizing';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={{marginBottom: -10}}>
            <Text style={styles.modalTitle}>{processTitle}</Text>
          </View>
          <View style={styles.durationInputContainer}>
            <View style={styles.durationMinutes}>
              <Text style={styles.labelText}>Minutes</Text>
              <TouchableOpacity
                style={styles.boxDurationMinutes}
                onPress={focusMinutesInput}
                activeOpacity={0.7}>
                <TextInput
                  ref={minutesInputRef}
                  style={styles.input}
                  value={inputMinutes}
                  onChangeText={onMinutesChange}
                  keyboardType="numeric"
                  maxLength={3}
                  placeholder="1"
                  placeholderTextColor="#BBC3CE"
                  selectTextOnFocus={true}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.separator}>:</Text>
            <View style={styles.durationMinutes}>
              <Text style={styles.labelText}>Seconds</Text>
              <TouchableOpacity
                style={styles.boxDurationMinutes}
                onPress={focusSecondsInput}
                activeOpacity={0.7}>
                <TextInput
                  ref={secondsInputRef}
                  style={styles.input}
                  value={inputSeconds}
                  onChangeText={onSecondsChange}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="0"
                  placeholderTextColor="#BBC3CE"
                  selectTextOnFocus={true}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity onPress={onCancel}>
              <View style={styles.buttonCancelSpray}>
                <Text style={styles.cancelText}>Cancel</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={onStart}>
              <View style={styles.buttonStartSpray}>
                <Text style={styles.confirmText}>{startButtonText}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DurationModal;
