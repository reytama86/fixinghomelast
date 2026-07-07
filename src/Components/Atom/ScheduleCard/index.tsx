import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import styles from './styles';
import {ScheduleState} from '@Hooks/useScheduleState';

interface ScheduleCardProps {
  schedule: ScheduleState;
  onPress: () => void;
  disabled?: boolean;
}

const formatDuration = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m} min` : `${m}m ${s}s`;
};

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}>
      <View style={styles.left}>
        <View
          style={[
            styles.statusDot,
            schedule.enabled ? styles.statusDotOn : styles.statusDotOff,
          ]}
        />
        <View>
          <Text style={styles.title}>Schedule</Text>
          {schedule.enabled ? (
            <Text style={styles.subtitle}>
              Day {schedule.dayOfMonth} ·{' '}
              {String(schedule.hour).padStart(2, '0')}:
              {String(schedule.minute).padStart(2, '0')} ·{' '}
              {formatDuration(schedule.durationSec)}
            </Text>
          ) : (
            <Text style={styles.subtitle}>Not set</Text>
          )}
        </View>
      </View>
      <Text style={styles.editText}>{schedule.enabled ? 'Edit' : 'Set'}</Text>
    </TouchableOpacity>
  );
};

export default ScheduleCard;