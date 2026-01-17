import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  startSensors,
  stopSensors,
  getCurrentLocation,
  isLocationServiceEnabled,
  addLocationListener,
  addGyroListener,
  addLocationErrorListener,
  addGyroErrorListener,
  requestLocationPermission,
  type LocationData,
  type GyroData,
} from '@praveen/sensors-bridge';

export function useSensorsViewModel() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [gyro, setGyro] = useState<GyroData | null>(null);
  const [locationEnabled, setLocationEnabled] = useState<boolean | null>(null);
  const [status, setStatus] = useState<string>('Idle');

  useEffect(() => {
    const locSub = addLocationListener(setLocation);
    const gyroSub = addGyroListener(setGyro);

    const locErrSub = addLocationErrorListener((err) => {
      Alert.alert('Location Error', `${err.code}: ${err.message}`);
      setStatus('Error');
    });

    const gyroErrSub = addGyroErrorListener((err) => {
      Alert.alert('Gyroscope Error', `${err.code}: ${err.message}`);
      setStatus('Error');
    });

    isLocationServiceEnabled()
      .then(setLocationEnabled)
      .catch(() => setLocationEnabled(false));

    return () => {
      locSub.remove();
      gyroSub.remove();
      locErrSub.remove();
      gyroErrSub.remove();
      stopSensors();
    };
  }, []);

  const start = async () => {
    if (!(await requestLocationPermission())) {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

    setStatus('Starting...');
    await startSensors({
      locationIntervalMs: 1000,
      gyroIntervalMs: 50,
      locationAccuracy: 'high',
    });
    setStatus('Running');
  };

  const stop = async () => {
    await stopSensors();
    setStatus('Stopped');
  };

  const fetchCurrentLocation = async () => {
    if (!(await requestLocationPermission())) {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

    const loc = await getCurrentLocation();
    Alert.alert('Current Location', JSON.stringify(loc, null, 2));
  };

  return {
    // state
    location,
    gyro,
    locationEnabled,
    status,

    // actions
    start,
    stop,
    fetchCurrentLocation,
  };
}
