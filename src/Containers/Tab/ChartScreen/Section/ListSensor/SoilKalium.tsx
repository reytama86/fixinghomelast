import React from 'react';
import { ChartCard } from '../ChartCard';

export default function SoilKalium() {
  return (
    <ChartCard
      title="Soil Kalium"
      sensorType="Kalium"
      maxValue={2000}
      unit=" mg/kg"
      tooltipThreshold={1250}
    />
  );
}