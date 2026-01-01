import React from 'react';
import { ChartCard } from '../ChartCard';


export default function SoilMoisture() {
  return (
    <ChartCard
      title="Soil Moisture"
      sensorType="Soil Humidity"
      maxValue={100}
      unit="%"
      tooltipThreshold={70}
    />
  );
}