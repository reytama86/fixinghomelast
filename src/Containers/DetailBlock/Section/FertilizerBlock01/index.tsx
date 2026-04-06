import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import {Block01ControlState, FertilizerType} from '@Hooks/useBlock01Control';
import styles from './styles';

interface Props {
  control: Block01ControlState;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const FertilizerBlock01: React.FC<Props> = ({control}) => {
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [selectedType, setSelectedType] = useState<FertilizerType>('soil');
  const [inputMinutes, setInputMinutes] = useState('5');
  const [inputSeconds, setInputSeconds] = useState('0');

  const handleSelectType = useCallback((type: FertilizerType) => {
    setSelectedType(type);
    setShowTypeModal(false);
    setShowDurationModal(true);
  }, []);

  const handleStart = useCallback(() => {
    const minutes = parseInt(inputMinutes) || 0;
    const seconds = parseInt(inputSeconds) || 0;
    const total = minutes * 60 + seconds;
    if (total <= 0) return;
    control.startFertilizer(selectedType, total);
    setShowDurationModal(false);
  }, [control, selectedType, inputMinutes, inputSeconds]);

  const phaseLabel = {
    idle: 'Siap',
    preparation: 'Persiapan...',
    running: 'Sedang Memupuk',
    done: 'Selesai',
  }[control.phase];

  const phaseColor = {
    idle: '#6B7280',
    preparation: '#F59E0B',
    running: '#B4DC45',
    done: '#10B981',
  }[control.phase];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kontrol Pemupukan</Text>
      <View style={styles.tankRow}>
        <Text style={styles.tankLabel}>Level Tandon</Text>
        <View style={styles.tankBarWrapper}>
          <View style={[styles.tankBar, {width: `${control.tankLevel}%`}]} />
        </View>
        <Text style={styles.tankValue}>{control.tankLevel}%</Text>
      </View>

      <View style={[styles.statusBadge, {backgroundColor: phaseColor + '20'}]}>
        <View style={[styles.statusDot, {backgroundColor: phaseColor}]} />
        <Text style={[styles.statusText, {color: phaseColor}]}>{phaseLabel}</Text>
        {control.phase === 'running' && (
          <Text style={[styles.statusText, {color: phaseColor, marginLeft: 8}]}>
            {formatTime(control.remainingTime)}
          </Text>
        )}
      </View>

      {control.phase === 'running' && control.fertilizerType && (
        <Text style={styles.activeType}>
          Jenis: {control.fertilizerType === 'soil' ? 'Pupuk Tanah (Relay 1)' : 'Pupuk Daun (Relay 2)'}
        </Text>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonPrep,
            (control.phase !== 'idle') && styles.buttonDisabled,
          ]}
          disabled={control.phase !== 'idle'}
          onPress={control.startPreparation}>
          <Text style={styles.buttonText}>1. Persiapan</Text>
          <Text style={styles.buttonSubText}>Matikan auto-fill tandon</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.buttonStart,
            control.phase !== 'preparation' && styles.buttonDisabled,
          ]}
          disabled={control.phase !== 'preparation'}
          onPress={() => setShowTypeModal(true)}>
          <Text style={styles.buttonText}>2. Start Pupuk</Text>
          <Text style={styles.buttonSubText}>Pilih jenis & durasi</Text>
        </TouchableOpacity>
      </View>

      {control.phase === 'running' && (
        <TouchableOpacity style={styles.stopButton} onPress={control.stopFertilizer}>
          <Text style={styles.stopText}>Stop Pemupukan</Text>
        </TouchableOpacity>
      )}

      <Modal visible={showTypeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Pilih Jenis Pupuk</Text>
            <TouchableOpacity
              style={styles.typeButton}
              onPress={() => handleSelectType('soil')}>
              <Text style={styles.typeButtonText}>🌱 Pupuk Tanah (Relay 1)</Text>
              <Text style={styles.typeButtonSub}>Drip irigasi tanah</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.typeButton}
              onPress={() => handleSelectType('leaf')}>
              <Text style={styles.typeButtonText}>🌿 Pupuk Daun (Relay 2)</Text>
              <Text style={styles.typeButtonSub}>Spray daun</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowTypeModal(false)}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showDurationModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Durasi {selectedType === 'soil' ? 'Pupuk Tanah' : 'Pupuk Daun'}
            </Text>
            <Text style={styles.modalSub}>
              Pemupukan akan berhenti jika tandon habis atau durasi selesai
            </Text>
            <View style={styles.durationRow}>
              <View style={styles.durationInput}>
                <TextInput
                  style={styles.input}
                  value={inputMinutes}
                  onChangeText={t => setInputMinutes(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={styles.inputLabel}>menit</Text>
              </View>
              <Text style={styles.durationSep}>:</Text>
              <View style={styles.durationInput}>
                <TextInput
                  style={styles.input}
                  value={inputSeconds}
                  onChangeText={t => setInputSeconds(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.inputLabel}>detik</Text>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDurationModal(false)}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.startConfirmButton} onPress={handleStart}>
                <Text style={styles.startConfirmText}>Mulai</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FertilizerBlock01;