import { Block1SVG, Block2SVG, Block3SVG, Block4SVG, Block5SVG } from '@Assets/svg/Static';
import React from 'react';
import {Text, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';

type BlockSvgType = 'block1' | 'block2' | 'block3' | 'block7' | 'block8';

interface BlockSvgProps {
  type: BlockSvgType;
  blockId: number;
}


export const BlockSvg: React.FC<BlockSvgProps> = ({type, blockId}) => {
  switch (type) {
    case 'block1':
      return (
        <>
          <Block1SVG/>
          <Text style={styles.vectorLabel1}>{blockId}</Text>
        </>
      );

    case 'block2':
      return (
        <>
          <Block2SVG/>
          <Text style={styles.vectorLabel2}>{blockId}</Text>
        </>
      );

    case 'block3':
      return (
        <>
          <Block3SVG/>
          <Text style={styles.vectorLabel3}>{blockId}</Text>
        </>
      );

    case 'block7':
      return (
        <>
          <Block4SVG/>
          <Text style={styles.vectorLabel7}>{blockId}</Text>
        </>
      );

    case 'block8':
      return (
        <>
          <Block5SVG/>
          <Text style={styles.vectorLabel8}>{blockId}</Text>
        </>
      );

    default:
      return null;
  }
};

const styles = StyleSheet.create({
  vectorLabel1: {
    position: 'absolute',
    width: 10,
    height: 20,
    top: 36,
    left: 47,
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#A3C73F',
  },
  vectorLabel2: {
    position: 'absolute',
    width: 10,
    height: 20,
    top: 40,
    left: 43,
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#A3C73F',
  },
  vectorLabel3: {
    position: 'absolute',
    width: 10,
    height: 20,
    top: 40,
    left: 47,
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#A3C73F',
  },
  vectorLabel7: {
    position: 'absolute',
    width: 10,
    height: 20,
    top: 25,
    left: 40,
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#A3C73F',
  },
  vectorLabel8: {
    position: 'absolute',
    width: 10,
    height: 20,
    top: 25,
    left: 42,
    fontFamily: 'SpaceGrotesk-Regular',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#A3C73F',
  },
});