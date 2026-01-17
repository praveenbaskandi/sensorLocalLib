import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';

import {
  startSensors,
  stopSensors,
  setGyroUpdateInterval,
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

export default function App() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [gyro, setGyro] = useState<GyroData | null>(null);
  const [locationEnabled, setLocationEnabled] = useState<boolean | null>(null);
  const [status, setStatus] = useState<string>('Idle');

  useEffect(() => {
    // --- Add listeners ---
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

    // Check if location is enabled
    isLocationServiceEnabled()
      .then(setLocationEnabled)
      .catch(() => setLocationEnabled(false));

    return () => {
      // --- Clean up listeners on unmount ---
      locSub.remove();
      gyroSub.remove();
      locErrSub.remove();
      gyroErrSub.remove();
      stopSensors();
    };
  }, []);

  const handleStart = async () => {
    try {
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
    } catch (e: any) {
      Alert.alert('Start Error', e.message || 'Unknown error');
      setStatus('Error');
    }
  };

  const handleStop = async () => {
    await stopSensors();
    setStatus('Stopped');
  };

  const handleCurrentLocation = async () => {
    try {
      if (!(await requestLocationPermission())) {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }
      const loc = await getCurrentLocation();
      Alert.alert('Current Location', JSON.stringify(loc, null, 2));
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Unknown error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>SensorsBridge Demo</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Status: {status}</Text>
          <Text style={styles.label}>
            Location Permission Enabled:{' '}
            {locationEnabled === null
              ? 'Checking...'
              : locationEnabled
                ? 'Yes'
                : 'No'}
          </Text>
        </View>

        <View style={styles.section}>
          <Button title="Start Sensors" onPress={handleStart} />
          <View style={styles.spacer} />
          <Button title="Stop Sensors" onPress={handleStop} color="red" />
          <View style={styles.spacer} />
          <Button
            title="Get Current Location"
            onPress={handleCurrentLocation}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Location Data:</Text>
          {location ? (
            <Text>{JSON.stringify(location, null, 2)}</Text>
          ) : (
            <Text>No location data yet</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Gyroscope Data:</Text>
          {gyro ? (
            <Text>{JSON.stringify(gyro, null, 2)}</Text>
          ) : (
            <Text>No gyroscope data yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  content: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  subHeader: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  section: { marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 5 },
  spacer: { height: 10 },
});
