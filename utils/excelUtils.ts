import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import { Buffer } from 'buffer';

export interface ReportInfo {
  block: string;
  sensor: string;
  device: string;
  startDate: string;
  endDate: string;
}

export const formatDateToWIB = (
  dateString: string | number | Date,
): string => {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

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

  return dateTimeIndicators.some(indicator =>
    columnName.toLowerCase().includes(indicator),
  );
};

export const generateExcelFile = async (
  data: any[],
  reportInfo: ReportInfo,
): Promise<string> => {
  try {
    const excelData: any[][] = [
      ['SENSOR DATA REPORT'],
      [''],
      ['Report Information'],
      ['Block', reportInfo.block],
      ['Sensor Type', reportInfo.sensor],
      ['Device ID', reportInfo.device],
      ['Period', `${reportInfo.startDate} to ${reportInfo.endDate}`],
      ['Generated At', formatDateToWIB(new Date())],
      [''],
      ['Data'],
    ];

    if (data.length > 0) {
      const headers = Object.keys(data[0]);

      excelData.push(headers);

      data.forEach(item => {
        const row = headers.map(header => {
          const value = item[header];

          if (isDateTimeColumn(header) && value) {
            if (
              typeof value === 'string' &&
              !isNaN(Date.parse(value))
            ) {
              return formatDateToWIB(value);
            }
          }

          return value;
        });

        excelData.push(row);
      });
    } else {
      excelData.push(['No data available']);
    }

    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Sensor Data',
    );

    const excelBinary = XLSX.write(workbook, {
      type: 'binary',
      bookType: 'xlsx',
    });

    return excelBinary;
  } catch (error) {
    console.error('Generate Excel Error:', error);
    throw error;
  }
};

export const saveExcelFile = async (
  excelData: string,
  filename: string,
): Promise<string | false> => {
  try {
    const directoryPath =
      Platform.OS === 'ios'
        ? RNFS.DocumentDirectoryPath
        : RNFS.DownloadDirectoryPath;

    const filePath = `${directoryPath}/${filename}`;

    const base64Data = Buffer.from(
      excelData,
      'binary',
    ).toString('base64');

    await RNFS.writeFile(
      filePath,
      base64Data,
      'base64',
    );

    return filePath;
  } catch (error) {
    console.error('Save Excel Error:', error);
    return false;
  }
};

export const generateFilename = (
  sensorType: string,
  startDate: string,
  endDate: string,
): string => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);

  return `SensorReport_${sensorType}_${startDate}_to_${endDate}_${timestamp}.xlsx`;
};