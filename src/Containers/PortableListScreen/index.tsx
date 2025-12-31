import React from 'react';
import {
  View,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Text,
  RefreshControl,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '@Constants/RouteParamsList.constants';
import RouteName from '@Constants/RouteName.constants';
import HeaderBack from '@Molecule/HeaderBack';
import {useHeaderMode} from '@Hooks/useHeaderMode';
import {usePortableList} from './usePortableList';
import { PortableItem } from './Section/PortableItem';
import {styles} from './styles';

type Props = NativeStackScreenProps<RootStackParamList, typeof RouteName.PortableListScreenNavigation>; 

const PortableListScreen: React.FC<Props> = ({navigation}) => {
  const {handleScroll, headMode: headerMode} = useHeaderMode();

  const {
    reversedData,
    loading,
    fetchPortableData,
    handleItemPress,
  } = usePortableList(navigation);

  const renderItem = ({item}: any) => (
    <PortableItem item={item} onPress={() => handleItemPress(item)} />
  );

  const ItemSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBack title="Portable Tools" back animated mode={headerMode} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B4DC45" />
          <Text style={styles.loadingText}>
            Loading portable tools data...
          </Text>
        </View>
      ) : (
        <FlatList
          data={reversedData}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchPortableData}
              colors={['#B4DC45']}
              tintColor="#B4DC45"
            />
          }
          ItemSeparatorComponent={ItemSeparator}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={8}
          getItemLayout={(data, index) => ({
            length: 156,
            offset: 156 * index,
            index,
          })}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      )}
    </SafeAreaView>
  );
};

export default PortableListScreen;