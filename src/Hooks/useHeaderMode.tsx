import {useState, useCallback, useRef} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {useAnimatedScrollHandler, useSharedValue} from 'react-native-reanimated';

export const useHeaderMode = (initialMode: string = 'top') => {
  const [headMode, setHeadMode] = useState(initialMode);
  const currentModeRef = useRef(initialMode);
  const scrollY = useSharedValue(0);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newMode = e.nativeEvent.contentOffset.y <= 0 ? 'top' : 'normal';
      if (currentModeRef.current === newMode) return; // ← guard pakai ref, tidak perlu deps
      currentModeRef.current = newMode;
      setHeadMode(newMode);
    },
    [], // ← empty deps, aman karena pakai ref
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: e => {
      scrollY.value = e.contentOffset.y;
    },
  });

  return {headMode, handleScroll, onScroll, scrollY};
};