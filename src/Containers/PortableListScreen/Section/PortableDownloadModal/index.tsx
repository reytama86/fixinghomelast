import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Platform,
  Alert,
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './styles'
import { generatePortablePDF, fetchPortableReportData } from '../../../../../utils/portablePdfUtils';

interface PortableDownloadModalProps {
  visible: boolean;
  onClose: () => void;
}

const blockOptions = [
  'All Block (1-9)',
  'Block 1',
  'Block 2',
  'Block 3',
  'Block 4',
  'Block 5',
  'Block 6',
  'Block 7',
  'Block 8',
  'Block 9',
];

const PortableDownloadModal: React.FC<PortableDownloadModalProps> = ({
  visible,
  onClose,
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState('Block 1');
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);

  const resetForm = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedBlock('Block 1');
    setShowBlockDropdown(false);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };

  const handleClose = () => {
    if (isDownloading) return;
    resetForm();
    onClose();
  };

  const formatDate = (date: Date): string => date.toLocaleDateString('en-CA');

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowStartDatePicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowEndDatePicker(false);
    if (selectedDate) setEndDate(selectedDate);
  };

  const handleConfirmDownload = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select both start date and end date');
      return;
    }
    if (startDate > endDate) {
      Alert.alert('Error', 'Start date cannot be later than end date');
      return;
    }

    setIsDownloading(true);
    try {
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const portableData = await fetchPortableReportData(
        startDateStr,
        endDateStr,
        selectedBlock,
      );

      if (portableData.length === 0) {
        Alert.alert(
          'No Data',
          'No portable data found for the selected period and block.',
          [{text: 'OK'}],
        );
        return;
      }

      const filePath = await generatePortablePDF(
        portableData,
        startDateStr,
        endDateStr,
        selectedBlock,
      );

      if (filePath) {
        Alert.alert(
          'Success',
          `Report saved!\n\nLocation: ${filePath}\n\nTotal: ${portableData.length} entries`,
          [{text: 'OK', onPress: handleClose}],
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        `Failed to generate report: ${error.message || 'Unknown error'}`,
        [{text: 'OK'}],
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          style={styles.keyboardWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={styles.container} onPress={() => {}}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Download Portable Report</Text>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}>
              {/* Block Selector */}
              <View style={[styles.inputGroup, {zIndex: 300}]}>
                <Text style={styles.label}>Block</Text>
                <Pressable
                  style={styles.dropdownTrigger}
                  disabled={isDownloading}
                  onPress={() => {
                    setShowBlockDropdown(prev => !prev);
                    setShowStartDatePicker(false);
                    setShowEndDatePicker(false);
                  }}>
                  <Text style={styles.dropdownTriggerText}>
                    {selectedBlock}
                  </Text>
                  <Icon name="chevron-down" size={16} color="#666" />
                </Pressable>

                {showBlockDropdown && (
                  <View style={styles.dropdown}>
                    <ScrollView
                      style={styles.dropdownScroll}
                      nestedScrollEnabled
                      bounces={false}
                      showsVerticalScrollIndicator>
                      {blockOptions.map((block, index) => (
                        <Pressable
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedBlock(block);
                            setShowBlockDropdown(false);
                          }}>
                          <Text style={styles.dropdownItemText}>{block}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Start Date */}
              <View style={[styles.inputGroup, {zIndex: 100}]}>
                <Text style={styles.label}>From</Text>
                <Pressable
                  style={styles.dateTrigger}
                  disabled={isDownloading}
                  onPress={() => {
                    setShowStartDatePicker(true);
                    setShowEndDatePicker(false);
                    setShowBlockDropdown(false);
                  }}>
                  <Text
                    style={[
                      styles.dateTriggerText,
                      !startDate && styles.placeholder,
                    ]}>
                    {startDate ? formatDate(startDate) : 'Choose date'}
                  </Text>
                  <Icon name="calendar-outline" size={16} color="#666" />
                </Pressable>
              </View>

              {showStartDatePicker && Platform.OS === 'ios' && (
                <View style={styles.inlinePicker}>
                  <View style={styles.pickerHeader}>
                    <Text style={styles.pickerTitle}>Select Start Date</Text>
                    <Pressable
                      style={styles.pickerClose}
                      onPress={() => setShowStartDatePicker(false)}>
                      <Text style={styles.pickerCloseText}>✕</Text>
                    </Pressable>
                  </View>
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="compact"
                    onChange={handleStartDateChange}
                    maximumDate={new Date()}
                  />
                </View>
              )}

              {/* End Date */}
              <View style={[styles.inputGroup, {zIndex: 100}]}>
                <Text style={styles.label}>To</Text>
                <Pressable
                  style={styles.dateTrigger}
                  disabled={isDownloading}
                  onPress={() => {
                    setShowEndDatePicker(true);
                    setShowStartDatePicker(false);
                    setShowBlockDropdown(false);
                  }}>
                  <Text
                    style={[
                      styles.dateTriggerText,
                      !endDate && styles.placeholder,
                    ]}>
                    {endDate ? formatDate(endDate) : 'Choose date'}
                  </Text>
                  <Icon name="calendar-outline" size={16} color="#666" />
                </Pressable>
              </View>

              {showEndDatePicker && Platform.OS === 'ios' && (
                <View style={styles.inlinePicker}>
                  <View style={styles.pickerHeader}>
                    <Text style={styles.pickerTitle}>Select End Date</Text>
                    <Pressable
                      style={styles.pickerClose}
                      onPress={() => setShowEndDatePicker(false)}>
                      <Text style={styles.pickerCloseText}>✕</Text>
                    </Pressable>
                  </View>
                  <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display="compact"
                    onChange={handleEndDateChange}
                    minimumDate={startDate}
                    maximumDate={new Date()}
                  />
                </View>
              )}

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <Pressable
                  style={[
                    styles.cancelButton,
                    isDownloading && styles.buttonDisabled,
                  ]}
                  disabled={isDownloading}
                  onPress={handleClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.confirmButton,
                    isDownloading && styles.buttonDisabled,
                  ]}
                  disabled={isDownloading}
                  onPress={handleConfirmDownload}>
                  <Text style={styles.confirmText}>
                    {isDownloading ? 'Downloading...' : 'Download'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>

      {showStartDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
          maximumDate={new Date()}
        />
      )}

      {showEndDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={startDate}
          maximumDate={new Date()}
        />
      )}
    </Modal>
  );
};

export default PortableDownloadModal;