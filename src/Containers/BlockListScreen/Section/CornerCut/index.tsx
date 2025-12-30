import React from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {styles} from './styles';

interface CornerCutProps {
  width?: number;
  height?: number;
  cutSize?: number;
  backgroundColor?: string;
  borderRadius?: number;
  children?: React.ReactNode;
}

export const CornerCut: React.FC<CornerCutProps> = ({
  width = 300,
  height = 400,
  cutSize = 50,
  backgroundColor = '#ffffff',
  borderRadius = 16,
  children,
}) => {
  const createPath = () => `
    M ${borderRadius} 0
    L ${width - borderRadius} 0
    Q ${width} 0 ${width} ${borderRadius}
    L ${width} ${height - cutSize - borderRadius}
    Q ${width} ${height - cutSize} ${width - borderRadius} ${height - cutSize}
    L ${width - cutSize + borderRadius} ${height - cutSize}
    Q ${width - cutSize} ${height - cutSize} ${width - cutSize} ${height - cutSize + borderRadius}
    L ${width - cutSize} ${height - borderRadius}
    Q ${width - cutSize} ${height} ${width - cutSize - borderRadius} ${height}
    L ${borderRadius} ${height}
    Q 0 ${height} 0 ${height - borderRadius}
    L 0 ${borderRadius}
    Q 0 0 ${borderRadius} 0
    Z
  `;

  return (
    <View style={[styles.container, {width, height}]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        <Path d={createPath()} fill={backgroundColor} />
      </Svg>
      {children}
    </View>
  );
};