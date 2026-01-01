import { Dimensions } from 'react-native';
import { ChartConfig, RangeType, DataPoint } from '../Types/Chart/Chart.data'

const { width: SCREEN_W } = Dimensions.get('window');
const PADDING = 16;
const CARD_WIDTH = SCREEN_W - PADDING * 2;

export const getChartConfig = (
  range: RangeType,
  dataLength: number
): ChartConfig => {
  switch (range) {
    case '7D':
      return {
        spacing: CARD_WIDTH / (dataLength + 9),
        initialSpacing: 0,
        showVerticalLines: false,
        rulesLength: 309,
        chartWidth: 315.5,
      };
    case '1M':
      return {
        spacing: CARD_WIDTH / ((dataLength + 4) / 1),
        initialSpacing: 0,
        showVerticalLines: false,
        chartWidth: 350.5,
        rulesLength: 309,
      };
    case '1Y':
    case 'Max':
      return {
        spacing: CARD_WIDTH / ((dataLength - 1) / 4),
        initialSpacing: -55,
        chartWidth: 315.5,
        rulesLength: 316.5,
        showVerticalLines: false,
      };
    default:
      return {
        spacing: CARD_WIDTH / (dataLength - 1),
        initialSpacing: 0,
        showVerticalLines: false,
        chartWidth: 315.5,
        rulesLength: 309,
      };
  }
};

export const getXLabels = (
  barData: DataPoint[],
  range: RangeType
): string[] => {
  if (!barData.length) return [];

  const allDates = barData.map(pt => pt.date.split('\n')[0]);
  const total = allDates.length;

  if (range === '1M') {
    const indices = [
      0,
      Math.floor(total * 0.25),
      Math.floor(total * 0.5),
      total - 1,
    ];
    return indices.map(i => allDates[i]);
  } else if (range === '1Y' || range === 'Max') {
    const indices = [
      0,
      Math.floor(total * 0.33),
      Math.floor(total * 0.66),
      total - 1,
    ];
    return indices.map(i => allDates[i]);
  } else {
    const indices = [0, Math.floor((total - 1) / 2), total - 1];
    return indices.map(i => allDates[i]);
  }
};