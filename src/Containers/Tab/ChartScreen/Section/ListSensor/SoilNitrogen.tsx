import React from 'react';
import { ChartCard } from '../ChartCard';

export default function SoilNitrogen() {
  return (
    <ChartCard
      title="Soil Nitrogen"
      sensorType="Nitrogen"
      maxValue={2000}
      unit=" mg/kg"
      tooltipThreshold={1250}
    />
  );
}