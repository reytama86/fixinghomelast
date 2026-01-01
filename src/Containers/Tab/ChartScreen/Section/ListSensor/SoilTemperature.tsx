import React from 'react';
import { ChartCard } from '../ChartCard';

export default function SoilTemperature() {
  return (
    <ChartCard
      title="Soil Temperature"
      sensorType="Soil Temperature"
      maxValue={80}
      unit="°"
      tooltipThreshold={55}
    />
  );
}