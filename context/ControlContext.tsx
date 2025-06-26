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
import {useMqtt} from '../components/Main/Home/Services/UseMqtt';
import {useControlState} from '../components/Main/Home/Services/useControlState';
import * as Paho from 'paho-mqtt';

// Define topic prefixes as constants
const TOPIC_CONFIG = {
  HOME_PREFIX: '1106200396',
  BLOCK1_PREFIX: '/blok1',
  BLOCK1_ROWWATER1_PREFIX: '/blok1/baris1air',
  BLOCK1_ROWWATER2_PREFIX: '/blok1/baris2air',
  BLOCK1_ROWFERTILIZER1_PREFIX: '/blok1/baris1pupuk',
  BLOCK1_ROWFERTILIZER2_PREFIX: '/blok1/baris2pupuk',
  BLOCK2_PREFIX: '/blok2',
  PORTABLE_PREFIX: 'data/portable',
} as const;

// ALL TOPICS - Subscribe once, route dynamically
const ALL_TOPICS = [
  // Home topics
  `control/water${TOPIC_CONFIG.HOME_PREFIX}`,
  `control/fertilizer${TOPIC_CONFIG.HOME_PREFIX}`,
  `time/water${TOPIC_CONFIG.HOME_PREFIX}`,
  `time/fertilizer${TOPIC_CONFIG.HOME_PREFIX}`,
  `start/water${TOPIC_CONFIG.HOME_PREFIX}`,
  `start/fertilizer${TOPIC_CONFIG.HOME_PREFIX}`,

  // Block1 main topics
  `control/water${TOPIC_CONFIG.BLOCK1_PREFIX}`,
  `control/fertilizer${TOPIC_CONFIG.BLOCK1_PREFIX}`,
  `time/water${TOPIC_CONFIG.BLOCK1_PREFIX}`,
  `time/fertilizer${TOPIC_CONFIG.BLOCK1_PREFIX}`,
  `start/water${TOPIC_CONFIG.BLOCK1_PREFIX}`,
  `start/fertilizer${TOPIC_CONFIG.BLOCK1_PREFIX}`,

  // Block1 Row1 Water topics
  `control/water${TOPIC_CONFIG.BLOCK1_ROWWATER1_PREFIX}`,
  `control/fertilizer${TOPIC_CONFIG.BLOCK1_ROWWATER1_PREFIX}`,
  `time/water${TOPIC_CONFIG.BLOCK1_ROWWATER1_PREFIX}`,
  `time/fertilizer${TOPIC_CONFIG.BLOCK1_ROWWATER1_PREFIX}`,
  `start/water${TOPIC_CONFIG.BLOCK1_ROWWATER1_PREFIX}`,
  `start/fertilizer${TOPIC_CONFIG.BLOCK1_ROWWATER1_PREFIX}`,

  // Block1 Row2 Water topics
  `control/water${TOPIC_CONFIG.BLOCK1_ROWWATER2_PREFIX}`,
  `control/fertilizer${TOPIC_CONFIG.BLOCK1_ROWWATER2_PREFIX}`,
  `time/water${TOPIC_CONFIG.BLOCK1_ROWWATER2_PREFIX}`,
  `time/fertilizer${TOPIC_CONFIG.BLOCK1_ROWWATER2_PREFIX}`,
  `start/water${TOPIC_CONFIG.BLOCK1_ROWWATER2_PREFIX}`,
  `start/fertilizer${TOPIC_CONFIG.BLOCK1_ROWWATER2_PREFIX}`,

  // Block1 Row1 Fertilizer topics
  `control/water${TOPIC_CONFIG.BLOCK1_ROWFERTILIZER1_PREFIX}`,
  `control/fertilizer${TOPIC_CONFIG.BLOCK1_ROWFERTILIZER1_PREFIX}`,
  `time/water${TOPIC_CONFIG.BLOCK1_ROWFERTILIZER1_PREFIX}`,
  `time/fertilizer${TOPIC_CONFIG.BLOCK1_ROWFERTILIZER1_PREFIX}`,
  `start/water${TOPIC_CONFIG.BLOCK1_ROWFERTILIZER1_PREFIX}`,
  `start/fertilizer${TOPIC_CONFIG.BLOCK1_ROWFERTILIZER1_PREFIX}`,

  // Block1 Row2 Fertilizer topics
  `control/water${TOPIC_CONFIG.BLOCK1_ROWFERTILIZER2_PREFIX}`,
  `control/fertilizer${TOPIC_CONFIG.BLOCK1_ROWFERTILIZER2_PREFIX}`,
  `time/water${TOPIC_CONFIG.BLOCK1_ROWFERTILIZER2_PREFIX}`,
  `time/fertilizer${TOPIC_CONFIG.BLOCK1_ROWFERTILIZER2_PREFIX}`,
  `start/water${TOPIC_CONFIG.BLOCK1_ROWFERTILIZER2_PREFIX}`,
  `start/fertilizer${TOPIC_CONFIG.BLOCK1_ROWFERTILIZER2_PREFIX}`,

  // Block2 topics
  `control/water${TOPIC_CONFIG.BLOCK2_PREFIX}`,
  `control/fertilizer${TOPIC_CONFIG.BLOCK2_PREFIX}`,
  `time/water${TOPIC_CONFIG.BLOCK2_PREFIX}`,
  `time/fertilizer${TOPIC_CONFIG.BLOCK2_PREFIX}`,
  `start/water${TOPIC_CONFIG.BLOCK2_PREFIX}`,
  `start/fertilizer${TOPIC_CONFIG.BLOCK2_PREFIX}`,

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
  block1Control: ReturnType<typeof useControlState>;
  block1RowWater1Control: ReturnType<typeof useControlState>;
  block1RowWater2Control: ReturnType<typeof useControlState>;
  block1RowFertilizer1Control: ReturnType<typeof useControlState>;
  block1RowFertilizer2Control: ReturnType<typeof useControlState>;
  block2Control: ReturnType<typeof useControlState>;
  portableData: ReturnType<typeof useControlState>;
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

  const block1Control = useControlState({
    topicPrefix: TOPIC_CONFIG.BLOCK1_PREFIX,
    publish: stablePublish,
    pageId: 'block1',
    isActive: currentPage === 'block1',
  });

  const block1RowWater1Control = useControlState({
    topicPrefix: TOPIC_CONFIG.BLOCK1_ROWWATER1_PREFIX,
    publish: stablePublish,
    pageId: 'block1-baris1air',
    isActive: currentPage === 'block1',
  });

  const block1RowWater2Control = useControlState({
    topicPrefix: TOPIC_CONFIG.BLOCK1_ROWWATER2_PREFIX,
    publish: stablePublish,
    pageId: 'block1-baris2air',
    isActive: currentPage === 'block1',
  });

  const block1RowFertilizer1Control = useControlState({
    topicPrefix: TOPIC_CONFIG.BLOCK1_ROWFERTILIZER1_PREFIX,
    publish: stablePublish,
    pageId: 'block1-baris1pupuk',
    isActive: currentPage === 'block1',
  });

  const block1RowFertilizer2Control = useControlState({
    topicPrefix: TOPIC_CONFIG.BLOCK1_ROWFERTILIZER2_PREFIX,
    publish: stablePublish,
    pageId: 'block1-baris2pupuk',
    isActive: currentPage === 'block1',
  });

  const block2Control = useControlState({
    topicPrefix: TOPIC_CONFIG.BLOCK2_PREFIX,
    publish: stablePublish,
    pageId: 'block2',
    isActive: currentPage === 'block2',
  });

  const portableData = useControlState({
    topicPrefix: TOPIC_CONFIG.PORTABLE_PREFIX,
    publish: stablePublish,
    pageId: 'portable',
    isActive: currentPage === 'portable',
  });

  // Routing logic
  const routeMessage = useCallback(
    (topic: string, payload: any) => {
      if (topic.includes(TOPIC_CONFIG.HOME_PREFIX))
        homeControl.handleMqttMessage(topic, payload);
      else if (topic.includes(TOPIC_CONFIG.BLOCK1_ROWWATER1_PREFIX))
        block1RowWater1Control.handleMqttMessage(topic, payload);
      else if (topic.includes(TOPIC_CONFIG.BLOCK1_ROWWATER2_PREFIX))
        block1RowWater2Control.handleMqttMessage(topic, payload);
      else if (topic.includes(TOPIC_CONFIG.BLOCK1_ROWFERTILIZER1_PREFIX))
        block1RowFertilizer1Control.handleMqttMessage(topic, payload);
      else if (topic.includes(TOPIC_CONFIG.BLOCK1_ROWFERTILIZER2_PREFIX))
        block1RowFertilizer2Control.handleMqttMessage(topic, payload);
      else if (topic.includes(TOPIC_CONFIG.BLOCK1_PREFIX))
        block1Control.handleMqttMessage(topic, payload);
      else if (topic.includes(TOPIC_CONFIG.BLOCK2_PREFIX))
        block2Control.handleMqttMessage(topic, payload);
      else if (topic.includes(TOPIC_CONFIG.PORTABLE_PREFIX))
        portableData.handleMqttMessage(topic, payload);
    },
    [
      homeControl,
      block1Control,
      block1RowWater1Control,
      block1RowWater2Control,
      block1RowFertilizer1Control,
      block1RowFertilizer2Control,
      block2Control,
      portableData,
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
      block1Control,
      block1RowWater1Control,
      block1RowWater2Control,
      block1RowFertilizer1Control,
      block1RowFertilizer2Control,
      block2Control,
      portableData,
    }),
    [
      isConnected,
      stablePublish,
      setActivePage,
      getCurrentPage,
      homeControl,
      block1Control,
      block1RowWater1Control,
      block1RowWater2Control,
      block1RowFertilizer1Control,
      block1RowFertilizer2Control,
      block2Control,
      portableData,
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
