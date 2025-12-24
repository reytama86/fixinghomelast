import React, {useMemo} from 'react';
import {View, Text, TouchableOpacity, Dimensions} from 'react-native';
import {Maximize1, ArrowDown} from 'iconsax-react-native';
import Svg, {Path} from 'react-native-svg';
import { CornerCutComponent } from './CornerCutComponent';
import {styles} from './styles';
import RouteName from '@Constants/RouteName.constants';

const {width: screenWidth} = Dimensions.get('window');
const cardWidth = (screenWidth - 45.5) / 2;

interface SensorDataBlock {
  block1: {temp: string; humidity: string};
  block2: {temp: string; humidity: string};
}

interface FieldListProps {
  sensorDataBlock: SensorDataBlock;
  navigation: any;
}

const FieldList: React.FC<FieldListProps> = ({sensorDataBlock, navigation}) => {
  return (
    <View style={styles.fieldList}>
      <View style={styles.headerFieldList}>
        <Text style={styles.headerText}>Field List</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AllBlock')}>
          <View style={styles.showAll}>
            <Text style={styles.showAllText}>Show All</Text>
            <Maximize1 color="#B4DC45" variant="Broken" size={24} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.containerBlock}>
        {/* Block 3 */}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('DetailBlockTwo', {from: 'HomeFix'});
          }}>
          <CornerCutComponent
            width={cardWidth}
            height={175}
            cutSize={40.5}
            backgroundColor="#ffffff"
            borderRadius={22}>
            <View style={styles.cardBlockContent}>
              <View style={styles.containerVector}>
                <View style={styles.svgContainer}>
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
                </View>
                <Text style={styles.vectorLabel2}>3</Text>
              </View>
              <View style={styles.containerTextBlock}>
                <Text style={styles.textBlockHeader}>Block 3</Text>
                <Text style={styles.textBlock}>
                  Temperature: {Math.round(Number(sensorDataBlock.block2.temp))}°
                </Text>
                <Text style={styles.textBlock}>
                  Humidity: {Math.round(Number(sensorDataBlock.block2.humidity))}%
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

        {/* Block 4 */}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(RouteName.DetailBlockNavigation);
          }}>
          <CornerCutComponent
            width={cardWidth}
            height={175}
            cutSize={40.5}
            backgroundColor="#ffffff"
            borderRadius={22}>
            <View style={styles.cardBlockContent}>
              <View style={styles.containerVector}>
                <View style={styles.svgContainer}>
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
                </View>
                <Text style={styles.vectorLabel1}>4</Text>
              </View>
              <View style={styles.containerTextBlock}>
                <Text style={styles.textBlockHeader}>Block 4</Text>
                <Text style={styles.textBlock}>
                  Temperature: {Math.round(Number(sensorDataBlock.block1.temp))}°
                </Text>
                <Text style={styles.textBlock}>
                  Humidity: {Math.round(Number(sensorDataBlock.block1.humidity))}%
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
    </View>
  );
};

export default FieldList;