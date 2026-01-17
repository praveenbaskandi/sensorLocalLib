import { NativeModules, NativeEventEmitter, Platform, PermissionsAndroid } from 'react-native';

const { SensorsBridge } = NativeModules;

if (!SensorsBridge) {
  throw new Error(
    'SensorsBridge native module is not linked. Did you run pod install?'
  );
}

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'SensorsBridge needs access to your location ' +
            'to demonstrate the location sensor.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

const emitter = new NativeEventEmitter(SensorsBridge);

// -------- Types --------
export type LocationData = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
};

export type GyroData = {
  x: number;
  y: number;
  z: number;
  timestamp: number;
};

// -------- API --------
export const getCurrentLocation = (): Promise<LocationData> =>
  SensorsBridge.getCurrentLocation();

export const isLocationServiceEnabled = (): Promise<boolean> =>
  SensorsBridge.isLocationServiceEnabled();

export const startSensors = (config?: {
  locationIntervalMs?: number;
  gyroIntervalMs?: number;
  locationAccuracy?: 'high' | 'balanced' | 'low';
  useSignificantChangesOnly?: boolean;
}): Promise<void> => SensorsBridge.startSensors(config ?? {});

export const stopSensors = (): Promise<void> => SensorsBridge.stopSensors();

export const setGyroUpdateInterval = (ms: number): Promise<void> =>
  SensorsBridge.setGyroUpdateInterval(ms);

// -------- Events --------
function typedListener<T>(eventName: string, cb: (data: T) => void) {
  return emitter.addListener(eventName, (data: Object) => cb(data as T));
}

export const addLocationListener = (cb: (data: LocationData) => void) =>
  typedListener<LocationData>('onLocationUpdate', cb);

export const addGyroListener = (cb: (data: GyroData) => void) =>
  typedListener<GyroData>('onGyroUpdate', cb);

export const addLocationErrorListener = (
  cb: (error: { code: string; message: string }) => void
) => typedListener('onLocationError', cb);

export const addGyroErrorListener = (
  cb: (error: { code: string; message: string }) => void
) => typedListener('onGyroError', cb);
