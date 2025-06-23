// hooks/useMqtt.ts
import {useEffect, useRef, useState} from 'react';
import * as Paho from 'paho-mqtt';
import {Alert} from 'react-native';

interface UseMqttResult {
  isConnected: boolean;
  publish: (topic: string, payload: object) => void;
  client: Paho.Client | null;
}

export function useMqtt(): UseMqttResult {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Paho.Client | null>(null);
  const queueRef = useRef<Array<{topic: string; payload: object}>>([]);

  const processQueue = () => {
    while (queueRef.current.length > 0) {
      const {topic, payload} = queueRef.current.shift()!;
      const msg = new Paho.Message(JSON.stringify(payload));
      msg.destinationName = topic;
      msg.retained = true;
      clientRef.current?.send(msg);
    }
  };

  useEffect(() => {
    // Buat client baru
    const client = new Paho.Client(
      // 'mqtt.vanilitest.shop',
      // 8083,
      'broker.emqx.io',
      8083,
      'clientId-' + Math.random().toString(16).slice(2),
    );
    clientRef.current = client;

    // Saat koneksi hilang, coba reconnect
    client.onConnectionLost = () => {
      console.log('MQTT connection lost');
      setIsConnected(false);
      setTimeout(() => client.connect(connectOptions), 1000);
    };

    // Default handler, akan di-override di komponen
    // client.onMessageArrived = () => {};

    const connectOptions = {
      useSSL: false,
      cleanSession: false,
      // userName: 'mobileapp',
      // password: '12341234',
      onSuccess: () => {
        console.log('MQTT connected');
        setIsConnected(true);
        processQueue();
        // subscribe control topics
        // const topics = [
        //   'control/water', 'control/fertilizer', 'control/wateringblok1','control/wateringblok2', 'control/fertilizingblok1', 'control/fertilizingblok2',
        //   'time/water', 'time/fertilizer',
        //   'start/water', 'start/fertilizer',
        // //   'control/blok2/water', 'control/blok2/fertilizer', 'start/blok2/water', 'start/blok2/fertilizer', 'time/blok2/water','time/blok2/fertilizer',
        // ];
        const topics = [
          'control/water1106200396',
          'control/fertilizer1106200396',
          'control/wateringblok11106200396',
          'control/wateringblok21106200396',
          'control/fertilizingblok11106200396',
          'control/fertilizingblok21106200396',
          'time/water1106200396',
          'time/fertilizer1106200396',
          'start/water1106200396',
          'start/fertilizer1106200396',
        ];

        topics.forEach(topics => {
          // client.subscribe(topic, { qos: 1 });
          client.subscribe(topics);
        });
      },
      onFailure: (err: any) => {
        console.error('MQTT connect failed', err);
      },
    };

    // Connect ke broker
    client.connect(connectOptions);

    return () => {
      if (client.isConnected()) {
        client.disconnect();
      }
    };
  }, []);
  
  const publish = (topic: string, payload: object) => {
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
      // msg.qos = 1;
      client.send(msg);
      console.log('Message published:', topic, payload);
    } catch (error) {
      console.error('Publish error:', error);
      queueRef.current.push({topic, payload});
    }
  };

  return {isConnected, publish, client: clientRef.current};
}
