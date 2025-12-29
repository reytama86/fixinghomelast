import {useState} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

export const useHeaderMode = (initialMode: string = 'top') => {
  const [headMode, setHeadMode] = useState(initialMode);

  const scrollY = useSharedValue(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (e.nativeEvent.contentOffset.y <= 0) {
      setHeadMode('top');
    } else {
      setHeadMode('normal');
    }
  };

  const onScroll = useAnimatedScrollHandler({
    onScroll: e => {
      scrollY.value = e.contentOffset.y;
    },
  });

  return {headMode, handleScroll, onScroll, scrollY};
};
