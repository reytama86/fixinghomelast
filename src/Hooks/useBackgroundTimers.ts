import { useEffect, useRef } from 'react';
import BackgroundService from 'react-native-background-actions';
import { useMqtt } from '../components/Main/Home/Services/UseMqtt';

type ProcessType = 'water' | 'fertilizer';

const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time));

export function useBackgroundTimers(
  waterStart: number | null,
  waterDuration: number,
  fertStart: number | null,
  fertDuration: number
) {
  const { publish } = useMqtt();
  const timersRef = useRef<{
    waterRemaining: number;
    fertRemaining: number;
  }>({ waterRemaining: 0, fertRemaining: 0 });

  useEffect(() => {
    const task = async () => {
      timersRef.current.waterRemaining = waterStart
        ? Math.max(waterDuration - Math.floor((Date.now() - waterStart) / 1000), 0)
        : 0;
      timersRef.current.fertRemaining = fertStart
        ? Math.max(fertDuration - Math.floor((Date.now() - fertStart) / 1000), 0)
        : 0;

      while (BackgroundService.isRunning()) {
        if (timersRef.current.waterRemaining > 0) {
          timersRef.current.waterRemaining -= 1;
          if (timersRef.current.waterRemaining === 0) {
            publish('control/water', { valve_status: 'close', duration: 0 });
            publish('time/water', { timestamp: new Date().toISOString() });
          }
        }
        if (timersRef.current.fertRemaining > 0) {
          timersRef.current.fertRemaining -= 1;
          if (timersRef.current.fertRemaining === 0) {
            publish('control/fertilizer', { valve_status: 'close', duration: 0 });
            publish('time/fertilizer', { timestamp: new Date().toISOString() });
          }
        }
        await sleep(1000);
      }
    };

    const options = {
      taskName: 'IrrigationTimers',
      taskTitle: 'Vanili Garden Running',
      taskDesc: 'Monitoring water and fertilizer timers',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap'
      },
      parameters: {},
      linkingURI: 'vanili_jaya://home',
      allowWhileIdle: true,
    };

    BackgroundService.start(task, options).catch(console.error);

    return () => {
      BackgroundService.stop();
    };
  }, []);
}
