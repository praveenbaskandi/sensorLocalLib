import SensorsBridge from '../SensorsBridge.native';
import type { LocationData } from '../types/LocationTypes';

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
