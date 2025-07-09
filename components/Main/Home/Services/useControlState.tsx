// hooks/useControlState.ts - Selective MQTT Processing
import {useState, useRef, useCallback, useEffect, useMemo} from 'react';
import {AppState, AppStateStatus} from 'react-native';

interface ControlState {
  isWaterOn: boolean;
  isFertilizerOn: boolean;
  remainingWaterTime: number;
  remainingFertTime: number;
  lastWaterAction: Date | null;
  lastFertAction: Date | null;
  waterStart: number | null;
  waterDuration: number;
  fertStart: number | null;
  fertDuration: number;
}

interface UseControlStateProps {
  topicPrefix: string;
  publish: (topic: string, payload: object) => void;
  pageId: string;
  isActive?: boolean;
}

export function useControlState({topicPrefix, publish, pageId, isActive = true}: UseControlStateProps) {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const isActiveRef = useRef<boolean>(isActive);
  
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);
  
  const [state, setState] = useState<ControlState>({
    isWaterOn: false,
    isFertilizerOn: false,
    remainingWaterTime: 0,
    remainingFertTime: 0,
    lastWaterAction: null,
    lastFertAction: null,
    waterStart: null,
    waterDuration: 0,
    fertStart: null,
    fertDuration: 0,
  });

  const timerRefWater = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRefFert = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdatesRef = useRef<Partial<ControlState>>({});

  // MODIFIED: Allow state updates for critical messages even when inactive
  const updateState = useCallback((updates: Partial<ControlState>, forceUpdate = false) => {
    if (!forceUpdate && !isActiveRef.current) return;

    Object.assign(pendingUpdatesRef.current, updates);
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      const updates = pendingUpdatesRef.current;
      pendingUpdatesRef.current = {};
      
      setState(prev => ({ ...prev, ...updates }));
    }, 16);
  }, []);

  const clearWaterTimer = useCallback(() => {
    if (timerRefWater.current) {
      clearInterval(timerRefWater.current);
      timerRefWater.current = null;
    }
  }, []);

  const clearFertTimer = useCallback(() => {
    if (timerRefFert.current) {
      clearInterval(timerRefFert.current);
      timerRefFert.current = null;
    }
  }, []);

  const completeWaterProcess = useCallback(() => {
    clearWaterTimer();
    
    updateState({
      isWaterOn: false,
      remainingWaterTime: 0,
      waterStart: null,
      waterDuration: 0,
      lastWaterAction: new Date(),
    }, true); // Force update even if inactive

    const timestamp = new Date().toISOString();
    const nowTs = Date.now();
    
    // setTimeout(() => {
    //   publish(`control/water${topicPrefix}`, {valve_status: 'close', duration: 0});
    //   publish(`time/water${topicPrefix}`, {timestamp});
    //   publish(`start/water${topicPrefix}`, {startTimestamp: nowTs, duration: 0});
    // }, 0);

  }, [clearWaterTimer, updateState, publish, topicPrefix]);

  const completeFertProcess = useCallback(() => {
    clearFertTimer();
    
    updateState({
      isFertilizerOn: false,
      remainingFertTime: 0,
      fertStart: null,
      fertDuration: 0,
      lastFertAction: new Date(),
    }, true); // Force update even if inactive

    const timestamp = new Date().toISOString();
    const nowTs = Date.now();
    
    // setTimeout(() => {
    //   publish(`control/fertilizer${topicPrefix}`, {valve_status: 'close', duration: 0});
    //   publish(`time/fertilizer${topicPrefix}`, {timestamp});
    //   publish(`start/fertilizer${topicPrefix}`, {startTimestamp: nowTs, duration: 0});
    // }, 0);

  }, [clearFertTimer, updateState, publish, topicPrefix]);

  const startWaterTimer = useCallback((duration: number) => {
    clearWaterTimer();
    
    if (!isActiveRef.current) return;
    
    let remaining = duration;
    
    timerRefWater.current = setInterval(() => {
      if (!isActiveRef.current) {
        clearWaterTimer();
        return;
      }
      
      remaining -= 1;
      
      if (remaining <= 0) {
        completeWaterProcess();
        return;
      }
      
      updateState({ remainingWaterTime: remaining });
    }, 1000);
  }, [clearWaterTimer, completeWaterProcess, updateState]);

  const startFertTimer = useCallback((duration: number) => {
    clearFertTimer();
    
    if (!isActiveRef.current) return;
    
    let remaining = duration;
    
    timerRefFert.current = setInterval(() => {
      if (!isActiveRef.current) {
        clearFertTimer();
        return;
      }
      
      remaining -= 1;
      
      if (remaining <= 0) {
        completeFertProcess();
        return;
      }
      
      updateState({ remainingFertTime: remaining });
    }, 1000);
  }, [clearFertTimer, completeFertProcess, updateState]);

  useEffect(() => {
    if (!isActive) {
      console.log(`[${pageId}] Page inactive - stopping UI updates`);
    } else {
      console.log(`[${pageId}] Page active - resuming UI updates`);
      
      const currentTime = Date.now();
      
      if (state.waterStart && state.waterDuration > 0) {
        const elapsed = Math.floor((currentTime - state.waterStart) / 1000);
        const remaining = Math.max(state.waterDuration - elapsed, 0);
        
        if (remaining > 0) {
          updateState({ 
            remainingWaterTime: remaining,
            isWaterOn: true 
          });
          startWaterTimer(remaining);
        } else {
          completeWaterProcess();
        }
      }
      
      if (state.fertStart && state.fertDuration > 0) {
        const elapsed = Math.floor((currentTime - state.fertStart) / 1000);
        const remaining = Math.max(state.fertDuration - elapsed, 0);
        
        if (remaining > 0) {
          updateState({ 
            remainingFertTime: remaining,
            isFertilizerOn: true 
          });
          startFertTimer(remaining);
        } else {
          completeFertProcess();
        }
      }
    }
  }, [isActive, state.waterStart, state.waterDuration, state.fertStart, state.fertDuration, 
      updateState, startWaterTimer, startFertTimer, completeWaterProcess, completeFertProcess, pageId]);

  const topicPatterns = useMemo(() => ({
    waterControl: `control/water${topicPrefix}`,
    fertilizerControl: `control/fertilizer${topicPrefix}`,
    waterTime: `time/water${topicPrefix}`,
    fertilizerTime: `time/fertilizer${topicPrefix}`,
    waterStart: `start/water${topicPrefix}`,
    fertilizerStart: `start/fertilizer${topicPrefix}`,
  }), [topicPrefix]);

  const pendingMessagesRef = useRef<Map<string, any>>(new Map());
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // MODIFIED: Critical messages always processed, others only when active
  const isCriticalMessage = (topic: string): boolean => {
    return topic === topicPatterns.waterControl ||
           topic === topicPatterns.fertilizerControl ||
           topic === topicPatterns.waterStart ||
           topic === topicPatterns.fertilizerStart ||
           topic === topicPatterns.waterTime ||
           topic === topicPatterns.fertilizerTime;
  };

  const processPendingMessages = useCallback(() => {
    if (pendingMessagesRef.current.size === 0) return;
    
    const messages = new Map(pendingMessagesRef.current);
    pendingMessagesRef.current.clear();
    
    const stateUpdates: Partial<ControlState> = {};
    
    messages.forEach((payload, topic) => {
      try {
        // Skip non-critical messages if page is inactive
        if (!isActiveRef.current && !isCriticalMessage(topic)) {
          console.log(`[${pageId}] Skipping non-critical message while inactive:`, topic);
          return;
        }

        const forceUpdate = isCriticalMessage(topic);

        if (topic === topicPatterns.waterControl) {
          const isOpen = payload.valve_status === 'open';
          stateUpdates.isWaterOn = isOpen;
          
          if (!isOpen && state.remainingWaterTime > 0) {
            clearWaterTimer();
            Object.assign(stateUpdates, {
              remainingWaterTime: 0,
              waterStart: null,
              waterDuration: 0
            });
          }
        }

        if (topic === topicPatterns.fertilizerControl) {
          const isOpen = payload.valve_status === 'open';
          stateUpdates.isFertilizerOn = isOpen;
          
          if (!isOpen && state.remainingFertTime > 0) {
            clearFertTimer();
            Object.assign(stateUpdates, {
              remainingFertTime: 0,
              fertStart: null,
              fertDuration: 0
            });
          }
        }

        if (topic === topicPatterns.waterTime && payload.timestamp) {
          try {
            stateUpdates.lastWaterAction = new Date(payload.timestamp);
          } catch (error) {
            console.warn('Invalid water timestamp:', payload.timestamp);
          }
        }

        if (topic === topicPatterns.fertilizerTime && payload.timestamp) {
          try {
            stateUpdates.lastFertAction = new Date(payload.timestamp);
          } catch (error) {
            console.warn('Invalid fertilizer timestamp:', payload.timestamp);
          }
        }

        if (topic === topicPatterns.waterStart) {
          const {startTimestamp, duration} = payload;
          const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
          const remaining = Math.max(duration - elapsed, 0);

          if (remaining > 0) {
            Object.assign(stateUpdates, {
              waterStart: startTimestamp,
              waterDuration: duration,
              remainingWaterTime: remaining,
              isWaterOn: true
            });
            
            // Only start timer if active
            if (isActiveRef.current) {
              setTimeout(() => startWaterTimer(remaining), 0);
            }
          }
        }

        if (topic === topicPatterns.fertilizerStart) {
          const {startTimestamp, duration} = payload;
          const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
          const remaining = Math.max(duration - elapsed, 0);

          if (remaining > 0) {
            Object.assign(stateUpdates, {
              fertStart: startTimestamp,
              fertDuration: duration,
              remainingFertTime: remaining,
              isFertilizerOn: true
            });
            
            // Only start timer if active
            if (isActiveRef.current) {
              setTimeout(() => startFertTimer(remaining), 0);
            }
          }
        }
      } catch (error) {
        console.error('Error processing message:', topic, error);
      }
    });
    
    // Apply updates with force flag for critical messages
    if (Object.keys(stateUpdates).length > 0) {
      const hasCriticalUpdates = messages.size > 0 && 
        Array.from(messages.keys()).some(topic => isCriticalMessage(topic));
      
      updateState(stateUpdates, hasCriticalUpdates);
    }
  }, [topicPatterns, clearWaterTimer, clearFertTimer, startWaterTimer, startFertTimer, 
      updateState, state, pageId]);

  const handleMqttMessage = useCallback((topic: string, payload: any) => {
    pendingMessagesRef.current.set(topic, payload);
    
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    
    messageTimeoutRef.current = setTimeout(processPendingMessages, 100);
  }, [processPendingMessages]);

  const startProcess = useCallback((type: 'water' | 'fertilizer', totalDurationInSeconds: number) => {
    const startTimestamp = Date.now();
  
    if (type === 'water') {
      updateState({
        waterStart: startTimestamp,
        waterDuration: totalDurationInSeconds,
        remainingWaterTime: totalDurationInSeconds,
        isWaterOn: true,
      });
      
      if (isActiveRef.current) {
        startWaterTimer(totalDurationInSeconds);
      }
    } else {
      updateState({
        fertStart: startTimestamp,
        fertDuration: totalDurationInSeconds,
        remainingFertTime: totalDurationInSeconds,
        isFertilizerOn: true,
      });
      
      if (isActiveRef.current) {
        startFertTimer(totalDurationInSeconds);
      }
    }
  
    setTimeout(() => {
      const topic = `control/${type}${topicPrefix}`;
      const startTopic = `start/${type}${topicPrefix}`;
      
      publish(topic, {valve_status: 'open', duration: totalDurationInSeconds}); // Mengirim total durasi dalam detik
      publish(startTopic, {startTimestamp, duration: totalDurationInSeconds}); // Mengirim total durasi dalam detik
    }, 0);
  }, [topicPrefix, publish, startWaterTimer, startFertTimer, updateState]);
  

  const stopProcess = useCallback((type: 'water' | 'fertilizer') => {
    const nowTs = Date.now();
    const timestamp = new Date().toISOString();
    
    if (type === 'water') {
      clearWaterTimer();
      updateState({
        remainingWaterTime: 0,
        isWaterOn: false,
        waterStart: null,
        waterDuration: 0,
        lastWaterAction: new Date(),
      }, true); // Force update
      
      setTimeout(() => {
        publish(`control/water${topicPrefix}`, {valve_status: 'close', duration: 0});
        publish(`time/water${topicPrefix}`, {timestamp});
        publish(`start/water${topicPrefix}`, {startTimestamp: nowTs, duration: 0});
      }, 0);
    } else {
      clearFertTimer();
      updateState({
        remainingFertTime: 0,
        isFertilizerOn: false,
        fertStart: null,
        fertDuration: 0,
        lastFertAction: new Date(),
      }, true); // Force update
      
      setTimeout(() => {
        publish(`control/fertilizer${topicPrefix}`, {valve_status: 'close', duration: 0});
        publish(`time/fertilizer${topicPrefix}`, {timestamp});
        publish(`start/fertilizer${topicPrefix}`, {startTimestamp: nowTs, duration: 0});
      }, 0);
    }

  }, [topicPrefix, publish, clearWaterTimer, clearFertTimer, updateState]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      appState.current = nextState;
      
      if (nextState === 'active' && isActiveRef.current) {
        const currentTime = Date.now();
        const updates: Partial<ControlState> = {};
        
        if (state.waterStart && state.waterDuration > 0) {
          const elapsed = Math.floor((currentTime - state.waterStart) / 1000);
          const remaining = Math.max(state.waterDuration - elapsed, 0);

          if (remaining > 0) {
            updates.remainingWaterTime = remaining;
            updates.isWaterOn = true;
            setTimeout(() => startWaterTimer(remaining), 100);
          } else {
            setTimeout(completeWaterProcess, 100);
          }
        }

        if (state.fertStart && state.fertDuration > 0) {
          const elapsed = Math.floor((currentTime - state.fertStart) / 1000);
          const remaining = Math.max(state.fertDuration - elapsed, 0);

          if (remaining > 0) {
            updates.remainingFertTime = remaining;
            updates.isFertilizerOn = true;
            setTimeout(() => startFertTimer(remaining), 100);
          } else {
            setTimeout(completeFertProcess, 100);
          }
        }
        
        if (Object.keys(updates).length > 0) {
          updateState(updates);
        }
      }
    });

    return () => subscription.remove();
  }, [startWaterTimer, startFertTimer, completeWaterProcess, completeFertProcess, updateState, state]);

  useEffect(() => {
    return () => {
      clearWaterTimer();
      clearFertTimer();
      
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      pendingMessagesRef.current.clear();
    };
  }, [clearWaterTimer, clearFertTimer]);

  return {
    ...state,
    handleMqttMessage,
    startProcess,
    stopProcess,
  };
}