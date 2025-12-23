import React, {useRef, useCallback} from 'react';
import {View, Text, Modal, TouchableOpacity, TextInput} from 'react-native';
import {styles} from './styles';

export interface DurationModalProps {
  visible: boolean;
  currentProcess: 'water' | 'fertilizer' | null;
  inputMinutes: string;
  inputSeconds: string;
  onMinutesChange: (text: string) => void;
  onSecondsChange: (text: string) => void;
  onCancel: () => void;
  onStart: (totalSeconds: number) => void;
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

  const validateTimeInput = (value: string, max: number): string => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) return '0';
    if (numValue > max) return max.toString();
    return numValue.toString();
  };

  const handleStart = useCallback(() => {
    const validatedMinutes = validateTimeInput(inputMinutes, 120);
    const validatedSeconds = validateTimeInput(inputSeconds, 59);
    
    const totalDurationInSeconds =
      parseInt(validatedMinutes, 10) * 60 + parseInt(validatedSeconds, 10);

    if (totalDurationInSeconds <= 0) {
      return;
    }

    onStart(totalDurationInSeconds);
  }, [inputMinutes, inputSeconds, onStart]);

  const processTitle = currentProcess === 'water' 
    ? 'Set Time For Watering' 
    : 'Set Time For Fertilizing';
  
  const startButtonText = currentProcess === 'water' 
    ? 'Start Watering' 
    : 'Start Fertilizing';

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade" 
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.modalTitle}>{processTitle}</Text>
          </View>

          <View style={styles.durationInputContainer}>
            <View style={styles.durationMinutes}>
              <Text style={styles.labelText}>Minutes</Text>
              <TouchableOpacity
                style={styles.boxDurationMinutes}
                onPress={focusMinutesInput}
                activeOpacity={0.7}
              >
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
                activeOpacity={0.7}
              >
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
            <TouchableOpacity onPress={onCancel} style={styles.buttonCancelSpray}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleStart} style={styles.buttonStartSpray}>
              <Text style={styles.confirmText}>{startButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DurationModal;