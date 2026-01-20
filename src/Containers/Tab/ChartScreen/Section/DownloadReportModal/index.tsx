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
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import {
  generateExcelFile,
  saveExcelFile,
  generateFilename,
  ReportInfo,
} from '../../../../../../utils/excelUtils';
import {
  generatePortablePDF,
  fetchPortableReportData,
} from '../../../../../../utils/portablePdfUtils';
import { fetchReportData, SENSOR_API_MAP } from '../../useChartData';

interface DownloadReportModalProps {
  visible: boolean;
  onClose: () => void;
  onScreen?: string;
}

const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
  visible,
  onClose,
  onScreen,
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [selectedBlock, setSelectedBlock] = useState(
    onScreen === 'Portable' ? 'Block 1' : 'Blok 4'
  );
  const [selectedSensor, setSelectedSensor] = useState('Temperature');
  const [selectedDevice, setSelectedDevice] = useState('1');
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);
  const [showSensorDropdown, setShowSensorDropdown] = useState(false);
  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);

  const blockOptions =
    onScreen === 'Portable'
      ? [
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
        ]
      : ['Blok 4', 'Blok 7'];

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

      if (onScreen === 'Portable') {
        const portableData = await fetchPortableReportData(
          startDateStr,
          endDateStr,
          selectedBlock
        );

        if (portableData.length === 0) {
          Alert.alert(
            'No Data',
            'No portable data found for the selected period and block.',
            [{ text: 'OK' }]
          );
          return;
        }

        const filePath = await generatePortablePDF(
          portableData,
          startDateStr,
          endDateStr,
          selectedBlock
        );

        if (filePath) {
          Alert.alert(
            'Success',
            `Portable report saved successfully!\n\nLocation: ${filePath}\n\nTotal entries: ${portableData.length}`,
            [{ text: 'OK', onPress: () => handleCloseModal() }]
          );
        }
      } else {
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
    setSelectedBlock(onScreen === 'Portable' ? 'Block 1' : 'Blok 4');
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
    console.log(
      'START DATE CHANGE - Event type:',
      event?.type,
      'Selected date:',
      selectedDate
    );

    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }

    if (selectedDate) {
      console.log('Setting START date to:', selectedDate.toLocaleDateString());
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    console.log(
      'END DATE CHANGE - Event type:',
      event?.type,
      'Selected date:',
      selectedDate
    );

    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }

    if (selectedDate) {
      console.log('Setting END date to:', selectedDate.toLocaleDateString());
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

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputContainer}>
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
                  <Icon name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
                {showBlockDropdown && (
                  <View style={styles.dropdownContainer}>
                    <ScrollView
                      style={styles.dropdownScrollView}
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                      bounces={false}
                      scrollEnabled={true}
                    >
                      {blockOptions.map((block, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => handleBlockSelect(block)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.dropdownItemText}>{block}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {onScreen === 'Chart' && (
                <>
                  <View style={styles.formRow}>
                    <View style={styles.halfWidth}>
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
                        <Icon name="chevron-down" size={16} color="#666" />
                      </TouchableOpacity>
                      {showSensorDropdown && (
                        <View style={styles.dropdownContainer}>
                          <ScrollView
                            style={styles.dropdownScrollView}
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={true}
                            bounces={false}
                            scrollEnabled={true}
                          >
                            {sensorOptions.map((sensor, index) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.dropdownItem}
                                onPress={() => handleSensorSelect(sensor)}
                                activeOpacity={0.7}
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

                    <View style={styles.halfWidth}>
                      <Text style={styles.inputLabel}>Device ID</Text>
                      <TouchableOpacity
                        style={styles.dropdownWrapper}
                        onPress={() => {
                          if (isDownloading) return;
                          setShowDeviceDropdown(!showDeviceDropdown);
                          setShowBlockDropdown(false);
                          setShowSensorDropdown(false);
                          setShowStartDatePicker(false);
                          setShowEndDatePicker(false);
                        }}
                        disabled={isDownloading}
                      >
                        <Text style={styles.dropdownText}>{selectedDevice}</Text>
                        <Icon name="chevron-down" size={16} color="#666" />
                      </TouchableOpacity>
                      {showDeviceDropdown && (
                        <View style={styles.dropdownContainer}>
                          <ScrollView
                            style={styles.dropdownScrollView}
                            nestedScrollEnabled={true}
                            showsVerticalScrollIndicator={true}
                            bounces={false}
                            scrollEnabled={true}
                          >
                            {deviceOptions.map((device, index) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.dropdownItem}
                                onPress={() => handleDeviceSelect(device)}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.dropdownItemText}>
                                  {device}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  </View>
                </>
              )}

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
                  <Icon name="calendar-outline" size={16} color="#666" />
                </TouchableOpacity>
              </View>

              {showStartDatePicker && Platform.OS === 'ios' && (
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
                    display="compact"
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
                  <Icon name="calendar-outline" size={16} color="#666" />
                </TouchableOpacity>
              </View>

              {showEndDatePicker && Platform.OS === 'ios' && (
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
                    display="compact"
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
            </ScrollView>
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