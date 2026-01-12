import React from 'react';
import {View, Text, ScrollView} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GaugeSvg from '@Atom/Gauge';
import { Ellips } from '@Assets/svg/Static';
import {SoilSensorData} from 'src/Navigators/Tab';
import {SoilIndicator} from '@Helpers/getSensorStatus';
import styles from './styles';
import DynamicGauge from '@Organism/DynamicGauge';

type SensorContentProps = {
  sensorData: SoilSensorData | null;
  indicators: {
    temp: SoilIndicator;
    humidity: SoilIndicator;
    ph: SoilIndicator;
    ec: SoilIndicator;
    nitrogen: SoilIndicator;
    phosphorus: SoilIndicator;
    kalium: SoilIndicator;
  };
  isHistoryMode?: boolean;
};

export const SensorContent: React.FC<SensorContentProps> = ({
  sensorData,
  indicators,
}) => {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.containerTransmisi}>
          <View style={[styles.cardTransmisi, {marginRight: 12}]}>
            <View style={styles.cardDetailTransmisi}>
              <View style={styles.Transmisi}>
                 <DynamicGauge 
                  value={sensorData?.Temp || 0} 
                  type="temperature"
                  width={127}
                  height={106}
                />
                <View style={{top: -100, right: -105}}>
                </View>
              </View>
              <Text style={styles.nameSensorTransmisi}>Soil Temperature</Text>
            </View>
            <Text style={styles.valueTransmisi}>
              {sensorData ? `${sensorData.Temp.toFixed(0)}°` : 'N/A'}
            </Text>
          </View>

          <View style={styles.cardTransmisi}>
            <View style={styles.cardDetailTransmisi}>
              <View style={styles.Transmisi}>
                <DynamicGauge 
                value={sensorData?.Humidity || 0} 
                type="humidity"
                width={127}
                height={106}
              />
              </View>
              <Text style={styles.nameSensorTransmisi}>Soil Humidity</Text>
            </View>
            <Text style={styles.valueTransmisi}>
              {sensorData ? `${sensorData.Humidity.toFixed(0)}%` : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.cardTwo}>
          <Text style={styles.soilTitle}>Soil Statistic</Text>

          <View style={styles.soilStatisticOne}>
            <View style={styles.detailStatisticOne}>
              <View style={styles.statContent}>
                <Text style={styles.statLabelHistory}>PH</Text>
                <Text style={styles.statValueHistory}>
                  {sensorData ? sensorData.pH.toFixed(1) : 'N/A'}
                </Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons name={indicators.ph.icon} size={18} color={indicators.ph.color} />
                <Text style={[styles.statStatusHistory, {color: indicators.ph.color}]}>
                  {indicators.ph.status}
                </Text>
              </View>
            </View>

            <View style={styles.detailStatisticOne}>
              <View style={styles.statContent}>
                <Text style={styles.statLabelHistory}>Conductivity</Text>
                <Text style={styles.statValueHistory}>
                  {sensorData ? `${Math.round(sensorData.EC)} μS/cm` : 'N/A'}
                </Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons name={indicators.ec.icon} size={18} color={indicators.ec.color} />
                <Text style={[styles.statStatusHistory, {color: indicators.ec.color}]}>
                  {indicators.ec.status}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.soilStatisticTwo}>
            <View style={styles.detailStatisticOne}>
              <View style={styles.statContent}>
                <Text style={styles.statLabelHistory}>Nitrogen</Text>
                <Text style={styles.statValueHistory}>
                  {sensorData ? `${sensorData.Nitrogen.toFixed(0)} mg/kg` : 'N/A'}
                </Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons
                  name={indicators.nitrogen.icon}
                  size={18}
                  color={indicators.nitrogen.color}
                />
                <Text style={[styles.statStatusHistory, {color: indicators.nitrogen.color}]}>
                  {indicators.nitrogen.status}
                </Text>
              </View>
            </View>

            <View style={styles.detailStatisticOne}>
              <View style={styles.statContent}>
                <Text style={styles.statLabelHistory}>Phosphor</Text>
                <Text style={styles.statValueHistory}>
                  {sensorData ? `${sensorData.Phosphorus.toFixed(0)} mg/kg` : 'N/A'}
                </Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons
                  name={indicators.phosphorus.icon}
                  size={18}
                  color={indicators.phosphorus.color}
                />
                <Text style={[styles.statStatusHistory, {color: indicators.phosphorus.color}]}>
                  {indicators.phosphorus.status}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.soilStatisticTwo}>
            <View style={styles.detailStatisticOneKal}>
              <View style={styles.statContent}>
                <Text style={styles.statLabelHistory}>Kalium</Text>
                <Text style={styles.statValueHistory}>
                  {sensorData ? `${sensorData.Kalium.toFixed(0)} mg/kg` : 'N/A'}
                </Text>
              </View>
              <View style={styles.statExtra}>
                <Ionicons
                  name={indicators.kalium.icon}
                  size={18}
                  color={indicators.kalium.color}
                />
                <Text style={[styles.statStatusHistory, {color: indicators.kalium.color}]}>
                  {indicators.kalium.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

