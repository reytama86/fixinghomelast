import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Calendar, ArrowDown2}  from 'iconsax-react-native';
import styles from './styles';
import {
  generateExcelFile,
  saveExcelFile,
  generateFilename,
  ReportInfo,
} from 'utils/excelUtils'
import { fetchReportData, SENSOR_API_MAP } from '../../useChartData'

interface DownloadReportModalProps {
  visible: boolean;
  onClose: () => void;
}

const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
  visible,
  onClose,
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [selectedBlock, setSelectedBlock] = useState('Blok 4');
  const [selectedSensor, setSelectedSensor] = useState('Temperature');
  const [selectedDevice, setSelectedDevice] = useState('1');
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);
  const [showSensorDropdown, setShowSensorDropdown] = useState(false);
  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);

  const blockOptions = ['Blok 4', 'Blok 7'];
  const sensorOptions = [
    'Temperature',
    'Humidity',
    'Light',
    'Soil Temperature',
    'Soil Humidity',
    'EC',
    'PH',
    'Nitrogen',
    'Phosphor',
    'Kalium',
  ];
  const deviceOptions = ['1', '2', '3'];

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

      const apiSensorType = SENSOR_API_MAP[selectedSensor] || selectedSensor;

      const reportData = await fetchReportData(
        startDateStr,
        endDateStr,
        apiSensorType,
        selectedDevice,
        selectedBlock
      );

      const filename = generateFilename(
        selectedSensor,
        startDateStr,
        endDateStr
      );

      const reportInfo: ReportInfo = {
        block: selectedBlock,
        sensor: selectedSensor,
        device: selectedDevice,
        startDate: startDateStr,
        endDate: endDateStr,
      };

      const excelData = await generateExcelFile(reportData, reportInfo);

      const filePath = await saveExcelFile(excelData, filename);

      if (filePath) {
        Alert.alert(
          'Success',
          `Report saved successfully!\n\nLocation: ${filePath}\n\nFile: ${filename}`,
          [{ text: 'OK', onPress: () => handleCloseModal() }]
        );
      }
    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert(
        'Error',
        `Failed to generate report: ${error.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCloseModal = () => {
    if (isDownloading) return;

    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedBlock('Blok 4');
    setSelectedSensor('Temperature');
    setSelectedDevice('1');
    setShowBlockDropdown(false);
    setShowSensorDropdown(false);
    setShowDeviceDropdown(false);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    onClose();
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-CA');
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
      if (endDate && selectedDate > endDate) {
        setEndDate(selectedDate);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const closeAllDropdowns = () => {
    setShowBlockDropdown(false);
    setShowSensorDropdown(false);
    setShowDeviceDropdown(false);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };

  const showStartPicker = () => {
    setShowStartDatePicker(true);
    setShowEndDatePicker(false);
    setShowBlockDropdown(false);
    setShowSensorDropdown(false);
    setShowDeviceDropdown(false);
  };

  const showEndPicker = () => {
    setShowEndDatePicker(true);
    setShowStartDatePicker(false);
    setShowBlockDropdown(false);
    setShowSensorDropdown(false);
    setShowDeviceDropdown(false);
  };

  const handleBlockSelect = (block: string) => {
    setSelectedBlock(block);
    setShowBlockDropdown(false);
  };

  const handleSensorSelect = (sensor: string) => {
    setSelectedSensor(sensor);
    setShowSensorDropdown(false);
  };

  const handleDeviceSelect = (device: string) => {
    setSelectedDevice(device);
    setShowDeviceDropdown(false);
  };

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={!isDownloading ? handleCloseModal : undefined}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Download Report</Text>
            </View>

            <View style={styles.modalContent}>
              <View style={[styles.formRow, { zIndex: 10 }]}>
                <View style={[styles.halfWidth, { zIndex: 3 }]}>
                  <Text style={styles.inputLabel}>Block</Text>
                  <TouchableOpacity
                    style={styles.dropdownWrapper}
                    onPress={() => {
                      if (isDownloading) return;
                      setShowBlockDropdown(!showBlockDropdown);
                      setShowSensorDropdown(false);
                      setShowDeviceDropdown(false);
                      setShowStartDatePicker(false);
                      setShowEndDatePicker(false);
                    }}
                    disabled={isDownloading}
                  >
                    <Text style={styles.dropdownText}>{selectedBlock}</Text>
                    {/* <ArrowDown2 color="#666" variant="Linear" size={16} /> */}
                  </TouchableOpacity>
                  {showBlockDropdown && (
                    <View style={styles.dropdownContainer}>
                      {blockOptions.map((block, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => handleBlockSelect(block)}
                        >
                          <Text style={styles.dropdownItemText}>{block}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={[styles.halfWidth, { zIndex: 2 }]}>
                  <Text style={styles.inputLabel}>Sensor</Text>
                  <TouchableOpacity
                    style={styles.dropdownWrapper}
                    onPress={() => {
                      if (isDownloading) return;
                      setShowSensorDropdown(!showSensorDropdown);
                      setShowBlockDropdown(false);
                      setShowDeviceDropdown(false);
                      setShowStartDatePicker(false);
                      setShowEndDatePicker(false);
                    }}
                    disabled={isDownloading}
                  >
                    <Text style={[styles.dropdownText, { fontSize: 13 }]}>
                      {selectedSensor}
                    </Text>
                    {/* <ArrowDown2 color="#666" variant="Linear" size={16} /> */}
                  </TouchableOpacity>
                  {showSensorDropdown && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView
                        style={styles.dropdownScrollView}
                        nestedScrollEnabled={true}
                      >
                        {sensorOptions.map((sensor, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.dropdownItem}
                            onPress={() => handleSensorSelect(sensor)}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                { fontSize: 12 },
                              ]}
                            >
                              {sensor}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              <View style={[styles.inputContainer, { zIndex: 1 }]}>
                <Text style={styles.inputLabel}>Device ID</Text>
                <TouchableOpacity
                  style={styles.dropdownWrapper}
                  onPress={() => {
                    if (isDownloading) return;
                    setShowDeviceDropdown(!showDeviceDropdown);
                    closeAllDropdowns();
                    setShowDeviceDropdown(true);
                  }}
                  disabled={isDownloading}
                >
                  <Text style={styles.dropdownText}>{selectedDevice}</Text>
                  {/* <ArrowDown2 color="#666" variant="Linear" size={16} /> */}
                </TouchableOpacity>
                {showDeviceDropdown && (
                  <View style={styles.dropdownContainer}>
                    {deviceOptions.map((device, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => handleDeviceSelect(device)}
                      >
                        <Text style={styles.dropdownItemText}>{device}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>From</Text>
                <TouchableOpacity
                  style={styles.dateInputWrapper}
                  onPress={!isDownloading ? showStartPicker : undefined}
                  disabled={isDownloading}
                >
                  <Text
                    style={[
                      styles.dateDisplayText,
                      !startDate && styles.placeholderText,
                    ]}
                  >
                    {startDate ? formatDate(startDate) : 'Choose date'}
                  </Text>
                  {/* <Calendar color="#666" variant="Linear" size={16} /> */}
                </TouchableOpacity>
              </View>

              {showStartDatePicker && (
                <View style={styles.inlinePickerContainer}>
                  <View style={styles.pickerHeader}>
                    <Text style={styles.pickerTitle}>Select Start Date</Text>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker(false)}
                      style={styles.pickerCloseButton}
                    >
                      <Text style={styles.pickerCloseText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'compact' : 'default'}
                    onChange={handleStartDateChange}
                    maximumDate={new Date()}
                    style={styles.inlinePicker}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>To</Text>
                <TouchableOpacity
                  style={styles.dateInputWrapper}
                  onPress={!isDownloading ? showEndPicker : undefined}
                  disabled={isDownloading}
                >
                  <Text
                    style={[
                      styles.dateDisplayText,
                      !endDate && styles.placeholderText,
                    ]}
                  >
                    {endDate ? formatDate(endDate) : 'Choose date'}
                  </Text>
                  {/* <Calendar color="#666" variant="Linear" size={16} /> */}
                </TouchableOpacity>
              </View>

              {showEndDatePicker && (
                <View style={styles.inlinePickerContainer}>
                  <View style={styles.pickerHeader}>
                    <Text style={styles.pickerTitle}>Select End Date</Text>
                    <TouchableOpacity
                      onPress={() => setShowEndDatePicker(false)}
                      style={styles.pickerCloseButton}
                    >
                      <Text style={styles.pickerCloseText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'compact' : 'default'}
                    onChange={handleEndDateChange}
                    minimumDate={startDate || undefined}
                    maximumDate={new Date()}
                    style={styles.inlinePicker}
                  />
                </View>
              )}

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    isDownloading && styles.buttonDisabled,
                  ]}
                  onPress={handleCloseModal}
                  disabled={isDownloading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    isDownloading && styles.buttonDisabled,
                  ]}
                  onPress={handleConfirmDownload}
                  disabled={isDownloading}
                >
                  <Text style={styles.confirmButtonText}>
                    {isDownloading ? 'Downloading...' : 'Download'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>

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
            minimumDate={startDate || undefined}
            maximumDate={new Date()}
          />
        )}
      </Modal>
    </>
  );
};

export default DownloadReportModal;