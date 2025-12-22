import {useEffect, useRef, useState, useCallback} from 'react';
import * as Paho from 'paho-mqtt';

interface UseMqttResult {
  isConnected: boolean;
  publish: (topic: string, payload: object) => void;
  client: Paho.Client | null;
  setMessageHandler: (handler: (msg: Paho.Message) => void) => void;
  clearMessageHandler: () => void;
}

export function useMqtt(): UseMqttResult {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Paho.Client | null>(null);
  const queueRef = useRef<Array<{topic: string; payload: object}>>([]);
  const messageHandlerRef = useRef<((msg: Paho.Message) => void) | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subscriptionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  
  const messageQueueRef = useRef<Paho.Message[]>([]);
  const processingRef = useRef(false);

  const processMessageQueue = useCallback(() => {
    if (processingRef.current || messageQueueRef.current.length === 0) return;
    
    processingRef.current = true;
    
    
    const batch = messageQueueRef.current.splice(0, 5); 
    
    batch.forEach(message => {
      if (messageHandlerRef.current) {
        try {
          messageHandlerRef.current(message);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      }
    });
    
    processingRef.current = false;
    
    
    if (messageQueueRef.current.length > 0) {
      setTimeout(processMessageQueue, 10); 
    }
  }, []);

  const processQueue = useCallback(() => {
    if (!clientRef.current?.isConnected()) return;
    
    const batch = queueRef.current.splice(0, 3); 
    
    batch.forEach(({topic, payload}) => {
      try {
        const msg = new Paho.Message(JSON.stringify(payload));
        msg.destinationName = topic;
        msg.retained = true;
        clientRef.current?.send(msg);
        console.log('Queued message sent:', topic);
      } catch (error) {
        console.error('Error sending queued message:', error);
        
        queueRef.current.unshift({topic, payload});
      }
    });
    
    
    if (queueRef.current.length > 0) {
      setTimeout(processQueue, 100);
    }
  }, []);

  const setMessageHandler = useCallback((handler: (msg: Paho.Message) => void) => {
    messageHandlerRef.current = handler;
  }, []);

  const clearMessageHandler = useCallback(() => {
    messageHandlerRef.current = null;
    messageQueueRef.current = [];
  }, []);

  const connectToMqtt = useCallback(() => {
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (subscriptionTimeoutRef.current) {
      clearTimeout(subscriptionTimeoutRef.current);
      subscriptionTimeoutRef.current = null;
    }

    
    if (clientRef.current?.isConnected()) {
      try {
        clientRef.current.disconnect();
      } catch (error) {
        console.error('Error disconnecting existing client:', error);
      }
    }

    const clientId = `clientId_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const client = new Paho.Client(
      'mqtt.permataindonesia.com',
      8038,
      '/ws',
    );

    clientRef.current = client;

    
    client.onConnectionLost = (responseObject) => {
      console.log('MQTT connection lost:', responseObject.errorMessage);
      setIsConnected(false);
      
      
      if (!reconnectTimeoutRef.current) {
        const delay = Math.min(2000 * Math.pow(1.5, 0), 30000); 
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectToMqtt();
        }, delay);
      }
    };

    
    client.onMessageArrived = (message) => {
      messageQueueRef.current.push(message);
      processMessageQueue();
    };

    const connectOptions = {
      useSSL: true,
      cleanSession: true,
      // clientId: clientId,
      userName: 'superAdmNyamuk1',
      password: 'hYqS9+*zDTxYN3bQSTPzistq',
      timeout: 20,
      keepAliveInterval: 60,
      onSuccess: () => {
        console.log('MQTT connected successfully');
        setIsConnected(true);
        
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        
        processQueue();

        
        const topics = [
          // 'control/water1106200396',
          // 'control/fertilizer1106200396',
          // 'time/water1106200396',
          // 'time/fertilizer1106200396',
          // 'start/water1106200396',
          // 'start/fertilizer1106200396',
          // 'control/water/blok1',
          // 'control/fertilizer/blok1',
          // 'time/water/blok1',
          // 'time/fertilizer/blok1',
          // 'start/water/blok1',
          // 'start/fertilizer/blok1',
          // 'control/water/blok2',
          // 'control/fertilizer/blok2',
          // 'time/water/blok2',
          // 'time/fertilizer/blok2',
          // 'start/water/blok2',
          // 'start/fertilizer/blok2',
        ];

        
        let index = 0;
        const subscribeNext = () => {
          if (index < topics.length) {
            const topic = topics[index];
            client.subscribe(topic, { 
              qos: 1,
              onSuccess: () => {
                console.log('Successfully subscribed to:', topic);
                index++;
                if (index < topics.length) {
                  subscriptionTimeoutRef.current = setTimeout(subscribeNext, 200); 
                }
              },
              onFailure: (err) => {
                console.error('Failed to subscribe:', topic, err);
                index++;
                if (index < topics.length) {
                  subscriptionTimeoutRef.current = setTimeout(subscribeNext, 200);
                }
              }
            });
          }
        };
        
        subscriptionTimeoutRef.current = setTimeout(subscribeNext, 1000);
      },
      onFailure: (err: any) => {
        console.error('MQTT connect failed:', err);
        setIsConnected(false);
        
        
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectToMqtt();
          }, 3000);
        }
      },
    };

    
    try {
      client.connect(connectOptions);
    } catch (error) {
      console.error('Error initiating MQTT connection:', error);
      setIsConnected(false);
    }
  }, [processQueue, processMessageQueue]);

  useEffect(() => {
    connectToMqtt();

    return () => {
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (subscriptionTimeoutRef.current) {
        clearTimeout(subscriptionTimeoutRef.current);
        subscriptionTimeoutRef.current = null;
      }

      if (clientRef.current?.isConnected()) {
        try {
          clientRef.current.disconnect();
        } catch (error) {
          console.error('Error disconnecting MQTT client:', error);
        }
      }

      
      messageHandlerRef.current = null;
      queueRef.current = [];
      messageQueueRef.current = [];
      processingRef.current = false;
    };
  }, []); 

  const publish = useCallback((topic: string, payload: object) => {
    const client = clientRef.current;
    
    if (!client || !client.isConnected()) {
      console.log('Adding to queue (offline):', topic, payload);
      queueRef.current.push({topic, payload});
      return;
    }

    try {
      const msg = new Paho.Message(JSON.stringify(payload));
      msg.destinationName = topic;
      msg.retained = true;
      client.send(msg);
      console.log('Message published:', topic, payload);
    } catch (error) {
      console.error('Publish error:', error);
      queueRef.current.push({topic, payload});
    }
  }, []);

  return {
    isConnected,
    publish,
    client: clientRef.current,
    setMessageHandler,
    clearMessageHandler
  };
}
