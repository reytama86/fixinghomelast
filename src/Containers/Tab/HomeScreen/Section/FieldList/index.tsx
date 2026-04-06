import React from 'react';
import {View, Text, TouchableOpacity, Dimensions, ScrollView} from 'react-native';
import {Maximize1} from 'iconsax-react-native';
import {BlockCard} from '@Organism/BlockCard';
import {styles} from './styles';
import RouteName from '@Constants/RouteName.constants';

const {width: screenWidth} = Dimensions.get('window');
const cardWidth = (screenWidth - 45.5) / 2;

interface SensorDataBlock {
  block1: {temp: string; humidity: string};
  block2: {temp: string; humidity: string};
  block01: {temp: string; humidity: string};
}

interface FieldListProps {
  sensorDataBlock: SensorDataBlock;
  navigation: any;
}

const FieldList: React.FC<FieldListProps> = ({sensorDataBlock, navigation}) => {
  const blocks = [
    {
      id: 1,
      name: 'Block 1',
      temperature: Math.round(Number(sensorDataBlock.block01.temp)).toString(),
      humidity: Math.round(Number(sensorDataBlock.block01.humidity)).toString(),
      navigationEnabled: true,
      svgPath: 'block1' as const,
    },
    {
      id: 3,
      name: 'Block 3',
      temperature: Math.round(Number(sensorDataBlock.block2.temp)).toString(),
      humidity: Math.round(Number(sensorDataBlock.block2.humidity)).toString(),
      navigationEnabled: true,
      svgPath: 'block2' as const,
    },
    {
      id: 4,
      name: 'Block 4',
      temperature: Math.round(Number(sensorDataBlock.block1.temp)).toString(),
      humidity: Math.round(Number(sensorDataBlock.block1.humidity)).toString(),
      navigationEnabled: true,
      svgPath: 'block1' as const,
    },
  ];

  return (
    <View style={styles.fieldList}>
      <View style={styles.headerFieldList}>
        <Text style={styles.headerText}>Field List</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(RouteName.ListBlockScreenNavigation)
          }>
          <View style={styles.showAll}>
            <Text style={styles.showAllText}>Show All</Text>
            <Maximize1 color="#B4DC45" variant="Broken" size={24} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {blocks.map(block => (
          <BlockCard
            key={block.id}
            block={block}
            navigation={navigation}
            cardWidth={cardWidth}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default FieldList;