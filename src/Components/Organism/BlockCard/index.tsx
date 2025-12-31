import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {ArrowDown} from 'iconsax-react-native';
import {CornerCutComponent} from '@Atom/CornerCutCard';
import { BlockSvg } from '@Containers/BlockListScreen/Section/BlockSVG';
import RouteName from '@Constants/RouteName.constants';
import {styles} from './styles';

export interface BlockCardData {
  id: number;
  name: string;
  temperature: string;
  humidity: string;
  navigationEnabled?: boolean;
  svgPath?: 'block1' | 'block2' | 'block3' | 'block7' | 'block8';
}

interface BlockCardProps {
  block: BlockCardData;
  navigation: any;
  cardWidth: number;
  from?: string; 
}

export const BlockCard: React.FC<BlockCardProps> = ({
  block,
  navigation,
  cardWidth,
  from = 'AllBlock',
}) => {
  return (
    <View style={styles.blockCard}>
      <TouchableOpacity
        onPress={() => {
          if (block.navigationEnabled) {
            navigation.navigate(RouteName.DetailBlockNavigation, {
              blockId: block.id,
              from: from,
            });
          }
        }}
        disabled={!block.navigationEnabled}
        activeOpacity={0.8}>
        <CornerCutComponent
          width={cardWidth}
          height={175}
          cutSize={40.5}
          backgroundColor="#ffffff"
          borderRadius={22}>
          <View style={styles.cardBlockContent}>
            <View style={styles.containerVector}>
              <View style={styles.svgContainer}>
                <BlockSvg type={block.svgPath || 'block1'} blockId={block.id} />
              </View>
            </View>

            <View style={styles.containerTextBlock}>
              <Text style={styles.textBlockHeader}>{block.name}</Text>
              <Text style={styles.textBlock}>
                Temperature: {block.temperature === '--' ? '--' : `${block.temperature}°`}
              </Text>
              <Text style={styles.textBlock}>
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
        </CornerCutComponent>
      </TouchableOpacity>
    </View>
  );
};