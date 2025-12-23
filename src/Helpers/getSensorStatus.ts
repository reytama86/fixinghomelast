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

type SensorThreshold = {
  good: [number, number];
  unit: string;
};

const SOIL_THRESHOLDS: Record<string, SensorThreshold> = {
  'Soil Temperature': {good: [20, 32], unit: '°'}, 
  'Soil Humidity': {good: [20, 80], unit: '%'},     
  EC: {good: [0, 4000], unit: 'µS/cm'},             
};

const ENVIRONMENT_THRESHOLDS: Record<string, SensorThreshold> = {
  Temperature: {good: [20, 30], unit: '°'},         
  Humidity: {good: [70, 85], unit: '%'},           
  Light: {good: [10000, 15000], unit: 'Lux'},      
};

export function getSoilStatus(
  sensorName: string,
  value: number,
): SoilIndicator {
  const soilRanges = SOIL_RANGES[sensorName];
  if (soilRanges) {
    if (Number.isNaN(value)) {
      return {color: 'gray', icon: 'remove', status: 'N/A'};
    }

    if (value >= soilRanges.low.min && value <= soilRanges.low.max) {
      return soilRanges.low;
    }
    if (value >= soilRanges.good.min && value <= soilRanges.good.max) {
      return soilRanges.good;
    }
    if (value >= soilRanges.high.min && value <= soilRanges.high.max) {
      return soilRanges.high;
    }
    return {color: 'gray', icon: 'remove', status: 'N/A'};
  }

  const soilThreshold = SOIL_THRESHOLDS[sensorName];
  if (soilThreshold) {
    if (value === null || Number.isNaN(value)) {
      return {color: 'gray', icon: 'remove', status: 'N/A'};
    }

    const [min, max] = soilThreshold.good;

    if (value >= min && value <= max) {
      return {color: 'green', icon: 'arrow-up', status: 'Good'};
    } else if (value < min) {
      return {color: 'red', icon: 'arrow-down', status: 'Low'};
    } else {
      return {color: 'red', icon: 'arrow-up', status: 'High'};
    }
  }

  const envThreshold = ENVIRONMENT_THRESHOLDS[sensorName];
  if (envThreshold) {
    if (value === null || Number.isNaN(value)) {
      return {color: 'gray', icon: 'remove', status: 'N/A'};
    }

    const [min, max] = envThreshold.good;

    if (value >= min && value <= max) {
      return {color: 'green', icon: 'arrow-up', status: 'Good'};
    } else if (value < min) {
      return {color: 'red', icon: 'arrow-down', status: 'Low'};
    } else {
      return {color: 'red', icon: 'arrow-up', status: 'High'};
    }
  }

  return {color: 'gray', icon: 'remove', status: 'N/A'};
}

export function getSensorValue(
  sensorData: Record<string, {median: number; count: number}> | null,
  sensorName: string,
): string {
  if (!sensorData || !sensorData[sensorName]) {
    return 'N/A';
  }
  return sensorData[sensorName].median.toFixed(1);
}

export function getSoilIndicator(
  sensorData: Record<string, {median: number; count: number}> | null,
  sensorName: string,
): SoilIndicator {
  const rawValue = getSensorValue(sensorData, sensorName);
  const numericValue = parseFloat(rawValue);

  if (Number.isNaN(numericValue) || rawValue === 'N/A') {
    return {color: 'gray', icon: 'remove', status: 'N/A'};
  }

  return getSoilStatus(sensorName, numericValue);
}

export function getSensorUnit(sensorType: string): string {
  const soilRange = SOIL_RANGES[sensorType];
  if (soilRange) {
    const units: Record<string, string> = {
      Nitrogen: 'mg/kg',
      Phosphor: 'mg/kg',
      Kalium: 'mg/kg',
    };
    return units[sensorType] || '';
  }

  const soilThreshold = SOIL_THRESHOLDS[sensorType];
  if (soilThreshold) {
    return soilThreshold.unit;
  }

  const envThreshold = ENVIRONMENT_THRESHOLDS[sensorType];
  if (envThreshold) {
    return envThreshold.unit;
  }

  return '';
}

export function isSensorValueGood(value: number, sensorType: string): boolean {
  const status = getSoilStatus(sensorType, value);
  return status.status === 'Good';
}

export function isSoilSensor(sensorType: string): boolean {
  return !!(SOIL_RANGES[sensorType] || SOIL_THRESHOLDS[sensorType]);
}

export function isEnvironmentSensor(sensorType: string): boolean {
  return !!ENVIRONMENT_THRESHOLDS[sensorType];
}

export type {Range, SensorRangeConfig, SensorThreshold};