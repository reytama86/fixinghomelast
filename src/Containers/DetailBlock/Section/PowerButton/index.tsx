import React from 'react';
import {TouchableOpacity} from 'react-native';
import PowerOffIcon from '@Assets/svg/PowerOffIcon';
import PowerOnIcon from '@Assets/svg/PowerOnIcon';
import {styles} from './styles';

interface PowerButtonProps {
  isActive: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export const PowerButton: React.FC<PowerButtonProps> = React.memo(
  ({isActive, onPress, disabled = false}) => (
    <TouchableOpacity
      style={[styles.powerButton, disabled && styles.powerButtonDisabled]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}>
      {isActive ? (
        <PowerOnIcon width={42} height={42} />
      ) : (
        <PowerOffIcon width={42} height={42} />
      )}
    </TouchableOpacity>
  ),
);

export default PowerButton
