import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import styles from './styles';
import {ScheduleState, ScheduleConfigInput} from '@Hooks/useScheduleState';

interface ScheduleEditModalProps {
  visible: boolean;
  schedule: ScheduleState;
  onCancel: () => void;
  onSave: (config: ScheduleConfigInput) => void;
  onDelete: () => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const ScheduleEditModal: React.FC<ScheduleEditModalProps> = ({
  visible,
  schedule,
  onCancel,
  onSave,
  onDelete,
}) => {
  const [day, setDay] = useState(String(schedule.dayOfMonth));
  const [hour, setHour] = useState(String(schedule.hour).padStart(2, '0'));
  const [minute, setMinute] = useState(String(schedule.minute).padStart(2, '0'));
  const [durMinutes, setDurMinutes] = useState(
    String(Math.floor(schedule.durationSec / 60)),
  );
  const [durSeconds, setDurSeconds] = useState(
    String(schedule.durationSec % 60),
  );

  useEffect(() => {
    if (!visible) return;
    setDay(String(schedule.dayOfMonth));
    setHour(String(schedule.hour).padStart(2, '0'));
    setMinute(String(schedule.minute).padStart(2, '0'));
    setDurMinutes(String(Math.floor(schedule.durationSec / 60)));
    setDurSeconds(String(schedule.durationSec % 60));
  }, [visible, schedule]);

  const handleNumeric = (setter: (v: string) => void) => (text: string) => {
    setter(text.replace(/[^0-9]/g, ''));
  };

  const handleSave = () => {
    const dayOfMonth = clamp(parseInt(day || '1', 10), 1, 31);
    const hourVal = clamp(parseInt(hour || '0', 10), 0, 23);
    const minuteVal = clamp(parseInt(minute || '0', 10), 0, 59);
    const totalSeconds =
      clamp(parseInt(durMinutes || '0', 10), 0, 1440) * 60 +
      clamp(parseInt(durSeconds || '0', 10), 0, 59);

    if (totalSeconds <= 0) return;

    onSave({
      dayOfMonth,
      hour: hourVal,
      minute: minuteVal,
      durationSec: totalSeconds,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
        <TouchableWithoutFeedback onPress={onCancel}>
           <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableWithoutFeedback onPress={()=>{}}>
             <View style={styles.sheet}>
          <Text style={styles.heading}>Watering Schedule</Text>
          <Text style={styles.label}>Runs once a month on the chosen day</Text>

          <Text style={styles.fieldLabel}>Day of month</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={day}
            onChangeText={handleNumeric(setDay)}
            maxLength={2}
            placeholder="15"
          />

          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Hour</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={hour}
                onChangeText={handleNumeric(setHour)}
                maxLength={2}
                placeholder="15"
              />
            </View>
            <Text style={styles.colon}>:</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Minute</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={minute}
                onChangeText={handleNumeric(setMinute)}
                maxLength={2}
                placeholder="00"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Duration (min)</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={durMinutes}
                onChangeText={handleNumeric(setDurMinutes)}
                maxLength={4}
                placeholder="60"
              />
            </View>
            <Text style={styles.colon}>:</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Sec</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={durSeconds}
                onChangeText={handleNumeric(setDurSeconds)}
                maxLength={2}
                placeholder="00"
              />
            </View>
          </View>

          <View style={styles.actions}>
            {schedule.enabled && (
              <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                <Text style={styles.deleteText}>Turn off</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
          </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ScheduleEditModal;