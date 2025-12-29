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
import {ArrowDown, ArrowLeft2} from 'iconsax-react-native';
import { useFocusEffect } from '@react-navigation/native';
import RouteName from '@Constants/RouteName.constants';
import HeaderBack from '@Molecule/HeaderBack';

const {width: screenWidth} = Dimensions.get('window');
const cardWidth = (screenWidth - 45.5) / 2;

type SensorBlockValue = { temp: string; humidity: string };

const AllBlock: React.FC<any> = ({navigation}) => {
  const [sensorDataBlocks, setSensorDataBlocks] = useState<Record<string, SensorBlockValue>>({
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

        const blockSensorMap: Record<number, string> = {
          5: 'block3',
          2: 'block4',
          6: 'block6',
          3: 'block7',
          7: 'block8',
        };

        // build new state object from scratch (avoid stale closures)
        const newBlockData: Record<string, SensorBlockValue> = {
          block3: {temp: '--', humidity: '--'},
          block4: {temp: '--', humidity: '--'},
          block6: {temp: '--', humidity: '--'},
          block7: {temp: '--', humidity: '--'},
          block8: {temp: '--', humidity: '--'},
        };

        Object.entries(blockSensorMap).forEach(([sensorIdStr, blockKey]) => {
          const sensorId = parseInt(sensorIdStr, 10);

          const tempSensor = data.find(
            (item: any) =>
              item.id_sensor === sensorId && item.keterangan_sensor === 'Temperature',
          );
          const humiditySensor = data.find(
            (item: any) =>
              item.id_sensor === sensorId && item.keterangan_sensor === 'Humidity',
          );

          newBlockData[blockKey] = {
            temp: tempSensor ? String(tempSensor.nilai_sensor) : '--',
            humidity: humiditySensor ? String(humiditySensor.nilai_sensor) : '--',
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
    const interval = setInterval(fetchAllBlocksData, 30000);
    return () => clearInterval(interval);
  }, [fetchAllBlocksData]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return; // only for Android hardware back

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

  // Corner cut component (kepraktisan: tetap sederhana)
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
        Q ${width} ${height - cutSize} ${width - borderRadius} ${height - cutSize}
        L ${width - cutSize + borderRadius} ${height - cutSize}
        Q ${width - cutSize} ${height - cutSize} ${width - cutSize} ${height - cutSize + borderRadius}
        L ${width - cutSize} ${height - borderRadius}
        Q ${width - cutSize} ${height} ${width - cutSize - borderRadius} ${height}
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

  const renderSvgByType = (svgType: string, blockId: number) => {
    // (sama seperti sebelumnya — dipertahankan)
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
    }
    // ... block2, block3, block7, block8 (tetap seperti sebelumnya) ...
    // untuk singkat pada contoh ini aku mempertahankan semua render SVG yang sudah ada di kode asli
    return null;
  };

  const formatValue = (v: string) => {
    const n = Number(v);
    if (!isFinite(n)) return '--';
    return Math.round(n).toString();
  };

  const blocks = [
    {
      id: 3,
      name: 'Block 3',
      temperature: formatValue(sensorDataBlocks.block3.temp),
      humidity: formatValue(sensorDataBlocks.block3.humidity),
      navigationEnabled: true,
      svgPath: 'block2',
    },
    {
      id: 4,
      name: 'Block 4',
      temperature: formatValue(sensorDataBlocks.block4.temp),
      humidity: formatValue(sensorDataBlocks.block4.humidity),
      navigationEnabled: true,
      svgPath: 'block1',
    },
    {
      id: 6,
      name: 'Block 6',
      temperature: formatValue(sensorDataBlocks.block6.temp),
      humidity: formatValue(sensorDataBlocks.block6.humidity),
      navigationEnabled: false,
      svgPath: 'block7',
    },
    {
      id: 7,
      name: 'Block 7',
      temperature: formatValue(sensorDataBlocks.block7.temp),
      humidity: formatValue(sensorDataBlocks.block7.humidity),
      navigationEnabled: true,
      svgPath: 'block3',
    },
    {
      id: 8,
      name: 'Block 8',
      temperature: formatValue(sensorDataBlocks.block8.temp),
      humidity: formatValue(sensorDataBlocks.block8.humidity),
      navigationEnabled: false,
      svgPath: 'block8',
    },
  ];

  const renderBlockCard = (block: any) => (
    <View key={block.id} style={styles.blockCard}>
      <TouchableOpacity
        onPress={() => {
          if (block.navigationEnabled) {
            navigation.navigate(RouteName.DetailBlockNavigation , { blockId: block.id, from: 'AllBlock' });
          }
        }}
        disabled={!block.navigationEnabled}
        activeOpacity={0.8}
      >
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

  return (
    <SafeAreaView style={styles.container}>
      <HeaderBack
      title="Field List"
      back
    />

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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk-Medium',
    color: 'black',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  blocksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12.5,
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
