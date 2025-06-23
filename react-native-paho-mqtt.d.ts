declare module "react-native-paho-mqtt" {
    export class Client {
      constructor(options: any);
      connect(): Promise<any>;
      subscribe(topic: string): Promise<any>;
      send(message: Message): void;
      disconnect(): void;
      onMessageArrived: (message: Message) => void;
    }
  
    export class Message {
      constructor(payload: string);
      destinationName: string;
      payloadString: string;
    }
  }
  