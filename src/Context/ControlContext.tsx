import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMqtt } from '../Hooks/UseMqtt';
import { useControlState } from '../Hooks/useControlState';
import { useScheduleState } from '../Hooks/useScheduleState';
import * as Paho from 'paho-mqtt';
import { Block01ControlState, useBlock01Control } from '@Hooks/useBlock01Control';

const TOPIC_CONFIG = {
  HOME_PREFIX: '1106200396',
  BLOCK01_FERTILIZER_PREFIX: '/blok01',
  BLOCK4_PREFIX: '/block04',
  BLOCK3_PREFIX: '/block03',
  BLOCK2_PREFIX: '/block02',
  PORTABLE_PREFIX: 'data/portable',
} as const;

const ALL_TOPICS = [
  // Home
  `control/water${TOPIC_CONFIG.HOME_PREFIX}`,
  `control/fertilizer${TOPIC_CONFIG.HOME_PREFIX}`,
  `time/water${TOPIC_CONFIG.HOME_PREFIX}`,
  `time/fertilizer${TOPIC_CONFIG.HOME_PREFIX}`,
  `start/water${TOPIC_CONFIG.HOME_PREFIX}`,
  `start/fertilizer${TOPIC_CONFIG.HOME_PREFIX}`,

  // Block 4
  `control/water${TOPIC_CONFIG.BLOCK4_PREFIX}`,
  `time/water${TOPIC_CONFIG.BLOCK4_PREFIX}`,
  `start/water${TOPIC_CONFIG.BLOCK4_PREFIX}`,
  `schedule/water${TOPIC_CONFIG.BLOCK4_PREFIX}/status`,

  // Block 3
  `control/water${TOPIC_CONFIG.BLOCK3_PREFIX}`,
  `time/water${TOPIC_CONFIG.BLOCK3_PREFIX}`,
  `start/water${TOPIC_CONFIG.BLOCK3_PREFIX}`,
  `schedule/water${TOPIC_CONFIG.BLOCK3_PREFIX}/status`,

  // Block 2
  `control/water${TOPIC_CONFIG.BLOCK2_PREFIX}`,
  `time/water${TOPIC_CONFIG.BLOCK2_PREFIX}`,
  `start/water${TOPIC_CONFIG.BLOCK2_PREFIX}`,
  `schedule/water${TOPIC_CONFIG.BLOCK2_PREFIX}/status`,

  // Block01 Fertilizer topics (tidak diubah)
  `control/fertilizer${TOPIC_CONFIG.BLOCK01_FERTILIZER_PREFIX}`,
  `start/fertilizer/blok01/pupuktanah`,
  `start/fertilizer/blok01/pupukdaun`,
  `control/fertilizer/blok01/pupuktanah`,
  `control/fertilizer/blok01/pupukdaun`,
  `water/tank/TANK-001/event`,
  `water/tank/TANK-001/telemetry`,

  // Portable topics
  `${TOPIC_CONFIG.PORTABLE_PREFIX}/+`,
] as const;

// Context value shape
type ControlContextValue = {
  isConnected: boolean;
  publish: (topic: string, payload: object) => void;
  setActivePage: (pageId: string) => void;
  getCurrentPage: () => string;
  homeControl: ReturnType<typeof useControlState>;
  block4Control: ReturnType<typeof useControlState>;
  block3Control: ReturnType<typeof useControlState>;
  block2Control: ReturnType<typeof useControlState>;
  block4Schedule: ReturnType<typeof useScheduleState>;
  block3Schedule: ReturnType<typeof useScheduleState>;
  block2Schedule: ReturnType<typeof useScheduleState>;
  portableData: ReturnType<typeof useControlState>;
  block01Control: Block01ControlState;
};

const ControlContext = createContext<ControlContextValue | undefined>(
  undefined,
);

interface ControlProviderProps {
  children: ReactNode;
}

export const ControlProvider: React.FC<ControlProviderProps> = ({children}) => {
  const {isConnected, publish, client, setMessageHandler, clearMessageHandler} =
    useMqtt();

  const [currentPage, setCurrentPage] = useState<string>('home');
  const subscriptionsInitialized = useRef<boolean>(false);
  const messageQueueRef = useRef<Map<string, any>>(new Map());
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const stablePublish = useCallback(
    (topic: string, payload: object) => {
      if (isConnected) publish(topic, payload);
    },
    [publish, isConnected],
  );

  const setActivePage = useCallback((pageId: string) => {
    setCurrentPage(prev => (prev !== pageId ? pageId : prev));
  }, []);

  const getCurrentPage = useCallback(() => currentPage, [currentPage]);

  // Create control instances
  const homeControl = useControlState({
    topicPrefix: TOPIC_CONFIG.HOME_PREFIX,
    publish: stablePublish,
    pageId: 'home',
    isActive: currentPage === 'home',
  });

  const block4Control = useControlState({
    topicPrefix: TOPIC_CONFIG.BLOCK4_PREFIX,
    publish: stablePublish,
    pageId: 'block4',
    isActive: currentPage === 'block4',
  });

  const block3Control = useControlState({
    topicPrefix: TOPIC_CONFIG.BLOCK3_PREFIX,
    publish: stablePublish,
    pageId: 'block3',
    isActive: currentPage === 'block3',
  });

  const block2Control = useControlState({
    topicPrefix: TOPIC_CONFIG.BLOCK2_PREFIX,
    publish: stablePublish,
    pageId: 'block2',
    isActive: currentPage === 'block2',
  });

  // Schedule instances — satu per block yang punya relay (4, 3, 2)
  const block4Schedule = useScheduleState({
    topicPrefix: TOPIC_CONFIG.BLOCK4_PREFIX,
    publish: stablePublish,
  });

  const block3Schedule = useScheduleState({
    topicPrefix: TOPIC_CONFIG.BLOCK3_PREFIX,
    publish: stablePublish,
  });

  const block2Schedule = useScheduleState({
    topicPrefix: TOPIC_CONFIG.BLOCK2_PREFIX,
    publish: stablePublish,
  });

  const block01Control = useBlock01Control({
    publish: stablePublish,
  });

  const portableData = useControlState({
    topicPrefix: TOPIC_CONFIG.PORTABLE_PREFIX,
    publish: stablePublish,
    pageId: 'portable',
    isActive: currentPage === 'portable',
  });

  const routeMessage = useCallback(
    (topic: string, payload: any) => {
      if (topic.includes(TOPIC_CONFIG.HOME_PREFIX)) {
        homeControl.handleMqttMessage(topic, payload);
        return;
      }

      if (topic.includes(TOPIC_CONFIG.BLOCK4_PREFIX)) {
        block4Control.handleMqttMessage(topic, payload);
        block4Schedule.handleMqttMessage(topic, payload);
        return;
      }

      if (topic.includes(TOPIC_CONFIG.BLOCK3_PREFIX)) {
        block3Control.handleMqttMessage(topic, payload);
        block3Schedule.handleMqttMessage(topic, payload);
        return;
      }

      if (topic.includes(TOPIC_CONFIG.BLOCK2_PREFIX)) {
        block2Control.handleMqttMessage(topic, payload);
        block2Schedule.handleMqttMessage(topic, payload);
        return;
      }

      if (topic.includes(TOPIC_CONFIG.PORTABLE_PREFIX)) {
        portableData.handleMqttMessage(topic, payload);
        return;
      }

      if (topic.includes('TANK-001') || topic.includes('blok01')) {
        block01Control.handleMqttMessage(topic, payload);
      }
    },
    [
      homeControl,
      block4Control,
      block3Control,
      block2Control,
      block4Schedule,
      block3Schedule,
      block2Schedule,
      portableData,
      block01Control,
    ],
  );

  const processQueue = useCallback(() => {
    messageQueueRef.current.forEach((payload, topic) =>
      routeMessage(topic, payload),
    );
    messageQueueRef.current.clear();
  }, [routeMessage]);

  const handleMqttMessage = useCallback(
    (message: Paho.Message) => {
      let payload: any;
      try {
        payload = JSON.parse(message.payloadString);
      } catch {
        payload = message.payloadString;
      }
      messageQueueRef.current.set(message.destinationName, payload);
      if (processingTimeoutRef.current)
        clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = setTimeout(processQueue, 50);
    },
    [processQueue],
  );

  const initializeSubscriptions = useCallback(() => {
    if (!client || !isConnected || subscriptionsInitialized.current) return;
    ALL_TOPICS.forEach(topic => client.subscribe(topic));
    subscriptionsInitialized.current = true;
  }, [client, isConnected]);

  useEffect(() => {
    if (isConnected && client) {
      setMessageHandler(handleMqttMessage);
      initializeSubscriptions();
    } else {
      clearMessageHandler();
      subscriptionsInitialized.current = false;
    }
    return () => clearMessageHandler();
  }, [
    isConnected,
    client,
    setMessageHandler,
    clearMessageHandler,
    handleMqttMessage,
    initializeSubscriptions,
  ]);

  useEffect(
    () => () => {
      if (processingTimeoutRef.current)
        clearTimeout(processingTimeoutRef.current);
      messageQueueRef.current.clear();
      subscriptionsInitialized.current = false;
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      isConnected,
      publish: stablePublish,
      setActivePage,
      getCurrentPage,
      homeControl,
      block4Control,
      block3Control,
      block2Control,
      block4Schedule,
      block3Schedule,
      block2Schedule,
      portableData,
      block01Control,
    }),
    [
      isConnected,
      stablePublish,
      setActivePage,
      getCurrentPage,
      homeControl,
      block4Control,
      block3Control,
      block2Control,
      block4Schedule,
      block3Schedule,
      block2Schedule,
      portableData,
      block01Control,
    ],
  );

  return (
    <ControlContext.Provider value={contextValue}>
      {children}
    </ControlContext.Provider>
  );
};

export const useControl = (): ControlContextValue => {
  const context = useContext(ControlContext);
  if (!context)
    throw new Error('useControl must be used within a ControlProvider');
  return context;
};

export const usePageControl = () => {
  const {setActivePage, getCurrentPage} = useControl();
  return {setActivePage, getCurrentPage};
};

export default ControlContext;