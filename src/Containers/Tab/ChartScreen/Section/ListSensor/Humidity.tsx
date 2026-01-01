import React from 'react';
import { ChartCard } from '../ChartCard';

export default function Humidity() {
  return (
    <ChartCard
      title="Humidity"
      sensorType="Humidity"
      maxValue={100}
      unit="%"
      tooltipThreshold={70}
    />
  );
}