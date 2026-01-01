import React from 'react';
import { ChartCard } from '../ChartCard';

export default function SoilPhosphor() {
  return (
    <ChartCard
      title="Soil Phosphor"
      sensorType="Phosphor"
      maxValue={2000}
      unit=" mg/kg"
      tooltipThreshold={1250}
    />
  );
}