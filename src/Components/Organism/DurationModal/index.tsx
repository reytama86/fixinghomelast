import React, {useRef, useCallback} from 'react';
import {Modal, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform} from 'react-native';
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

  const handleStart = useCallback(() => {
    const mins = Math.max(0, Math.min(120, parseInt(inputMinutes, 10) || 0));
    const secs = Math.max(0, Math.min(59, parseInt(inputSeconds, 10) || 0));
    const total = mins * 60 + secs;
    if (total <= 0) return;
    onStart(total);
  }, [inputMinutes, inputSeconds, onStart]);

  const processTitle =
    currentProcess === 'water'
      ? 'Set Time For Watering'
      : 'Set Time For Fertilizing';

  const startButtonText =
    currentProcess === 'water' ? 'Start Watering' : 'Start Fertilizing';

  return (
    // FIXED: statusBarTranslucent agar cover status bar di Android
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}>
      {/* FIXED: View wrapper dengan absoluteFillObject sebagai overlay */}
      <View style={styles.modalOverlay}>
        {/* FIXED: KeyboardAvoidingView agar input tidak tertutup keyboard */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.modalTitle}>{processTitle}</Text>
            </View>

            <View style={styles.durationInputContainer}>
              <View style={styles.durationMinutes}>
                <Text style={styles.labelText}>Minutes</Text>
                <TouchableOpacity
                  style={styles.boxDurationMinutes}
                  onPress={() => minutesInputRef.current?.focus()}
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
                    selectTextOnFocus
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.separator}>:</Text>

              <View style={styles.durationMinutes}>
                <Text style={styles.labelText}>Seconds</Text>
                <TouchableOpacity
                  style={styles.boxDurationMinutes}
                  onPress={() => secondsInputRef.current?.focus()}
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
                    selectTextOnFocus
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                onPress={onCancel}
                style={styles.buttonCancelSpray}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleStart}
                style={styles.buttonStartSpray}>
                <Text style={styles.confirmText}>{startButtonText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default DurationModal;