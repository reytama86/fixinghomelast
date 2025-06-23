// ChartQuery.ts
import { barDataItem } from 'react-native-gifted-charts';

export type MetricType = 'Suhu Udara' | 'Kelembaban Udara' | 'Cahaya' | 'Kelembaban Tanah';

export const processWeeklyData = (
  data: { dayOfWeek: number; total: number }[],
  sensorType: MetricType
): barDataItem[] => {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const isSuhu = sensorType === 'Suhu Udara';

  return days.map((label, idx) => {
    const found = data.find(d => d.dayOfWeek === idx);
    const value = Number(found?.total ?? 0);
    const gray = '#d1d5db';
    const frontColor    = value <= 100 ? (isSuhu ? '#d3ff00' : '#ffab00') : gray;
    const gradientColor = value <= 100 ? (isSuhu ? '#12ff00' : '#ff0000') : gray;
    return { label, value, frontColor, gradientColor };
  });
};
