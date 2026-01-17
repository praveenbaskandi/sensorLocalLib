import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  getCurrentLocation(): Promise<Object>;
  isLocationServiceEnabled(): Promise<boolean>;
  startSensors(config: Object): Promise<void>;
  stopSensors(): Promise<void>;
  setGyroUpdateInterval(ms: number): Promise<void>;

  // Events are strictly not part of the TurboModule interface methods usually (handled by event emitter),
  // but if we were to expose them as methods, they would be here.
  // However, for TurboModules, events are handled via RCTDeviceEventEmitter or similar mechanisms.
}

export default TurboModuleRegistry.getEnforcing<Spec>('SensorsBridge');
