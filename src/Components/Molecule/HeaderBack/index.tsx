import {RootStackParamList} from '@Constants/RouteParamsList.constants';
import {BlurView} from '@react-native-community/blur';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useEffect, memo} from 'react';
import {
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View as RNView,
  Text as RNText,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import styles from './styles';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const FallbackColors = {
  neutral10: '#0A0A0A',
  neutral100: '#FFFFFF',
  fullTrransparent: 'rgba(255,255,255,0)',
  semiTransparentWhite: 'rgba(255,255,255,0.8)',
  nightBlue: '#0B3D91',
  neutral: '#F4F4F4',
  primaryMain: '#2B8A3E',
};

const useThemeFallback = () => ({
  Colors: FallbackColors,
  Gutters: {},
  FontSize: {small: 12, medium: 14, large: 18},
});

const StaticIconFallback: React.FC<{
  name?: string;
  size?: number;
  width?: number;
  color?: string;
}> = ({name = 'arrow-left', width = 24, size = 24, color = '#000'}) => {
  if (name === 'arrow-left') {
    return (
      <Svg width={width} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M15 19.92L8.48 13.4C7.71 12.63 7.71 11.37 8.48 10.6L15 4.07996"
          stroke={color}
          strokeWidth={1.5}
          strokeMiterlimit={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={width} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2a10 10 0 100 20 10 10 0 000-20z"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const TextFallback: React.FC<{
  animatedStyle?: any;
  style?: any;
  children?: React.ReactNode;
}> = ({animatedStyle, style, children}) => {
  if (animatedStyle) {
    const AnimatedText = Animated.createAnimatedComponent(RNText);
    return (
      <AnimatedText style={[style, animatedStyle]}>
        {children}
      </AnimatedText>
    );
  }
  return (
    <RNText style={style} numberOfLines={1}>
      {children}
    </RNText>
  );
};

interface HeaderBackProps {
  back?: boolean;
  title: string;
  color?: string;
  right?: boolean;
  nameSVGRight?: string;
  nameSVGLeft?: string;
  colorSVGLeft?: string;
  colorSVGRight?: string;
  onPressRight?: () => void;
  italic?: boolean;
  animated?: boolean;
  mode?: 'top' | string;
}

// ── Static header (tidak pakai animated) ─────────────────────────
const StaticHeader: React.FC<HeaderBackProps> = memo(({
  back,
  title,
  right,
  nameSVGRight,
  colorSVGLeft,
  onPressRight,
  italic,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const totalPadingTop = (StatusBar.currentHeight || 0) + 5;
  const totalPadingTopAbsolute = (StatusBar.currentHeight || 0) + 10;
  const {Colors} = useThemeFallback();
  const StaticIcon = StaticIconFallback;
  const Text = TextFallback;

  return (
    <RNView style={[styles.container, {paddingTop: totalPadingTop}]}>
      {back && (
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.backNormal, {paddingTop: totalPadingTopAbsolute}]}>
          <StaticIcon width={24} name="arrow-left" size={24} color={Colors.neutral10} />
        </Pressable>
      )}
      <Text
        style={{
          fontFamily: 'SpaceGrotesk-SemiBold',
          fontSize: 18,
          fontStyle: italic ? 'italic' : 'normal',
          color: '#1F2937',
        }}>
        {title}
      </Text>
      {right && (
        <Pressable
          onPress={onPressRight}
          style={[styles.right, {paddingTop: totalPadingTop}]}>
          <StaticIcon
            width={24}
            name={nameSVGRight ?? 'arrow-left'}
            size={24}
            color={colorSVGLeft ?? Colors.neutral10}
          />
        </Pressable>
      )}
    </RNView>
  );
});

// ── Animated header ───────────────────────────────────────────────
// Dipisah jadi component sendiri agar semua hooks selalu dipanggil
// tanpa conditional, tidak melanggar Rules of Hooks
const AnimatedHeader: React.FC<HeaderBackProps> = memo(({
  back,
  title,
  right,
  nameSVGRight,
  colorSVGLeft,
  onPressRight,
  italic,
  mode,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const totalPadingTop = (StatusBar.currentHeight || 0) + 5;
  const AnimatedPath = Animated.createAnimatedComponent(Path);
  const insets = useSafeAreaInsets();
  const windowInsets = initialWindowMetrics?.insets || {top: 0};
  const {Colors} = useThemeFallback();
  const StaticIcon = StaticIconFallback;
  const Text = TextFallback;

  useEffect(() => {
    StatusBar.setBarStyle(mode === 'top' ? 'light-content' : 'dark-content');
  }, [mode]);

  const derivedColor = useDerivedValue(
    () => withTiming(mode === 'top' ? 0 : 1, {duration: 200}),
  );

  const animatedBackground = useAnimatedStyle(() => {
    if (Platform.OS === 'ios') {
      return {
        backgroundColor: interpolateColor(
          derivedColor.value,
          [0, 1],
          [Colors.fullTrransparent, Colors.semiTransparentWhite],
        ),
        shadowColor: Colors.nightBlue,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.12,
        elevation: 4,
      };
    }
    return {
      backgroundColor: interpolateColor(
        derivedColor.value,
        [0, 1],
        ['transparent', Colors.semiTransparentWhite],
      ),
    };
  });

  const animatedColor = useAnimatedStyle(() => ({
    color: interpolateColor(
      derivedColor.value,
      [0, 1],
      [Colors.neutral10, Colors.neutral10],
    ),
  }));

  const animatedColorSvg = useAnimatedProps(() => ({
    stroke: interpolateColor(
      derivedColor.value,
      [0, 1],
      [Colors.neutral10, Colors.neutral10],
    ),
  } as any));

  const animatedColorFillSvg = useAnimatedProps(() => ({
    fill: interpolateColor(
      derivedColor.value,
      [0, 1],
      [Colors.neutral10, Colors.neutral10],
    ),
  } as any));

  const animatedBlurProps = useAnimatedProps(() => ({
    blurAmount: Math.round(
      interpolate(derivedColor.value, [0, 1], [0, 10], Extrapolation.CLAMP),
    ),
  } as any));

  const animatedBOpacity = useAnimatedProps(() => ({
    opacity: interpolate(derivedColor.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  } as any));

  const animatedBOpacityAndroid = useAnimatedProps(() => ({
    opacity: interpolate(derivedColor.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    backgroundColor: interpolateColor(
      derivedColor.value,
      [0, 1],
      ['transparent', Colors.neutral],
    ),
    elevation: 12,
    flex: 1,
  } as any));

  return (
    <Animated.View
      style={[
        styles.containerAnimated,
        {paddingTop: Platform.OS === 'ios' ? insets.top : windowInsets.top + 5},
        animatedBackground,
      ]}>
      {Platform.OS === 'ios' ? (
        <Animated.View style={[animatedBOpacity as any, StyleSheet.absoluteFill]}>
          <AnimatedBlurView
            animatedProps={animatedBlurProps}
            blurType="light"
            style={StyleSheet.absoluteFill}
            reducedTransparencyFallbackColor="white"
          />
        </Animated.View>
      ) : (
        <Animated.View
          style={[animatedBOpacityAndroid as any, StyleSheet.absoluteFill]}
        />
      )}

      {back && (
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.back, {paddingTop: 20, zIndex: 999}]}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <AnimatedPath
              animatedProps={animatedColorSvg}
              d="M15 19.92L8.48 13.4C7.71 12.63 7.71 11.37 8.48 10.6L15 4.07996"
              strokeWidth={1.5}
              strokeMiterlimit={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      )}

      <Text
        animatedStyle={animatedColor as any}
        style={{
          fontFamily: 'SpaceGrotesk-SemiBold',
          fontSize: 18,
          fontStyle: italic ? 'italic' : 'normal',
          color: '#1F2937',
        }}>
        {title}
      </Text>

      {right && (
        <Pressable
          onPress={onPressRight}
          style={[styles.right, {paddingTop: totalPadingTop}]}>
          {nameSVGRight === 'timer-back' ? (
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <AnimatedPath
                d="M12 8V13H17V11H14V8H12Z"
                animatedProps={animatedColorFillSvg}
              />
              <AnimatedPath
                d="M21.292 8.49664C20.8409 7.42668 20.1861 6.45465 19.364 5.63464C18.1196 4.3902 16.5377 3.53774 14.814 3.18264C13.6176 2.93912 12.3844 2.93912 11.188 3.18264C9.46267 3.53547 7.87947 4.38863 6.636 5.63564C5.81589 6.45652 5.16133 7.42749 4.708 8.49564C4.23911 9.60425 3.99832 10.7959 4 11.9996L4.001 12.0246H2L5 15.9996L8 12.0246H6.001L6 11.9996C5.99712 10.605 6.41346 9.24171 7.195 8.08664C7.69912 7.34132 8.34095 6.69915 9.086 6.19464C9.84394 5.68404 10.6941 5.32603 11.589 5.14064C13.4075 4.76674 15.3001 5.13027 16.8507 6.15131C18.4013 7.17235 19.483 8.76733 19.858 10.5856C20.0466 11.5175 20.0466 12.4778 19.858 13.4096C19.675 14.3053 19.3168 15.1559 18.804 15.9126C18.554 16.2836 18.267 16.6326 17.95 16.9486C17.3112 17.5867 16.5558 18.0962 15.725 18.4496C15.3018 18.6285 14.862 18.7652 14.412 18.8576C13.4804 19.0461 12.5206 19.0461 11.589 18.8576C10.6943 18.6742 9.84447 18.3164 9.088 17.8046C8.71595 17.5532 8.36871 17.2669 8.051 16.9496L6.637 18.3636C7.47212 19.1999 8.46403 19.8632 9.5559 20.3155C10.6478 20.7679 11.8181 21.0003 13 20.9996C14.2031 20.9991 15.3939 20.7588 16.503 20.2926C18.1106 19.6125 19.486 18.4799 20.462 17.0326C21.4665 15.5465 22.0022 13.7934 22 11.9996C22.0025 10.7962 21.7617 9.60465 21.292 8.49664Z"
                animatedProps={animatedColorFillSvg}
              />
            </Svg>
          ) : (
            <StaticIcon
              width={24}
              name={nameSVGRight ?? 'arrow-left'}
              size={24}
              color={colorSVGLeft ?? Colors.neutral10}
            />
          )}
        </Pressable>
      )}
    </Animated.View>
  );
});

// ── Main export: pilih static atau animated ───────────────────────
const HeaderBack: React.FC<HeaderBackProps> = (props) => {
  if (props.animated) {
    return <AnimatedHeader {...props} />;
  }
  return <StaticHeader {...props} />;
};

export default HeaderBack;