import React from 'react';
import { ChartCard } from '../ChartCard';

export default function SoilEc() {
  return (
    <ChartCard
      title="Soil EC"
      sensorType="EC"
      maxValue={10000}
      unit=" μS/cm"
      tooltipThreshold={5500}
    />
  );
}