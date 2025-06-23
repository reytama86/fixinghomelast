// hooks/useBackgroundTimers.ts
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
      // initialize remaining
      timersRef.current.waterRemaining = waterStart
        ? Math.max(waterDuration - Math.floor((Date.now() - waterStart) / 1000), 0)
        : 0;
      timersRef.current.fertRemaining = fertStart
        ? Math.max(fertDuration - Math.floor((Date.now() - fertStart) / 1000), 0)
        : 0;

      while (BackgroundService.isRunning()) {
        // Water timer
        if (timersRef.current.waterRemaining > 0) {
          timersRef.current.waterRemaining -= 1;
          if (timersRef.current.waterRemaining === 0) {
            // send close commands
            publish('control/water', { valve_status: 'close', duration: 0 });
            publish('time/water', { timestamp: new Date().toISOString() });
          }
        }
        // Fertilizer timer
        if (timersRef.current.fertRemaining > 0) {
          timersRef.current.fertRemaining -= 1;
          if (timersRef.current.fertRemaining === 0) {
            // send close commands
            publish('control/fertilizer', { valve_status: 'close', duration: 0 });
            publish('time/fertilizer', { timestamp: new Date().toISOString() });
          }
        }
        // sleep 1 second
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
      // iOS by default stops after 30s; set this to false to run longer
      allowWhileIdle: true,
    };

    // start background service
    BackgroundService.start(task, options).catch(console.error);

    // stop on unmount
    return () => {
      BackgroundService.stop();
    };
  }, []);
}
