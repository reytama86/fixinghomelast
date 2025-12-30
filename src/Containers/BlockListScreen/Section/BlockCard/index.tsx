import React from 'react';
import {View, Text, TouchableOpacity, Dimensions} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {ArrowDown} from 'iconsax-react-native';
import { CornerCut } from '../CornerCut';

import {styles} from './styles';

const {width: screenWidth} = Dimensions.get('window');
const cardWidth = (screenWidth - 45.5) / 2;

interface BlockData {
  id: number;
  name: string;
  temperature: string;
  humidity: string;
  navigationEnabled: boolean;
  svgPath: string;
}

interface BlockCardProps {
  block: BlockData;
  onPress: (blockId: number) => void;
}

export const BlockCard: React.FC<BlockCardProps> = ({block, onPress}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onPress(block.id)}
        disabled={!block.navigationEnabled}
        activeOpacity={0.8}>
        <CornerCut
          width={cardWidth}
          height={175}
          cutSize={40.5}
          backgroundColor="#ffffff"
          borderRadius={22}>
          <View style={styles.content}>
            <View style={styles.vectorContainer}>
              <View style={styles.svgWrapper}>
                disini svg
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.headerText}>{block.name}</Text>
              <Text style={styles.infoText}>
                Temperature:{' '}
                {block.temperature === '--' ? '--' : `${block.temperature}°`}
              </Text>
              <Text style={styles.infoText}>
                Humidity: {block.humidity === '--' ? '--' : `${block.humidity}%`}
              </Text>
            </View>

            <View style={styles.cutoutButton}>
              <Svg width={36} height={36} viewBox="0 0 36 36">
                <Path
                  d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05888 27.9411 0 18 0C8.05888 0 0 8.05888 0 18C0 27.9411 8.05888 36 18 36Z"
                  fill="#B4DC45"
                />
              </Svg>
              <ArrowDown
                variant="Linear"
                size={26}
                color="white"
                style={styles.arrowIcon}
              />
            </View>
          </View>
        </CornerCut>
      </TouchableOpacity>
    </View>
  );
};