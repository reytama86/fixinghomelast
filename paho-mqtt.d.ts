declare module 'paho-mqtt' {
    export class Client {
      onConnectionLost: (responseObject: any) => void;
      isConnected(): boolean;
      constructor(host: string, port: number, clientId: string);
      connect(options: any): void;
      disconnect(): void;
      subscribe(topic: string, options?: any): void;
      send(message: Message): void;
      onMessageArrived: (message: Message) => void;
    }
    
    export class Message {
      payloadString: string;
      destinationName: string;
      retained: boolean;
      constructor(payload: string);
    }
  }
  