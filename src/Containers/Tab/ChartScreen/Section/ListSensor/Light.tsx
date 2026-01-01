import React from 'react';
import { ChartCard } from '../ChartCard';

const formatThousands = (value: number): string => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function Light() {
  return (
    <ChartCard
      title="Light"
      sensorType="Light"
      maxValue={25000}
      unit=" Lux"
      tooltipThreshold={17500}
      formatValue={formatThousands}
    />
  );
}