import React from 'react';
import { ChartCard } from '../ChartCard';

export default function SoilPh() {
  return (
    <ChartCard
      title="Soil PH"
      sensorType="PH"
      maxValue={9}
      unit=""
      tooltipThreshold={5}
    />
  );
}