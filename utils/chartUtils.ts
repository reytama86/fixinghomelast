
export type DataPoint = {
  value: number;
  date: string;
};

export function isValidDataPoint(point: any): point is DataPoint {
  return (
    point &&
    typeof point.value === 'number' &&
    !isNaN(point.value) &&
    isFinite(point.value) &&
    typeof point.date === 'string' &&
    point.date.length > 0
  );
}