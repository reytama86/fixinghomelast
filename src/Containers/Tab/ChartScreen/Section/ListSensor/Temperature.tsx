import React from 'react';
import { ChartCard } from '../ChartCard';
import { formatThousands } from '@Helpers/dateFormatterChart';

export default function Temperature() {
  return (
    <ChartCard
      title="Temperature"
      sensorType="Temperature"
      maxValue={80}
      unit="°"
      tooltipThreshold={55}
    />
  );
}