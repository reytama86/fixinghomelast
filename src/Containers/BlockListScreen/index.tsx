import React from 'react';
import {View, ScrollView, Dimensions, StatusBar, Platform} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
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

const BlockListScreen: React.FC = () => {
  const {blocks} = useBlockList();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderBack title="Field List" back />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 25, 
          }
        ]}>
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