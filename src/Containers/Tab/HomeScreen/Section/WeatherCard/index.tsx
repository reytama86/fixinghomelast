import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {View, Text, ImageBackground, Platform} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {fetchCurrentWeather} from 'src/Hooks/weather';
import {weatherImages} from '../../../../../Constants/WeatherIconList.constants';
import {styles} from './styles';
import {useWindowDimensions} from 'react-native';

type SensorMedianData = {
  median: number;
  count: number;
};

type MedianSensorResponse = {
  success: boolean;
  data: {
    [key: string]: SensorMedianData;
  };
  timestamp: string;
};

interface WeatherCardProps {
  sensorData: MedianSensorResponse['data'] | null;
}

type WeatherData = {
  is_day: number;
  description: string;
  temp: number;
  humidity: number;
  wind_speed: number;
};

const WeatherCard: React.FC<WeatherCardProps> = ({sensorData}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const getSensorValue = useCallback(
    (sensorName: string): string => {
      if (!sensorData || !sensorData[sensorName]) return 'N/A';
      return sensorData[sensorName].median.toFixed(1);
    },
    [sensorData],
  );

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    let isComponentMounted = true;

    async function loadWeather() {
      try {
        const w = await fetchCurrentWeather();
        if (w && isComponentMounted) {
          setWeather(w);
        }
      } catch (error) {
        console.error('Error loading weather:', error);
      }
    }

    loadWeather();
    intervalId = setInterval(loadWeather, 10 * 60 * 1000);

    return () => {
      isComponentMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const weatherInfo = useMemo(() => {
    if (!weather) return {Icon: null, timeKey: 'Day', descKey: ''};

    const timeKey = weather.is_day === 1 ? 'Day' : 'Night';
    const descKey = weather.description.toLowerCase();
    const Icon =
      weatherImages[timeKey][descKey] || weatherImages[timeKey].other;

    return {Icon, timeKey, descKey};
  }, [weather]);

  const {Icon} = weatherInfo;

  const {width} = useWindowDimensions();

  return (
    <ImageBackground
      source={require('@Assets/images/weather.png')}
      style={styles.card}
      imageStyle={styles.image}>
      <View style={styles.location}>
        <Ionicons name="location" size={20} color={'white'} />
        <Text style={styles.locationText}>Rembangan, Jember</Text>
      </View>

      <View style={styles.weatherSectionTwo}>
        <Text style={styles.temperatureText}>
          {Math.round(Number(getSensorValue('Temperature')))}°
        </Text>
        <View style={styles.detailSectionTwo}>
          <Text style={styles.detailSectionTwoText}>
            Humidity : {Math.round(Number(getSensorValue('Humidity')))}%
          </Text>
          <Text style={styles.detailSectionTwoText}>
            Light: {Math.round(Number(getSensorValue('Light')))} Lux
          </Text>
        </View>
        <View
          style={[
            styles.cloud,
            {
              left: width - 125, 
            },
          ]}>
          {Icon ? <Icon width={80} height={80} /> : null}
        </View>
      </View>

      <LinearGradient
        colors={['rgba(255,255,255,0)', '#FFFFFF', 'rgba(255,255,255,0)']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.gradientLine}
      />

      <View style={styles.detailSectionThree}>
        <View style={{flex: 1}}>
          <Text style={styles.detailSectionThreeText}>Soil Temperature</Text>
          <Text style={styles.detailSectionThreeValue}>
            {getSensorValue('Soil Temperature')}°
          </Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.detailSectionThreeText}>Soil Moisture</Text>
          <Text style={styles.detailSectionThreeValue}>
            {getSensorValue('Soil Humidity')}%
          </Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.detailSectionThreeText}>Conductivity</Text>
          <Text style={styles.detailSectionThreeValue}>
            {getSensorValue('EC')} μS/cm
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

export default WeatherCard;
