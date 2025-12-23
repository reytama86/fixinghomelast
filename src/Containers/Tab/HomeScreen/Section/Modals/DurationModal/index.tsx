import React, {useRef, useCallback} from 'react';
import {View, Text, Modal, TouchableOpacity, TextInput} from 'react-native';
import {styles} from './styles';

interface DurationModalProps {
  visible: boolean;
  currentProcess: 'water' | 'fertilizer' | null;
  inputMinutes: string;
  inputSeconds: string;
  onMinutesChange: (value: string) => void;
  onSecondsChange: (value: string) => void;
  onCancel: () => void;
  onStart: (duration: number) => void;
}

const DurationModal: React.FC<DurationModalProps> = ({
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

  const focusMinutesInput = () => {
    minutesInputRef.current?.focus();
  };

  const focusSecondsInput = () => {
    secondsInputRef.current?.focus();
  };

  const handleMinutesChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    onMinutesChange(numericValue);
  };

  const handleSecondsChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    onSecondsChange(numericValue);
  };

  const validateTimeInput = (value: string, max: number): string => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) return '0';
    if (numValue > max) return max.toString();
    return numValue.toString();
  };

  const handleStartProcess = useCallback(() => {
    const validatedMinutes = validateTimeInput(inputMinutes, 120);
    const validatedSeconds = validateTimeInput(inputSeconds, 59);

    const totalMinutes = parseInt(validatedMinutes, 10);
    const totalSeconds = parseInt(validatedSeconds, 10);

    const totalDurationInSeconds = totalMinutes * 60 + totalSeconds;
    const finalDuration = Math.min(Math.max(totalDurationInSeconds, 6), 7200);

    onStart(finalDuration);
  }, [inputMinutes, inputSeconds, onStart]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={{marginBottom: -10}}>
            <Text style={styles.modalTitle}>
              Set Time For {currentProcess === 'water' ? 'Watering' : 'Fertilizing'}
            </Text>
          </View>
          
          <View style={styles.durationInputContainer}>
            <View style={styles.durationMinutes}>
              <Text style={styles.timeLabel}>Minutes</Text>
              <TouchableOpacity
                style={styles.boxDurationMinutes}
                onPress={focusMinutesInput}
                activeOpacity={0.7}>
                <TextInput
                  ref={minutesInputRef}
                  style={styles.timeInput}
                  value={inputMinutes}
                  onChangeText={handleMinutesChange}
                  keyboardType="numeric"
                  maxLength={3}
                  placeholder="1"
                  placeholderTextColor="#BBC3CE"
                  selectTextOnFocus={true}
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.timeSeparator}>:</Text>
            
            <View style={styles.durationMinutes}>
              <Text style={styles.timeLabel}>Seconds</Text>
              <TouchableOpacity
                style={styles.boxDurationMinutes}
                onPress={focusSecondsInput}
                activeOpacity={0.7}>
                <TextInput
                  ref={secondsInputRef}
                  style={styles.timeInput}
                  value={inputSeconds}
                  onChangeText={handleSecondsChange}
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
            <TouchableOpacity onPress={handleStartProcess}>
              <View style={styles.buttonStartSpray}>
                <Text style={styles.confirmText}>
                  Start {currentProcess === 'water' ? 'Watering' : 'Fertilizing'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DurationModal;