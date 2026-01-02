import { useState, useEffect } from 'react';
import { DataPoint, Sensor, Blok, RangeType, SensorType } from '@Types/Chart/Chart.data';
import { formatLabel, formatMySQLDatetime } from '@Helpers/dateFormatterChart';

const BASE_URL = 'https://iot-vanili-api.permataindonesia.com';

export const SENSOR_API_MAP: Record<string, string> = {
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

const calculateDaysDiff = (startDate: string, endDate: string): number => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

const getEndpointByDays = (daysDiff: number): string => {
  if (daysDiff > 365) return '/api/yearly-data';
  if (daysDiff > 60) return '/api/monthly-data';
  return '/api/weekly-data';
};

export const fetchBlokList = async (): Promise<Blok[]> => {
  const url = `${BASE_URL}/api/bloklist`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
  return resp.json();
};

export const fetchSensorList = async (): Promise<Sensor[]> => {
  const url = `${BASE_URL}/api/sensorlist`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
  return resp.json();
};

export const fetchReportData = async (
  startDateStr: string,
  endDateStr: string,
  sensorType: string,
  deviceId: string,
  blockName: string
): Promise<any[]> => {
  try {
    const daysDiff = calculateDaysDiff(`${startDateStr} 00:00:00`, `${endDateStr} 23:59:59`);
    const endpoint = getEndpointByDays(daysDiff); 
    const params = new URLSearchParams({
      startDate: `${startDateStr} 00:00:00`,
      endDate: `${endDateStr} 23:59:59`,
      keterangan_sensor: sensorType,
      esp_id: deviceId,
      nama_blok: blockName,
    });

    const url = `${BASE_URL}${endpoint}?${params.toString()}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    const data = await resp.json();
    return data;
  } catch (err) {
    console.error('Error fetching report data:', err);
    throw err;
  }
};

export const useChartData = (
  sensorType: SensorType,
  range: RangeType,
  selectedSensor: Sensor | undefined,
  selectedBlok: Blok | undefined
) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!selectedSensor || !selectedBlok) return;

    const abortController = new AbortController();
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(now.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);

        let endpoint = '';
        let params: URLSearchParams;

        if (range === '1Y') {
          endpoint = '/api/yearly-data';
          params = new URLSearchParams({
            keterangan_sensor: sensorType,
            esp_id: selectedSensor.esp_id,
            nama_blok: selectedBlok.nama_blok,
          });
        } else if (range === 'Max') {
          endpoint = '/api/max-data';
          params = new URLSearchParams({
            keterangan_sensor: sensorType,
            esp_id: selectedSensor.esp_id,
            nama_blok: selectedBlok.nama_blok,
          });
        } else {
          endpoint = range === '1M' ? '/api/monthly-data' : '/api/weekly-data';
          const startDate = new Date(endDate);
          if (range === '7D') startDate.setDate(endDate.getDate() - 6);
          else if (range === '1M') startDate.setDate(endDate.getDate() - 29);
          startDate.setHours(0, 0, 0, 0);

          params = new URLSearchParams({
            startDate: formatMySQLDatetime(startDate),
            endDate: formatMySQLDatetime(endDate),
            keterangan_sensor: sensorType,
            esp_id: selectedSensor.esp_id,
            nama_blok: selectedBlok.nama_blok,
          });
        }

        const url = `${BASE_URL}${endpoint}?${params.toString()}`;
        const resp = await fetch(url, { signal: abortController.signal });
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const raw = await resp.json();

        if (abortController.signal.aborted) return;

        let points: DataPoint[] = [];

        if (range === '1Y') {
          points = raw.map((item: any) => {
            const [year, month] = item.periode.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            const monthName = monthNames[parseInt(month, 10) - 1];
            return { value: item.median_value, date: `${monthName} ${year}` };
          });
        } else if (range === 'Max') {
          points = raw.map((item: any) => ({
            value: item.median_value,
            date: formatLabel(new Date(item.start_date), false),
          }));
        } else if (range === '1M') {
          points = raw.map((item: any) => ({
            value: item.value,
            date: formatLabel(new Date(item.date + 'T14:00:00'), false),
          }));
        } else {
          points = raw.map((item: any) => ({
            value: item.nilai_sensor,
            date: formatLabel(new Date(item.waktu), true),
          }));
        }

        setData(points);
        setLoading(false);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => abortController.abort();
  }, [range, selectedSensor, selectedBlok, sensorType]);

  return { data, loading, error };
};
