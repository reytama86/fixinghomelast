import {useState, useCallback, useRef} from 'react';

export interface ScheduleState {
  enabled: boolean;
  dayOfMonth: number;
  hour: number;
  minute: number;
  durationSec: number;
}

interface UseScheduleStateProps {
  /** contoh: '/block04' */
  topicPrefix: string;
  publish: (topic: string, payload: object) => void;
}

export interface ScheduleConfigInput {
  dayOfMonth: number;
  hour: number;
  minute: number;
  durationSec: number;
}

const DEFAULT_SCHEDULE: ScheduleState = {
  enabled: false,
  dayOfMonth: 15,
  hour: 15,
  minute: 0,
  durationSec: 3600,
};

export function useScheduleState({topicPrefix, publish}: UseScheduleStateProps) {
  const [schedule, setSchedule] = useState<ScheduleState>(DEFAULT_SCHEDULE);

  const topics = useRef({
    set: `schedule/water${topicPrefix}/set`,
    status: `schedule/water${topicPrefix}/status`,
  }).current;

  const handleMqttMessage = useCallback(
    (topic: string, payload: any) => {
      if (topic !== topics.status) return;

      setSchedule({
        enabled: !!payload.enabled,
        dayOfMonth: payload.day_of_month ?? DEFAULT_SCHEDULE.dayOfMonth,
        hour: payload.hour ?? DEFAULT_SCHEDULE.hour,
        minute: payload.minute ?? DEFAULT_SCHEDULE.minute,
        durationSec: payload.duration ?? DEFAULT_SCHEDULE.durationSec,
      });
    },
    [topics.status],
  );

  const setScheduleConfig = useCallback(
    (config: ScheduleConfigInput) => {
      publish(topics.set, {
        action: 'set',
        day_of_month: config.dayOfMonth,
        hour: config.hour,
        minute: config.minute,
        duration: config.durationSec,
      });

      // optimistic update, nanti akan dikoreksi oleh pesan /status dari device
      setSchedule({...config, enabled: true});
    },
    [publish, topics.set],
  );

  const deleteSchedule = useCallback(() => {
    publish(topics.set, {action: 'delete'});
    setSchedule(prev => ({...prev, enabled: false}));
  }, [publish, topics.set]);

  return {
    schedule,
    handleMqttMessage,
    setScheduleConfig,
    deleteSchedule,
    topics,
  };
}