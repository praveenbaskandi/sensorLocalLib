import { sensorsEmitter } from '../SensorsBridgeEmitter';
import type { LocationData } from '../types/LocationTypes';
import type { GyroData } from '../types/GyroTypes';

type SensorError = {
  code: string;
  message: string;
};

function typedListener<T>(eventName: string, cb: (data: T) => void) {
  return sensorsEmitter.addListener(eventName, (data: unknown) =>
    cb(data as T)
  );
}

export const addLocationListener = (cb: (data: LocationData) => void) =>
  typedListener<LocationData>('onLocationUpdate', cb);

export const addGyroListener = (cb: (data: GyroData) => void) =>
  typedListener<GyroData>('onGyroUpdate', cb);

export const addLocationErrorListener = (cb: (error: SensorError) => void) =>
  typedListener<SensorError>('onLocationError', cb);

export const addGyroErrorListener = (cb: (error: SensorError) => void) =>
  typedListener<SensorError>('onGyroError', cb);
