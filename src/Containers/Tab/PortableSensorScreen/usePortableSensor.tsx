import {useState, useRef, useEffect} from 'react';
import {BleManager, Device} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import {SoilSensorData} from 'src/Navigators/Tab';
import {useControl} from '@Context/ControlContext';

const SERVICE_UUID = '5900f86c-57d7-422c-8aa8-fd6216fa496b';
const CHARACTERISTIC_UUID = 'a0863556-7065-46e6-96ee-99e3f693cb7f';
const REQUEST_CHAR_UUID = 'b1974667-8166-57f7-a7bb-0e7327ab507c';

type CompactSensorData = {
  H: number;
  T: number;
  E: number;
  P: number;
  N: number;
  K: number;
  L: number;
};

type BleStatus = 'scanning' | 'connecting' | 'connected' | 'disconnected';

type SaveResultParams = {
  blockNumber: string;
  rowNumber: string;
  sectionNumber: string;
  flowerScore: string;
  isHealthy: string;
  unhealthyReasons: string[];
};

export const usePortableSensor = (
  initialData?: SoilSensorData,
  initialStatus?: BleStatus,
) => {
  const [bleManager] = useState(() => new BleManager());
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [currentSensorData, setCurrentSensorData] =
    useState<SoilSensorData | null>(initialData || null);
  const [bleStatus, setBleStatus] = useState<BleStatus>(
    initialStatus || 'disconnected',
  );
  const {publish, isConnected} = useControl();

  const monitoringSubscription = useRef<any>(null);
  const isScanning = useRef(false);

  const PORTABLE_TOPIC = 'data/portable';

  const convertCompactToFull = (
    compactData: CompactSensorData,
  ): SoilSensorData => {
    return {
      Humidity: compactData.H,
      Temp: compactData.T,
      EC: compactData.E,
      pH: compactData.P,
      Nitrogen: compactData.N,
      Phosphorus: compactData.K,
      Kalium: compactData.L,
    };
  };

  const requestSensorData = async (device: Device) => {
    try {
      console.log('Requesting sensor data from ESP32...');
      try {
        const mtu = await device.requestMTU(200);
        console.log('MTU negotiated:', mtu);
      } catch (mtuError) {
        console.log('MTU negotiation failed, using default:', mtuError);
      }
      await device.writeCharacteristicWithoutResponseForService(
        SERVICE_UUID,
        REQUEST_CHAR_UUID,
        Buffer.from('READ_SENSOR').toString('base64'),
      );
      console.log('Sensor data request sent');
    } catch (error) {
      console.error('Error sending sensor data request:', error);
    }
  };

  const startDataCollection = async (device: Device) => {
    try {
      console.log('Starting data collection...');
      if (monitoringSubscription.current) {
        monitoringSubscription.current.remove();
      }
      monitoringSubscription.current = device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (characteristic?.value) {
            try {
              const jsonString = Buffer.from(
                characteristic.value,
                'base64',
              ).toString('utf-8');
              console.log('Raw received data:', jsonString);

              if (!jsonString || jsonString.trim().length === 0) {
                console.error('Empty JSON string received');
                return;
              }

              const trimmedJson = jsonString.trim();
              if (!trimmedJson.startsWith('{') || !trimmedJson.endsWith('}')) {
                console.error('Invalid JSON format');
                setTimeout(() => {
                  requestSensorData(device);
                }, 1000);
                return;
              }

              let data: SoilSensorData;
              try {
                const compactData: CompactSensorData = JSON.parse(trimmedJson);
                if (
                  compactData.H !== undefined &&
                  compactData.T !== undefined
                ) {
                  console.log('Received compact format data:', compactData);
                  data = convertCompactToFull(compactData);
                } else {
                  data = JSON.parse(trimmedJson) as SoilSensorData;
                }
              } catch (parseError) {
                console.error('JSON parsing failed:', parseError);
                setTimeout(() => {
                  requestSensorData(device);
                }, 2000);
                return;
              }

              const requiredFields = [
                'Humidity',
                'Temp',
                'EC',
                'pH',
                'Nitrogen',
                'Phosphorus',
                'Kalium',
              ];
              const missingFields = requiredFields.filter(
                field => data[field] === undefined || data[field] === null,
              );

              if (missingFields.length > 0) {
                console.error('Missing fields in sensor data:', missingFields);
                return;
              }

              const invalidFields = requiredFields.filter(
                field => typeof data[field] !== 'number' || isNaN(data[field]),
              );

              if (invalidFields.length > 0) {
                console.error('Invalid numeric values:', invalidFields);
                return;
              }

              setCurrentSensorData(data);
              console.log('Successfully parsed sensor data:', data);
            } catch (error) {
              console.error('Error processing sensor data:', error);
              setTimeout(() => {
                requestSensorData(device);
              }, 1500);
            }
          }
        },
      );
      await requestSensorData(device);
    } catch (error) {
      console.error('Error starting data collection:', error);
    }
  };

  const resetBLEState = async () => {
    console.log('Resetting BLE state...');
    try {
      if (monitoringSubscription.current) {
        monitoringSubscription.current.remove();
        monitoringSubscription.current = null;
      }
      if (isScanning.current) {
        bleManager.stopDeviceScan();
        isScanning.current = false;
      }
      if (connectedDevice) {
        try {
          await connectedDevice.cancelConnection();
        } catch (error) {
          console.log('Device already disconnected:', error);
        }
      }
      setConnectedDevice(null);
      setBleStatus('scanning');
      await new Promise((resolve: any) => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error during BLE reset:', error);
    }
  };

  const startBLEScan = async () => {
    await resetBLEState();

    console.log('Starting fresh BLE scan...');
    setBleStatus('scanning');
    isScanning.current = true;

    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        if (bleStatus === 'scanning' || bleStatus === 'connecting') {
          console.log('Connection timeout');
          bleManager.stopDeviceScan();
          isScanning.current = false;
          setBleStatus('disconnected');
          reject(new Error('Connection timeout'));
        }
      }, 15000);

      bleManager.startDeviceScan([SERVICE_UUID], null, (error, device) => {
        if (error) {
          console.warn('Scan error:', error);
          setBleStatus('disconnected');
          isScanning.current = false;
          clearTimeout(timeoutId);
          reject(error);
          return;
        }

        console.log('Found device:', device?.name, device?.id);

        if (device?.name?.includes('Smart-Soil-Sensor')) {
          console.log('Found target device, stopping scan...');
          bleManager.stopDeviceScan();
          isScanning.current = false;
          setBleStatus('connecting');

          device
            .connect()
            .then(connectedDevice => {
              console.log('Device connected, discovering services...');
              setConnectedDevice(connectedDevice);
              return connectedDevice.discoverAllServicesAndCharacteristics();
            })
            .then(deviceWithServices => {
              console.log('Services discovered, starting data collection...');
              setBleStatus('connected');
              clearTimeout(timeoutId);
              return startDataCollection(deviceWithServices);
            })
            .then(() => resolve())
            .catch(connectError => {
              console.error('Connection error:', connectError);
              setBleStatus('disconnected');
              setConnectedDevice(null);
              clearTimeout(timeoutId);
              reject(connectError);
            });
        }
      });
    });
  };

  const publishSavedResult = (
    sensorData: SoilSensorData,
    resultName: string,
    saveParams: SaveResultParams,
    deviceId?: string,
  ) => {
    if (!isConnected) {
      console.warn('MQTT not connected, cannot publish saved result');
      return;
    }

    // Generate keterangan_portable dengan format: Block_Row_Section_Score
    const keteranganPortable = `${saveParams.blockNumber}_${saveParams.rowNumber}_${saveParams.sectionNumber}_${saveParams.flowerScore}`;

    const payload = {
      resultName: keteranganPortable,
      timestamp: new Date().toISOString(),
      deviceId: deviceId || connectedDevice?.id || 'portable_sensor',
      blockNumber: saveParams.blockNumber,
      rowNumber: saveParams.rowNumber,
      sectionNumber: saveParams.sectionNumber,
      flowerScore: saveParams.flowerScore,
      isHealthy: saveParams.isHealthy,
      unhealthyReasons: saveParams.unhealthyReasons,
      sensorData: {
        temperature: sensorData.Temp,
        humidity: sensorData.Humidity,
        ph: sensorData.pH,
        ec: sensorData.EC,
        nitrogen: sensorData.Nitrogen,
        phosphorus: sensorData.Phosphorus,
        kalium: sensorData.Kalium,
      },
      metadata: {
        source: 'portable_sensor',
        savedAt: Date.now(),
        location: 'field',
        readingType: 'saved',
      },
    };

    try {
      publish(`${PORTABLE_TOPIC}/saved`, payload);
      console.log('Saved result published to MQTT:', payload);
    } catch (error) {
      console.error('Error publishing saved result to MQTT:', error);
    }
  };

  useEffect(() => {
    return () => {
      resetBLEState();
    };
  }, []);

  return {
    bleManager,
    connectedDevice,
    currentSensorData,
    bleStatus,
    setCurrentSensorData,
    setBleStatus,
    startBLEScan,
    resetBLEState,
    publishSavedResult,
  };
};
