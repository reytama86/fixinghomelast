export type SoilIndicator = {
  color: string;
  icon: string;
  status: 'Low' | 'Good' | 'High' | 'N/A';
};

type Range = {
  min: number;
  max: number;
  color: string;
  icon: string;
  status: SoilIndicator['status'];
};

type SensorRangeConfig = {
  low: Range;
  good: Range;
  high: Range;
};

const SOIL_RANGES: Record<string, SensorRangeConfig> = {
  PH: {
    low: {min: 0, max: 4.4, color: 'red', icon: 'arrow-down', status: 'Low'},
    good: {min: 4.5, max: 8.0, color: 'green', icon: 'arrow-up', status: 'Good'},
    high: {min: 8.1, max: 14, color: 'red', icon: 'arrow-up', status: 'High'},
  },
  Nitrogen: {
    low: {min: 0, max: 0, color: 'red', icon: 'arrow-down', status: 'Low'},
    good: {min: 0.1, max: 20, color: 'green', icon: 'arrow-up', status: 'Good'},
    high: {min: 21, max: 1000, color: 'red', icon: 'arrow-up', status: 'High'},
  },
  Phosphor: {
    low: {min: 0, max: 0, color: 'red', icon: 'arrow-down', status: 'Low'},
    good: {min: 0.1, max: 10, color: 'green', icon: 'arrow-up', status: 'Good'},
    high: {min: 11, max: 1000, color: 'red', icon: 'arrow-up', status: 'High'},
  },
  Kalium: {
    low: {min: 0, max: 0, color: 'red', icon: 'arrow-down', status: 'Low'},
    good: {min: 0.1, max: 15, color: 'green', icon: 'arrow-up', status: 'Good'},
    high: {min: 16, max: 1000, color: 'red', icon: 'arrow-up', status: 'High'},
  },
};

export function getSoilStatus(
  sensorName: string,
  value: number,
): SoilIndicator {
  const ranges = SOIL_RANGES[sensorName];

  if (!ranges || Number.isNaN(value)) {
    return {color: 'gray', icon: 'remove', status: 'N/A'};
  }

  if (value >= ranges.low.min && value <= ranges.low.max) return ranges.low;
  if (value >= ranges.good.min && value <= ranges.good.max) return ranges.good;
  if (value >= ranges.high.min && value <= ranges.high.max) return ranges.high;

  return {color: 'gray', icon: 'remove', status: 'N/A'};
}
