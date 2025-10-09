import React, {useCallback, useState} from 'react';
import {
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Modal,
  Alert,
  FlatList,
  PermissionsAndroid,
  BackHandler,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import {
  ArrowLeft2,
  Calendar,
  CloseSquare,
  ArrowDown2,
} from 'iconsax-react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

// Import komponen chart
import Temperature from './Temperature';
import Humidity from './Humidity';
import SoilTemperature from './SoilTemperature';
import Light from './Light';
import SoilMoisture from './SoilMoisture';
import SoilEc from './SoilEc';
import SoilPh from './SoilPh';
import SoilNitrogen from './SoilNitrogen';
import SoilPhospor from './SoilPhospor';
import SoilKalium from './SoilKalium';

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
  const HEADER_HEIGHT = 58; // Height untuk header

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
          },
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
    blockName: string,
  ) => {
    try {
      const baseURL = 'https://iot-vanili-api.permataindonesia.com';

      // Tentukan endpoint berdasarkan range tanggal
      const daysDiff = Math.ceil(
        (new Date(endDateStr).getTime() - new Date(startDateStr).getTime()) /
          (1000 * 60 * 60 * 24),
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

      const response = await fetch(
        `${baseURL}${endpoint}?${params.toString()}`,
      );

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
  const formatDateToWIB = dateString => {
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
  const isDateTimeColumn = columnName => {
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

    return dateTimeIndicators.some(indicator =>
      columnName.toLowerCase().includes(indicator),
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

        data.forEach(item => {
          const row = headers.map(header => {
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
        {wch: 15},
        {wch: 25},
        {wch: 15},
        {wch: 15},
        {wch: 25},
        {wch: 15},
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Sensor Data');
      const wbout = XLSX.write(wb, {type: 'binary', bookType: 'xlsx'});

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
        Alert.alert(
          'Permission Required',
          'Storage permission is required to save files',
        );
        return false;
      }

      const downloadPath =
        Platform.OS === 'ios'
          ? RNFS.DocumentDirectoryPath
          : RNFS.DownloadDirectoryPath;

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
        selectedBlock,
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
          [{text: 'OK', onPress: () => setModalVisible(false)}],
        );
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        'Error',
        `Failed to generate report: ${error.message || 'Unknown error'}`,
        [{text: 'OK'}],
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
    setModalVisible(false);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-CA');
  };

  // Updated date change handlers
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

  // Dropdown handlers
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
    <SafeAreaView style={styles.container}>
      {/* STICKY HEADER - Di luar ScrollView */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginLeft: 16}}>
          <ArrowLeft2 color="black" variant="Linear" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Summary Sensor</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: FOOTER_HEIGHT + 16,
          marginTop: -55
        }}>
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
            style={[
              styles.downloadButton,
              isDownloading && styles.downloadButtonDisabled,
            ]}
            onPress={handleDownload}
            disabled={isDownloading}>
            <Text style={styles.downloadText}>
              {isDownloading ? 'Generating Report...' : 'Download Report'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal untuk Date Range Selection dengan DateTimePicker Inside */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={!isDownloading ? handleCloseModal : undefined}>
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={e => e.stopPropagation()}>
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
                    disabled={isDownloading}>
                    <Text style={styles.dropdownText}>{selectedBlock}</Text>
                    <ArrowDown2 color="#666" variant="Linear" size={16} />
                  </TouchableOpacity>
                  {showBlockDropdown && (
                    <View style={styles.dropdownContainer}>
                      {blockOptions.map((block, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => handleBlockSelect(block)}>
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
                    disabled={isDownloading}>
                    <Text style={[styles.dropdownText, {fontSize: 13}]}>
                      {selectedSensor}
                    </Text>
                    <ArrowDown2 color="#666" variant="Linear" size={16} />
                  </TouchableOpacity>
                  {showSensorDropdown && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView
                        style={styles.dropdownScrollView}
                        nestedScrollEnabled={true}>
                        {sensorOptions.map((sensor, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.dropdownItem}
                            onPress={() => handleSensorSelect(sensor)}>
                            <Text
                              style={[styles.dropdownItemText, {fontSize: 12}]}>
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
                  disabled={isDownloading}>
                  <Text style={styles.dropdownText}>{selectedDevice}</Text>
                  <ArrowDown2 color="#666" variant="Linear" size={16} />
                </TouchableOpacity>
                {showDeviceDropdown && (
                  <View style={styles.dropdownContainer}>
                    {deviceOptions.map((device, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.dropdownItem}
                        onPress={() => handleDeviceSelect(device)}>
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
                  disabled={isDownloading}>
                  <Text
                    style={[
                      styles.dateDisplayText,
                      !startDate && styles.placeholderText,
                    ]}>
                    {startDate ? formatDate(startDate) : 'Choose date'}
                  </Text>
                  <Calendar color="#666" variant="Linear" size={16} />
                </TouchableOpacity>
              </View>

              {/* DateTimePicker for Start Date - INLINE dalam Modal */}
              {showStartDatePicker && (
                <View style={styles.inlinePickerContainer}>
                  <View style={styles.pickerHeader}>
                    <Text style={styles.pickerTitle}>Select Start Date</Text>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker(false)}
                      style={styles.pickerCloseButton}>
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
                  disabled={isDownloading}>
                  <Text
                    style={[
                      styles.dateDisplayText,
                      !endDate && styles.placeholderText,
                    ]}>
                    {endDate ? formatDate(endDate) : 'Choose date'}
                  </Text>
                  <Calendar color="#666" variant="Linear" size={16} />
                </TouchableOpacity>
              </View>

              {/* DateTimePicker for End Date - INLINE dalam Modal */}
              {showEndDatePicker && (
                <View style={styles.inlinePickerContainer}>
                  <View style={styles.pickerHeader}>
                    <Text style={styles.pickerTitle}>Select End Date</Text>
                    <TouchableOpacity
                      onPress={() => setShowEndDatePicker(false)}
                      style={styles.pickerCloseButton}>
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
                  style={[
                    styles.cancelButton,
                    isDownloading && styles.buttonDisabled,
                  ]}
                  onPress={handleCloseModal}
                  disabled={isDownloading}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    isDownloading && styles.buttonDisabled,
                  ]}
                  onPress={handleConfirmDownload}
                  disabled={isDownloading}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 58,
    paddingHorizontal: 4,

  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Medium',
  },
  footerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  footerBox: {
    height: 84,
    backgroundColor: '#fff',
    marginHorizontal: 0,
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 6,
  },
  downloadButton: {
    width: 351,
    height: 36,
    backgroundColor: '#B4DC45',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  downloadText: {
    color: 'Black',
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Regular',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '95%',
    maxWidth: 400,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Regular',
    color: '#000',
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxHeight: '80%',
  },

  // Form layout styles
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
    fontFamily: 'SpaceGrotesk-Medium',
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#fff',
    minHeight: 36,
  },
  dateDisplayText: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
    color: '#333',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  placeholderText: {
    color: '#999',
    fontFamily: 'SpaceGrotesk-Regular',
  },

  // Dropdown styles
  dropdownWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#fff',
    minHeight: 36,
  },
  dropdownText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginTop: 4,
    maxHeight: 120,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 1000,
  },
  dropdownScrollView: {
    maxHeight: 110,
  },
  dropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'SpaceGrotesk-Regular',
  },

  // Inline DatePicker Styles
  inlinePickerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'SpaceGrotesk-Medium',
  },
  pickerCloseButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#e9ecef',
  },
  pickerCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  inlinePicker: {
    backgroundColor: 'transparent',
    height: Platform.OS === 'ios' ? 100 : 'auto',
  },

  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#B4DC45',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#B4DC45',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'SpaceGrotesk-Regular',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});