// context/ControlContext.tsx - Optimized Version
import React, { createContext, useContext, ReactNode, useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { useMqtt } from '../components/Main/Home/Services/UseMqtt';
import { useControlState } from '../components/Main/Home/Services/useControlState';
import * as Paho from 'paho-mqtt';

// Define topic prefixes as constants
const TOPIC_CONFIG = {
  HOME_PREFIX: '1106200396',
  BLOCK1_PREFIX: '/blok1',
  BLOCK2_PREFIX: '/blok2',
  PORTABLE_PREFIX: 'data/portable'
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
  
  // Block1 topics
  `control/water${TOPIC_CONFIG.BLOCK1_PREFIX}`,
  `control/fertilizer${TOPIC_CONFIG.BLOCK1_PREFIX}`,
  `time/water${TOPIC_CONFIG.BLOCK1_PREFIX}`,
  `time/fertilizer${TOPIC_CONFIG.BLOCK1_PREFIX}`,
  `start/water${TOPIC_CONFIG.BLOCK1_PREFIX}`,
  `start/fertilizer${TOPIC_CONFIG.BLOCK1_PREFIX}`,
  
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
interface ControlContextValue {
  isConnected: boolean;
  publish: (topic: string, payload: object) => void;
  // Page management - SIMPLIFIED
  setActivePage: (pageId: string) => void;
  getCurrentPage: () => string;
  // Shared control states
  homeControl: ReturnType<typeof useControlState>;
  block1Control: ReturnType<typeof useControlState>;  
  block2Control: ReturnType<typeof useControlState>;
  portableData: ReturnType<typeof useControlState>;
}

const ControlContext = createContext<ControlContextValue | undefined>(undefined);

interface ControlProviderProps {
  children: ReactNode;
}

export const ControlProvider: React.FC<ControlProviderProps> = ({ children }) => {
  const { isConnected, publish, client, setMessageHandler, clearMessageHandler } = useMqtt();
  
  // SIMPLIFIED: Only track current page, no complex active pages set
  const [currentPage, setCurrentPage] = useState<string>('home');
  
  // Track subscriptions - subscribe once, keep forever
  const subscriptionsInitialized = useRef<boolean>(false);
  
  // Message processing optimization
  const messageQueueRef = useRef<Map<string, any>>(new Map());
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // STABLE publish function
  const stablePublish = useCallback((topic: string, payload: object) => {
    if (isConnected) {
      publish(topic, payload);
    }
  }, [publish, isConnected]);

  // Page management - SIMPLIFIED
  const setActivePage = useCallback((pageId: string) => {
    if (currentPage !== pageId) {
      console.log(`[PAGE] ${currentPage} → ${pageId}`);
      setCurrentPage(pageId);
    }
  }, [currentPage]);

  const getCurrentPage = useCallback(() => currentPage, [currentPage]);

  // Create control instances with simplified props
  const homeControl = useControlState({ 
    topicPrefix: TOPIC_CONFIG.HOME_PREFIX, 
    publish: stablePublish,
    pageId: 'home',
    isActive: currentPage === 'home'
  });
  
  const block1Control = useControlState({ 
    topicPrefix: TOPIC_CONFIG.BLOCK1_PREFIX, 
    publish: stablePublish,
    pageId: 'block1',
    isActive: currentPage === 'block1'
  });
  
  const block2Control = useControlState({ 
    topicPrefix: TOPIC_CONFIG.BLOCK2_PREFIX, 
    publish: stablePublish,
    pageId: 'block2', 
    isActive: currentPage === 'block2'
  });
  
  const portableData = useControlState({ 
    topicPrefix: TOPIC_CONFIG.PORTABLE_PREFIX, 
    publish: stablePublish,
    pageId: 'portable',
    isActive: currentPage === 'portable'
  });

  // OPTIMIZED: Static topic routing - no dynamic creation
  const routeMessage = useCallback((topic: string, payload: any) => {
    if (topic.includes(TOPIC_CONFIG.HOME_PREFIX)) {
      homeControl.handleMqttMessage(topic, payload);
    } else if (topic.includes(TOPIC_CONFIG.BLOCK1_PREFIX)) {
      block1Control.handleMqttMessage(topic, payload);
    } else if (topic.includes(TOPIC_CONFIG.BLOCK2_PREFIX)) {
      block2Control.handleMqttMessage(topic, payload);
    } else if (topic.includes(TOPIC_CONFIG.PORTABLE_PREFIX)) {
      portableData.handleMqttMessage(topic, payload);
    }
  }, [homeControl, block1Control, block2Control, portableData]);

  // OPTIMIZED: Batched message processing with debouncing
  const processMessageQueue = useCallback(() => {
    if (messageQueueRef.current.size === 0) return;

    const messages = new Map(messageQueueRef.current);
    messageQueueRef.current.clear();

    // Process all messages in batch
    messages.forEach((payload, topic) => {
      try {
        routeMessage(topic, payload);
      } catch (error) {
        console.error('Error routing message:', error, { topic });
      }
    });
  }, [routeMessage]);

  // OPTIMIZED: Single subscription setup
  const initializeSubscriptions = useCallback(() => {
    if (!client || !isConnected || subscriptionsInitialized.current) return;

    console.log('[MQTT] Initializing all subscriptions...');
    
    let successCount = 0;
    ALL_TOPICS.forEach(topic => {
      try {
        client.subscribe(topic);
        successCount++;
      } catch (error) {
        console.error(`[MQTT] Failed to subscribe to ${topic}:`, error);
      }
    });

    console.log(`[MQTT] Successfully subscribed to ${successCount}/${ALL_TOPICS.length} topics`);
    subscriptionsInitialized.current = true;
  }, [client, isConnected]);

  // OPTIMIZED: Single message handler with debouncing
  const handleMqttMessage = useCallback((message: Paho.Message) => {
    try {
      const topic = message.destinationName;
      const payload = JSON.parse(message.payloadString);
      
      // Add to queue (overwrite previous message for same topic)
      messageQueueRef.current.set(topic, payload);
      
      // Debounce processing
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      
      processingTimeoutRef.current = setTimeout(processMessageQueue, 50);
      
    } catch (error) {
      console.error('Error parsing MQTT message:', error);
    }
  }, [processMessageQueue]);

  // MAIN EFFECT: Setup subscriptions once
  useEffect(() => {
    if (isConnected && client) {
      setMessageHandler(handleMqttMessage);
      initializeSubscriptions();

      return () => {
        clearMessageHandler();
      };
    } else {
      clearMessageHandler();
      subscriptionsInitialized.current = false;
    }
  }, [isConnected, client, setMessageHandler, clearMessageHandler, handleMqttMessage, initializeSubscriptions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      messageQueueRef.current.clear();
      subscriptionsInitialized.current = false;
    };
  }, []);

  // OPTIMIZED: Memoize context value
  const contextValue = useMemo<ControlContextValue>(() => ({
    isConnected,
    publish: stablePublish,
    setActivePage,
    getCurrentPage,
    homeControl,
    block1Control,
    block2Control,
    portableData,
  }), [
    isConnected,
    stablePublish,
    setActivePage,
    getCurrentPage,
    homeControl,
    block1Control,
    block2Control,
    portableData,
  ]);

  return (
    <ControlContext.Provider value={contextValue}>
      {children}
    </ControlContext.Provider>
  );
};

// Hooks remain the same...
export const useControl = (): ControlContextValue => {
  const context = useContext(ControlContext);
  if (!context) {
    throw new Error('useControl must be used within a ControlProvider');
  }
  return context;
};

export const useHomeControl = () => {
  const { homeControl } = useControl();
  return homeControl;
};

export const useBlock1Control = () => {
  const { block1Control } = useControl();
  return block1Control;
};

export const useBlock2Control = () => {
  const { block2Control } = useControl();
  return block2Control;
};

export const usePortableData = () => {
  const { portableData } = useControl();
  return portableData;
};

export const usePageControl = () => {
  const { setActivePage, getCurrentPage } = useControl();
  return { setActivePage, getCurrentPage };
};

export const useConnectionStatus = () => {
  const { isConnected } = useControl();
  return isConnected;
};