import { Platform, Alert, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import { Buffer } from 'buffer';

export const requestStoragePermission = async (): Promise<boolean> => {
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

export const formatDateToWIB = (dateString: string | number | Date): string => {
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

export const isDateTimeColumn = (columnName: string): boolean => {
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


export interface ReportInfo {
  block: string;
  sensor: string;
  device: string;
  startDate: string;
  endDate: string;
}

export const generateExcelFile = async (
  data: any[],
  reportInfo: ReportInfo
): Promise<string> => {
  try {
    const excelData: any[][] = [
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

export const saveExcelFile = async (
  excelData: string,
  filename: string
): Promise<string | false> => {
  try {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Storage permission is required to save files'
      );
      return false;
    }

    const downloadPath =
      Platform.OS === 'ios'
        ? RNFS.DocumentDirectoryPath
        : RNFS.DownloadDirectoryPath;

    const filePath = `${downloadPath}/${filename}`;

    const base64Data = Buffer.from(excelData, 'binary').toString('base64');

    await RNFS.writeFile(filePath, base64Data, 'base64');

    return filePath;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};

export const generateFilename = (
  sensorType: string,
  startDate: string,
  endDate: string
): string => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);
  
  return `SensorReport_${sensorType}_${startDate}_to_${endDate}_${timestamp}.xlsx`;
};