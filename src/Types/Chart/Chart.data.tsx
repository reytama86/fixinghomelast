export type DataPoint = {
  value: number;
  date: string;
};

export type Sensor = {
  id_sensor: number;
  esp_id: string;
};

export type Blok = {
  id_detail_blok: number;
  nama_blok: string;
  kondisi_blok: string;
};

export type RangeType = '7D' | '1M' | '1Y' | 'Max';

export type SensorType = 
  | 'Temperature'
  | 'Humidity'
  | 'Light'
  | 'Soil Temperature'
  | 'Soil Humidity'
  | 'EC'
  | 'PH'
  | 'Nitrogen'
  | 'Phosphor'
  | 'Kalium';

export type ChartConfig = {
  spacing: number;
  initialSpacing: number;
  showVerticalLines: boolean;
  rulesLength: number;
  chartWidth: number;
};

