import { NativeEventEmitter } from 'react-native';
import SensorsBridge from './SensorsBridge.native';

export const sensorsEmitter = new NativeEventEmitter(SensorsBridge);
