import { NativeModules } from 'react-native';

const { SensorsBridge } = NativeModules;

if (!SensorsBridge) {
  throw new Error(
    'SensorsBridge native module is not linked. Did you run pod install?'
  );
}

export default SensorsBridge;
