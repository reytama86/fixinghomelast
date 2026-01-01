import { useState, useEffect } from 'react';
import { DataPoint, Sensor, Blok, RangeType, SensorType } from '@Types/Chart/Chart.data'
import { formatLabel, formatMySQLDatetime } from '@Helpers/dateFormatterChart'

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
      const baseURL = 'https://iot-vanili-api.permataindonesia.com';
      let endpoint = '';
      let params: URLSearchParams;

      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(now.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);

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
        if (range === '7D') {
          startDate.setDate(endDate.getDate() - 6);
        } else if (range === '1M') {
          startDate.setDate(endDate.getDate() - 29);
        }
        startDate.setHours(0, 0, 0, 0);

        params = new URLSearchParams({
          startDate: formatMySQLDatetime(startDate),
          endDate: formatMySQLDatetime(endDate),
          keterangan_sensor: sensorType,
          esp_id: selectedSensor.esp_id,
          nama_blok: selectedBlok.nama_blok,
        });
      }

      try {
        const resp = await fetch(`${baseURL}${endpoint}?${params.toString()}`, {
          signal: abortController.signal,
        });

        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const raw = await resp.json();

        if (abortController.signal.aborted) return;

        let points: DataPoint[] = [];

        if (range === '1Y') {
          points = raw.map((item: any) => {
            const [year, month] = item.periode.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            const monthName = monthNames[parseInt(month) - 1];
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
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [range, selectedSensor, selectedBlok, sensorType]);

  return { data, loading, error };
};