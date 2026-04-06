import {useState, useCallback, useRef} from 'react';

export type FertilizerType = 'soil' | 'leaf';
export type Phase = 'idle' | 'preparation' | 'running' | 'done';

export interface Block01ControlState {
  phase: Phase;
  fertilizerType: FertilizerType | null;
  remainingTime: number;
  tankLevel: number;
  isFertilizerOn: boolean;
  startPreparation: () => void;
  startFertilizer: (type: FertilizerType, durationSeconds: number) => void;
  stopFertilizer: () => void;
  handleMqttMessage: (topic: string, payload: any) => void;
}

export const useBlock01Control = ({
  publish,
}: {
  publish: (topic: string, payload: object) => void;
}): Block01ControlState => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [fertilizerType, setFertilizerType] = useState<FertilizerType | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [tankLevel, setTankLevel] = useState(100);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<Phase>('idle');
  const restoredRef = useRef<boolean>(false);

  const setPhaseSync = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(
    (seconds: number) => {
      clearTimer();
      setRemainingTime(seconds);
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            finishFertilizer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearTimer],
  );

  const finishFertilizer = useCallback(() => {
    clearTimer();
    setPhaseSync('done');
    setRemainingTime(0);
    setFertilizerType(null);
    restoredRef.current = false;

    publish('control/fertilizer/blok01/pupuktanah', {status: 'stop'});
    publish('control/fertilizer/blok01/pupukdaun', {status: 'stop'});

    publish('start/fertilizer/blok01/pupuktanah', {status: 'done'});
    publish('start/fertilizer/blok01/pupukdaun', {status: 'done'});

    publish('control/fertilizer/blok01', {status: 'done'});

    setTimeout(() => {
      setPhaseSync('idle');
    }, 3000);
  }, [clearTimer, publish, setPhaseSync]);

  const startPreparation = useCallback(() => {
    setPhaseSync('preparation');
    publish('control/fertilizer/blok01', {status: 'preparation'});
  }, [publish, setPhaseSync]);

  const startFertilizer = useCallback(
    (type: FertilizerType, durationSeconds: number) => {
      clearTimer();
      setPhaseSync('running');
      setFertilizerType(type);
      restoredRef.current = false;

      const topic =
        type === 'soil'
          ? 'start/fertilizer/blok01/pupuktanah'
          : 'start/fertilizer/blok01/pupukdaun';

      publish(topic, {
        duration: durationSeconds,
        status: 'start',
        startedAt: Date.now(),
      });

      startCountdown(durationSeconds);
    },
    [clearTimer, publish, setPhaseSync, startCountdown],
  );

  const stopFertilizer = useCallback(() => {
    const topic =
      fertilizerType === 'soil'
        ? 'control/fertilizer/blok01/pupuktanah'
        : 'control/fertilizer/blok01/pupukdaun';
    publish(topic, {status: 'stop'});
    finishFertilizer();
  }, [fertilizerType, finishFertilizer, publish]);

  const handleMqttMessage = useCallback(
    (topic: string, payload: any) => {

      if (
        topic === 'start/fertilizer/blok01/pupuktanah' ||
        topic === 'start/fertilizer/blok01/pupukdaun'
      ) {
        if (!payload || payload === '' || Object.keys(payload).length === 0) return;

        const status = payload?.status;

        if (status === 'done' || status === 'stop') return;

        const duration = payload?.duration;
        const startedAtRaw = payload?.startedAt;
        const startedAt = Number(startedAtRaw);
        const type: FertilizerType = topic.includes('pupuktanah') ? 'soil' : 'leaf';

        if (status === 'start' && duration && startedAt && !isNaN(startedAt)) {
          const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
          const remaining = duration - elapsedSeconds;

          if (remaining > 0 && !restoredRef.current && phaseRef.current !== 'running') {
            restoredRef.current = true;
            setFertilizerType(type);
            setPhaseSync('running');
            startCountdown(remaining);
            console.log('[Block01] Restored — sisa: ' + remaining + 's');
          } else if (remaining <= 0) {
            publish('start/fertilizer/blok01/pupuktanah', {status: 'done'});
            publish('start/fertilizer/blok01/pupukdaun', {status: 'done'});
            publish('control/fertilizer/blok01', {status: 'done'});
            setPhaseSync('idle');
          }
        }
        return;
      }

      if (topic === 'control/fertilizer/blok01') {
        if (!payload || payload === '') return;
        const status = payload?.status;

        if (status === 'done') {
          if (phaseRef.current === 'running' || phaseRef.current === 'done') {
            setPhaseSync('idle');
          }
          return;
        }

        if (status === 'preparation' && phaseRef.current === 'idle') {
          setPhaseSync('preparation');
        }

        if (status === 'done' && phaseRef.current !== 'idle') {
          setPhaseSync('idle');
        }
        return;
      }

      if (topic.includes('TANK-001/telemetry')) {
        const level = payload?.level_pct ?? 100;
        setTankLevel(level);
        if (level === 0 && phaseRef.current === 'running') {
          finishFertilizer();
        }
        return;
      }

      if (topic.includes('TANK-001/event')) {
        if (payload?.event === 'fertilizer_done') {
          finishFertilizer();
        }
        return;
      }
    },
    [finishFertilizer, setPhaseSync, startCountdown, publish],
  );

  return {
    phase,
    fertilizerType,
    remainingTime,
    tankLevel,
    isFertilizerOn: phase === 'running',
    startPreparation,
    startFertilizer,
    stopFertilizer,
    handleMqttMessage,
  };
};