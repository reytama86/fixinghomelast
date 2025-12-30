import React, {useCallback} from 'react';
import {View, ScrollView, BackHandler, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import RouteName from '@Constants/RouteName.constants';
import HeaderBack from '@Molecule/HeaderBack';
import {BlockCard} from './sections/BlockCard';
import {useBlockList} from './useBlockList';
import {styles} from './styles';

const AllBlock: React.FC<any> = ({navigation}) => {
  const {blocks} = useBlockList();

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;

      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  const handleBlockPress = (blockId: number) => {
    navigation.navigate(RouteName.DetailBlockNavigation, {
      blockId,
      from: 'AllBlock',
    });
  };

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
              onPress={handleBlockPress}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AllBlock;