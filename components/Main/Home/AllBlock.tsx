import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  BackHandler,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../../HomeStack';
import {ArrowDown, ArrowLeft, ArrowLeft2} from 'iconsax-react-native';
import {useFocusEffect} from '@react-navigation/native';

type Props = NativeStackScreenProps<HomeStackParamList, 'AllBlock'>;

const {width: screenWidth} = Dimensions.get('window');
const cardWidth = (screenWidth - 45.5) / 2; // Same as HomeFix

interface BlockData {
  id: number;
  name: string;
  temperature: string;
  humidity: string;
  navigationTarget?: 'DetailBlockOne' | 'DetailBlockTwo';
  svgPath?: 'block1' | 'block2' | 'block3' | 'block7' | 'block8';
}

const AllBlock: React.FC<Props> = ({navigation}) => {
  const [sensorDataBlocks, setSensorDataBlocks] = useState({
    block3: {temp: '--', humidity: '--'},
    block4: {temp: '--', humidity: '--'},
    block6: {temp: '--', humidity: '--'},
    block7: {temp: '--', humidity: '--'},
    block8: {temp: '--', humidity: '--'},
  });

  const fetchAllBlocksData = useCallback(async () => {
    try {
      const response = await fetch(
        'https://iot-vanili-api.permataindonesia.com/api/temp-humidity',
      );
      const result = await response.json();

      if (result.success) {
        const data = result.data;

        // Mapping sensor ID ke block
        const blockSensorMap = {
          3: 'block3', // Block 3
          2: 'block4', // Block 4 (sensor ID 2)
          5: 'block7', // Block 6 (sensor ID 5)
          6: 'block6', // Block 7 (sensor ID 6)
          7: 'block8', // Block 8 (sensor ID 7)
        };

        const newBlockData = {...sensorDataBlocks};

        // Process data untuk setiap block
        Object.entries(blockSensorMap).forEach(([sensorId, blockKey]) => {
          const tempSensor = data.find(
            item =>
              item.id_sensor === parseInt(sensorId) &&
              item.keterangan_sensor === 'Temperature',
          );
          const humiditySensor = data.find(
            item =>
              item.id_sensor === parseInt(sensorId) &&
              item.keterangan_sensor === 'Humidity',
          );

          newBlockData[blockKey] = {
            temp: tempSensor ? tempSensor.nilai_sensor : '--',
            humidity: humiditySensor ? humiditySensor.nilai_sensor : '--',
          };
        });

        setSensorDataBlocks(newBlockData);
      }
    } catch (error) {
      console.log('Error fetching blocks data:', error);
    }
  }, []);

  useEffect(() => {
    fetchAllBlocksData();
    const interval = setInterval(fetchAllBlocksData, 30000); // Update setiap 30 detik
    return () => clearInterval(interval);
  }, [fetchAllBlocksData]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return; // hanya untuk android

      const onBackPress = () => {
        // gunakan replace agar tidak menumpuk route
        navigation.replace('HomeFix' as any);
        return true; // mencegah default behavior
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  const CornerCutComponent = useMemo(() => {
    return ({
      width = 300,
      height = 400,
      cutSize = 50,
      backgroundColor = '#ffffff',
      borderRadius = 16,
      children,
    }: any) => {
      const createPath = () => `
        M ${borderRadius} 0
        L ${width - borderRadius} 0
        Q ${width} 0 ${width} ${borderRadius}
        L ${width} ${height - cutSize - borderRadius}
        Q ${width} ${height - cutSize} ${width - borderRadius} ${
        height - cutSize
      }
        L ${width - cutSize + borderRadius} ${height - cutSize}
        Q ${width - cutSize} ${height - cutSize} ${width - cutSize} ${
        height - cutSize + borderRadius
      }
        L ${width - cutSize} ${height - borderRadius}
        Q ${width - cutSize} ${height} ${
        width - cutSize - borderRadius
      } ${height}
        L ${borderRadius} ${height}
        Q 0 ${height} 0 ${height - borderRadius}
        L 0 ${borderRadius}
        Q 0 0 ${borderRadius} 0
        Z
      `;

      return (
        <View style={[styles.cornerCutContainer, {width, height}]}>
          <Svg
            width={width}
            height={height}
            style={StyleSheet.absoluteFillObject}>
            <Path d={createPath()} fill={backgroundColor} />
          </Svg>
          {children}
        </View>
      );
    };
  }, []);

  const renderSvgByType = (
    svgType: 'block1' | 'block2' | 'block3' | 'block7' | 'block8',
    blockId: number,
  ) => {
    if (svgType === 'block1') {
      return (
        <>
          <Svg width={103.5} height={87.5} viewBox="0 0 103 89" fill="none">
            <Path
              d="M14.5 53C14.1413 48.3364 6.51668 22.4115 1.58114 6.17196C0.798561 3.59703 2.72462 1 5.41584 1H44.0326C44.98 1 45.8966 1.33629 46.6193 1.94897L68.5 20.5L100.231 49.9647C101.976 51.5849 101.928 54.3613 100.128 55.9199L64.9215 86.4033C63.5061 87.6288 61.43 87.7086 59.9247 86.5954L14.5 53Z"
              fill="#F0F8DA"
            />
            <Path
              d="M14.5 53C14.1413 48.3364 6.51668 22.4115 1.58114 6.17196C0.798561 3.59703 2.72462 1 5.41584 1H44.0326C44.98 1 45.8966 1.33629 46.6193 1.94897L68.5 20.5M14.5 53L59.9247 86.5954C61.43 87.7086 63.5061 87.6288 64.9215 86.4033L100.128 55.9199C101.928 54.3613 101.976 51.5849 100.231 49.9647L68.5 20.5M14.5 53L68.5 20.5"
              stroke="#A3C73F"
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.vectorLabel1}>{blockId}</Text>
        </>
      );
    } else if (svgType === 'block2') {
      return (
        <>
          <Svg width={102} height={77} viewBox="0 0 102 77" fill="none">
            <Path
              d="M1.49996 43.5C1.14581 38.8961 14.7443 18.9287 17.8669 14.4109C18.2851 13.8058 18.8567 13.3446 19.5312 13.0509L45.6306 1.68501C47.7332 0.769373 50.1736 1.80538 50.9753 3.95399L62 33.5L97.6325 47.988C101.055 49.3794 100.923 54.2696 97.4307 55.4746L38.7879 75.7105C37.3813 76.1959 35.8216 75.8604 34.739 74.8397L1.49996 43.5Z"
              fill="#F0F8DA"
            />
            <Path
              d="M1.49996 43.5C1.14581 38.8961 14.7443 18.9287 17.8669 14.4109C18.2851 13.8058 18.8567 13.3446 19.5312 13.0509L45.6306 1.68501C47.7332 0.769373 50.1736 1.80538 50.9753 3.95399L62 33.5M1.49996 43.5L34.739 74.8397C35.8216 75.8604 37.3813 76.1959 38.7879 75.7105L97.4307 55.4746C100.923 54.2696 101.055 49.3794 97.6325 47.988L62 33.5M1.49996 43.5L62 33.5"
              stroke="#A3C73F"
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.vectorLabel2}>{blockId}</Text>
        </>
      );
    } else if (svgType === 'block3') {
      return (
        <>
          <Svg width={75} height={75} viewBox="0 0 75 75" fill="none">
            <Path
              d="M23 41.5C22.7389 38.1051 12.1631 34.6677 4.85203 32.6902C1.85164 31.8786 0.699877 28.1139 2.82327 25.8441L24.4642 2.71067C25.8943 1.18196 28.2611 1.01442 29.8923 2.32644L73 37L70.7546 67.9862C70.6091 69.9947 68.993 71.5819 66.9822 71.6912L28.5269 73.7812C26.3082 73.9017 24.4165 72.191 24.3141 69.9715L23 41.5Z"
              fill="#F0F8DA"
            />
            <Path
              d="M23 41.5C22.7389 38.1051 12.1631 34.6677 4.85203 32.6902C1.85164 31.8786 0.699877 28.1139 2.82327 25.8441L24.4642 2.71067C25.8943 1.18196 28.2611 1.01442 29.8923 2.32644L73 37M23 41.5L24.3141 69.9715C24.4165 72.191 26.3082 73.9017 28.5269 73.7811L66.9822 71.6912C68.993 71.5819 70.6091 69.9947 70.7546 67.9862L73 37M23 41.5L73 37"
              stroke="#A3C73F"
              strokeWidth={2}
            />
          </Svg>
          <Text style={styles.vectorLabel3}>{blockId}</Text>
        </>
      );
    } else if (svgType === 'block7') {
      return (
        <>
          <Svg width={86} height={63} viewBox="0 0 86 63" fill="none">
            <Path
              d="M2 32L20.3202 3.34535C21.0552 2.19566 22.3257 1.5 23.6903 1.5H71.6812C73.3716 1.5 74.8796 2.56269 75.4481 4.15467L79.5 15.5L84.3484 41.9459C84.7185 43.9645 83.5009 45.9356 81.5302 46.5083L29.0631 61.7552C27.5113 62.2061 25.8405 61.679 24.8284 60.4191L2 32Z"
              fill="#F0F8DA"
            />
            <Path
              d="M2 32L20.3202 3.34535C21.0552 2.19566 22.3257 1.5 23.6903 1.5H71.6812C73.3716 1.5 74.8796 2.56269 75.4481 4.15467L79.5 15.5M2 32L24.8284 60.4191C25.8405 61.679 27.5113 62.2061 29.0631 61.7552L81.5302 46.5083C83.5009 45.9356 84.7185 43.9645 84.3484 41.9459L79.5 15.5M2 32L79.5 15.5"
              stroke="#A3C73F"
              strokeWidth={2}
            />
          </Svg>
          <Text style={styles.vectorLabel7}>{blockId}</Text>
        </>
      );
    } else if (svgType === 'block8') {
      return (
        <>
          <Svg width={89} height={61} viewBox="0 0 89 61" fill="none">
            <Path
              d="M1.50002 40C1.17494 35.7739 5.67145 25.2071 7.36719 21.3972C7.76878 20.4949 8.50285 19.7861 9.41171 19.3996L50.002 2.1371C50.9624 1.72863 52.0445 1.71174 53.0172 2.09002L87.5 15.5L81.1636 56.2342C80.8056 58.5357 78.5647 60.0458 76.2972 59.5136L31.5 49L1.50002 40Z"
              fill="#F0F8DA"
            />
            <Path
              d="M1.50002 40C1.17494 35.7739 5.67145 25.2071 7.36719 21.3972C7.76878 20.4949 8.50285 19.7862 9.41171 19.3996L50.002 2.1371C50.9624 1.72863 52.0445 1.71174 53.0172 2.09002L87.5 15.5M1.50002 40L31.5 49L76.2972 59.5136C78.5647 60.0458 80.8056 58.5357 81.1636 56.2342L87.5 15.5M1.50002 40L87.5 15.5"
              stroke="#A3C73F"
              strokeWidth={2}
            />
          </Svg>
          <Text style={styles.vectorLabel8}>{blockId}</Text>
        </>
      );
    }
  };

  const blocks: BlockData[] = [
    {
      id: 3,
      name: 'Block 3',
      temperature: isNaN(Number(sensorDataBlocks.block3.temp))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block3.temp)).toString(),
      humidity: isNaN(Number(sensorDataBlocks.block3.humidity))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block3.humidity)).toString(),
      svgPath: 'block3',
    },
    {
      id: 4,
      name: 'Block 4',
      temperature: isNaN(Number(sensorDataBlocks.block4.temp))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block4.temp)).toString(),
      humidity: isNaN(Number(sensorDataBlocks.block4.humidity))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block4.humidity)).toString(),
      navigationTarget: 'DetailBlockOne',
      svgPath: 'block1',
    },
    {
      id: 6,
      name: 'Block 6',
      temperature: isNaN(Number(sensorDataBlocks.block6.temp))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block6.temp)).toString(),
      humidity: isNaN(Number(sensorDataBlocks.block6.humidity))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block6.humidity)).toString(),
      svgPath: 'block7',
    },
    {
      id: 7,
      name: 'Block 7',
      temperature: isNaN(Number(sensorDataBlocks.block7.temp))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block7.temp)).toString(),
      humidity: isNaN(Number(sensorDataBlocks.block7.humidity))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block7.humidity)).toString(),
      navigationTarget: 'DetailBlockTwo',
      svgPath: 'block2',
    },
    {
      id: 8,
      name: 'Block 8',
      temperature: isNaN(Number(sensorDataBlocks.block8.temp))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block8.temp)).toString(),
      humidity: isNaN(Number(sensorDataBlocks.block8.humidity))
        ? '0'
        : Math.round(Number(sensorDataBlocks.block8.humidity)).toString(),
      svgPath: 'block8',
    },
  ];

  const renderBlockCard = (block: BlockData) => (
    <View key={block.id} style={styles.blockCard}>
      <TouchableOpacity
        onPress={() => {
          if (block.navigationTarget) {
            navigation.navigate(block.navigationTarget, {from: 'AllBlock'}); // Tambah parameter from
          }
        }}
        disabled={!block.navigationTarget}>
        <CornerCutComponent
          width={cardWidth}
          height={175}
          cutSize={40.5}
          backgroundColor="#ffffff"
          borderRadius={22}>
          <View style={styles.cardBlockContent}>
            <View style={styles.containerVector}>
              <View style={styles.svgContainer}>
                {renderSvgByType(block.svgPath || 'block1', block.id)}
              </View>
            </View>
            <View style={styles.containerTextBlock}>
              <Text style={styles.textBlockHeader}>{block.name}</Text>
              <Text style={styles.textBlock}>
                Temperature: {block.temperature}°
              </Text>
              <Text style={styles.textBlock}>Humidity: {block.humidity}%</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('HomeFix')}
          activeOpacity={0.7}
          style={{marginLeft: 16}}>
          <ArrowLeft2 color="black" variant="Linear" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Field List</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.blocksContainer}>
          {blocks.map(renderBlockCard)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 32,
    marginTop: -30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Medium',
    color: 'black',
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16, // Same as HomeFix
  },
  blocksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12.5, // Same gap as HomeFix
  },
  blockCard: {
    marginBottom: 0,
  },
  cornerCutContainer: {
    overflow: 'hidden',
  },
  cardBlockContent: {
    flex: 1,
    position: 'relative',
  },
  // Same styling as HomeFix
  containerVector: {
    position: 'absolute',
    width: 147,
    height: 87.5,
    top: 16,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  svgContainer: {
    width: 100,
    height: 85,
    left: 20,
    top: 0,
    backgroundColor: '#white',
  },
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
  containerTextBlock: {
    alignItems: 'flex-start',
    top: 111,
    paddingHorizontal: 12,
    width: '100%',
    height: 52,
  },
  textBlockHeader: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Medium',
  },
  textBlock: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-Regular',
  },
  cutoutButton: {
    position: 'absolute',
    width: 36,
    height: 36,
    bottom: 0,
    right: 0,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    position: 'absolute',
    transform: [{rotate: '230deg'}],
  },
});

export default AllBlock;
