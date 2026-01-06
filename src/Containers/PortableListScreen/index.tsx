import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Text,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '@Constants/RouteParamsList.constants';
import RouteName from '@Constants/RouteName.constants';
import HeaderBack from '@Molecule/HeaderBack';
import {useHeaderMode} from '@Hooks/useHeaderMode';
import {usePortableList} from './usePortableList';
import { PortableItem } from './Section/PortableItem';
import {styles} from './styles';
import DownloadReportModal from '@Containers/Tab/ChartScreen/Section/DownloadReportModal';

type Props = NativeStackScreenProps<RootStackParamList, typeof RouteName.PortableListScreenNavigation>; 

const PortableListScreen: React.FC<Props> = ({navigation}) => {
  const {handleScroll, headMode: headerMode} = useHeaderMode();
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleDownload = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

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
      <View style={styles.footerWrapper}>
              <View style={styles.footerBox}>
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={handleDownload}
                >
                  <Text style={styles.downloadText}>Download Report</Text>
                </TouchableOpacity>
              </View>
            </View>
            <DownloadReportModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onScreen='Portable'
      />
    </SafeAreaView>
      
  );
};

export default PortableListScreen;