import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  SafeAreaView,
  Platform,
  View,
  TouchableOpacity,
  Text,
  Modal,
  Alert,
  PermissionsAndroid,
  BackHandler,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import { Calendar, ArrowDown2 } from 'iconsax-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// Import chart components
import Temperature from './Section/ListSensor/Temperature';
import Humidity from './Section/ListSensor/Humidity';
import SoilTemperature from './Section/ListSensor/SoilTemperature';
import Light from './Section/ListSensor/Light';
import SoilMoisture from './Section/ListSensor/SoilMoisture';
import SoilEc from './Section/ListSensor/SoilEc';
import SoilPh from './Section/ListSensor/SoilPh';
import SoilNitrogen from './Section/ListSensor/SoilNitrogen';
import SoilPhospor from './Section/ListSensor/SoilPhospor';
import SoilKalium from './Section/ListSensor/SoilKalium';
import HeaderBack from '@Molecule/HeaderBack';
import { useHeaderMode } from '@Hooks/useHeaderMode';
import { styles } from './styles';

export default function ChartMain() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Dropdown states
  const [selectedBlock, setSelectedBlock] = useState('Blok 4');
  const [selectedSensor, setSelectedSensor] = useState('Temperature');
  const [selectedDevice, setSelectedDevice] = useState('1');
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);
  const [showSensorDropdown, setShowSensorDropdown] = useState(false);
  const [showDeviceDropdown, setShowDeviceDropdown] = useState(false);

  const FOOTER_HEIGHT = 84;

  // Dropdown options
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

  // Map sensor untuk API
  const sensorApiMap = {
    Temperature: 'Temperature',
    Humidity: 'Humidity',
    Light: 'Light',
    'Soil Temperature': 'Soil Temperature',
    'Soil Humidity': 'Soil Humidity',
    EC: 'EC',
    PH: 'PH',
    Nitrogen: 'Nitrogen',
    Phosphor: 'Phosphor',
    Kalium: 'Kalium',
  };

  // Request storage permission for Android
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to storage to save Excel files',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Fetch data dari API
  const fetchReportData = async (
    startDateStr: string,
    endDateStr: string,
    sensorType: string,
    deviceId: string,
    blockName: string
  ) => {
    try {
      const baseURL = 'https://iot-vanili-api.permataindonesia.com';

      const daysDiff = Math.ceil(
        (new Date(endDateStr).getTime() - new Date(startDateStr).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      let endpoint = '/api/weekly-data';

      if (daysDiff > 60) {
        endpoint = '/api/weekly-data';
      } else if (daysDiff > 7) {
        endpoint = '/api/weekly-data';
      }

      const params = new URLSearchParams({
        startDate: startDateStr + ' 00:00:00',
        endDate: endDateStr + ' 23:59:59',
        keterangan_sensor: sensorType,
        esp_id: deviceId,
        nama_blok: blockName,
      });

      const response = await fetch(`${baseURL}${endpoint}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };

  // Format date ke WIB timezone
  const formatDateToWIB = (dateString) => {
    const date = new Date(dateString);
    const wibDate = new Date(date.getTime());

    const year = wibDate.getFullYear();
    const month = String(wibDate.getMonth() + 1).padStart(2, '0');
    const day = String(wibDate.getDate()).padStart(2, '0');
    const hours = String(wibDate.getHours()).padStart(2, '0');
    const minutes = String(wibDate.getMinutes()).padStart(2, '0');
    const seconds = String(wibDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Deteksi kolom tanggal/waktu
  const isDateTimeColumn = (columnName) => {
    const dateTimeIndicators = [
      'time',
      'date',
      'created',
      'updated',
      'timestamp',
      'waktu',
      'tanggal',
      'jam',
      'created_at',
      'updated_at',
    ];

    return dateTimeIndicators.some((indicator) =>
      columnName.toLowerCase().includes(indicator)
    );
  };

  // Generate Excel file
  const generateExcelFile = async (data, reportInfo) => {
    try {
      const excelData = [
        ['SENSOR DATA REPORT'],
        [''],
        ['Report Information:'],
        ['Block:', reportInfo.block],
        ['Sensor Type:', reportInfo.sensor],
        ['Device ID:', reportInfo.device],
        ['Period:', `${reportInfo.startDate} to ${reportInfo.endDate}`],
        ['Generated:', formatDateToWIB(new Date().toISOString())],
        [''],
        ['Data:'],
      ];

      if (data.length > 0) {
        const firstItem = data[0];
        const headers = Object.keys(firstItem);
        excelData.push(headers);

        data.forEach((item) => {
          const row = headers.map((header) => {
            const value = item[header];

            if (isDateTimeColumn(header) && value) {
              if (typeof value === 'string' && !isNaN(Date.parse(value))) {
                return formatDateToWIB(value);
              } else if (value instanceof Date) {
                return formatDateToWIB(value.toISOString());
              }
            }

            return value;
          });
          excelData.push(row);
        });
      } else {
        excelData.push(['No data available for the selected criteria']);
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(excelData);

      const colWidths = [
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 25 },
        { wch: 15 },
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Sensor Data');
      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });

      return wbout;
    } catch (error) {
      console.error('Error generating Excel:', error);
      throw error;
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  // Save file to device storage
  const saveExcelFile = async (excelData: string, filename: string) => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Storage permission is required to save files');
        return false;
      }

      const downloadPath =
        Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.DownloadDirectoryPath;

      const filePath = `${downloadPath}/${filename}`;
      const base64Data = btoa(excelData);

      await RNFS.writeFile(filePath, base64Data, 'base64');

      return filePath;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  };

  const handleDownload = () => {
    setModalVisible(true);
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

      const apiSensorType = sensorApiMap[selectedSensor] || selectedSensor;

      const reportData = await fetchReportData(
        startDateStr,
        endDateStr,
        apiSensorType,
        selectedDevice,
        selectedBlock
      );

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 19);
      const filename = `SensorReport_${selectedSensor}_${startDateStr}_to_${endDateStr}_${timestamp}.xlsx`;

      const reportInfo = {
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
          [{ text: 'OK', onPress: () => setModalVisible(false) }]
        );
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', `Failed to generate report: ${error.message || 'Unknown error'}`, [
        { text: 'OK' },
      ]);
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
    setModalVisible(false);
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

  const { handleScroll, headMode } = useHeaderMode();

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBack title="Summary Sensor" back animated mode={headMode} />

      <ScrollView
        contentContainerStyle={{
          paddingBottom: FOOTER_HEIGHT + 16,
          marginTop: -30,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Temperature />
        <Humidity />
        <Light />
        <SoilTemperature />
        <SoilMoisture />
        <SoilEc />
        <SoilPh />
        <SoilNitrogen />
        <SoilPhospor />
        <SoilKalium />
      </ScrollView>

      {/* FOOTER BUTTON */}
      <View style={styles.footerWrapper}>
        <View style={styles.footerBox}>
          <TouchableOpacity
            style={[styles.downloadButton, isDownloading && styles.downloadButtonDisabled]}
            onPress={handleDownload}
            disabled={isDownloading}
          >
            <Text style={styles.downloadText}>
              {isDownloading ? 'Generating Report...' : 'Download Report'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal untuk Date Range Selection */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
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
            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Download Report</Text>
            </View>

            {/* Form Content */}
            <View style={styles.modalContent}>
              {/* Row 1: Block and Sensor */}
              <View style={styles.formRow}>
                <View style={styles.halfWidth}>
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
                    <ArrowDown2 color="#666" variant="Linear" size={16} />
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
                    <Text style={[styles.dropdownText, { fontSize: 13 }]}>{selectedSensor}</Text>
                    <ArrowDown2 color="#666" variant="Linear" size={16} />
                  </TouchableOpacity>
                  {showSensorDropdown && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled={true}>
                        {sensorOptions.map((sensor, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.dropdownItem}
                            onPress={() => handleSensorSelect(sensor)}
                          >
                            <Text style={[styles.dropdownItemText, { fontSize: 12 }]}>
                              {sensor}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              {/* Device Selection */}
              <View style={styles.inputContainer}>
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
                  <ArrowDown2 color="#666" variant="Linear" size={16} />
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

              {/* Start Date */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>From</Text>
                <TouchableOpacity
                  style={styles.dateInputWrapper}
                  onPress={!isDownloading ? showStartPicker : undefined}
                  disabled={isDownloading}
                >
                  <Text
                    style={[styles.dateDisplayText, !startDate && styles.placeholderText]}
                  >
                    {startDate ? formatDate(startDate) : 'Choose date'}
                  </Text>
                  <Calendar color="#666" variant="Linear" size={16} />
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

              {/* End Date */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>To</Text>
                <TouchableOpacity
                  style={styles.dateInputWrapper}
                  onPress={!isDownloading ? showEndPicker : undefined}
                  disabled={isDownloading}
                >
                  <Text style={[styles.dateDisplayText, !endDate && styles.placeholderText]}>
                    {endDate ? formatDate(endDate) : 'Choose date'}
                  </Text>
                  <Calendar color="#666" variant="Linear" size={16} />
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

              {/* Buttons */}
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.cancelButton, isDownloading && styles.buttonDisabled]}
                  onPress={handleCloseModal}
                  disabled={isDownloading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmButton, isDownloading && styles.buttonDisabled]}
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

        {/* DateTimePicker untuk Android - Tetap diluar modal */}
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
    </SafeAreaView>
  );
}