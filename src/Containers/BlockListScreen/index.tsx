import React from 'react';
import {View, ScrollView, Dimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import HeaderBack from '@Molecule/HeaderBack';
import {BlockCard} from '@Organism/BlockCard'; 
import {useBlockList} from './useBlockList';
import {styles} from './styles';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@Constants/RouteParamsList.constants';
import { useNavigation } from '@react-navigation/native';

const {width: screenWidth} = Dimensions.get('window');
const cardWidth = (screenWidth - 45.5) / 2;


const BlockListScreen: React.FC = ({}) => {
  const {blocks} = useBlockList();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  return (
    <SafeAreaView style={styles.container}>
      <HeaderBack title="Field List" back />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.blocksContainer}>
          {blocks.map(block => (
            <BlockCard
              key={block.id}
              block={block}
              navigation={navigation}
              cardWidth={cardWidth}
              from="AllBlock"
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BlockListScreen;