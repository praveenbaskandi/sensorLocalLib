import { SafeAreaView, ScrollView, Text, View, Button } from 'react-native';

import { useSensorsViewModel } from './useSensorsViewModel';
import { styles } from './styled';

export function SensorsView() {
  const {
    location,
    gyro,
    locationEnabled,
    status,
    start,
    stop,
    fetchCurrentLocation,
  } = useSensorsViewModel();

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
          <Button title="Start Sensors" onPress={start} />
          <View style={styles.spacer} />
          <Button title="Stop Sensors" onPress={stop} color="red" />
          <View style={styles.spacer} />
          <Button title="Get Current Location" onPress={fetchCurrentLocation} />
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Location Data:</Text>
          {location ? (
            <Text style={styles.jsonText}>
              {JSON.stringify(location, null, 2)}
            </Text>
          ) : (
            <Text>No location data yet</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Gyroscope Data:</Text>
          {gyro ? (
            <Text style={styles.jsonText}>{JSON.stringify(gyro, null, 2)}</Text>
          ) : (
            <Text>No gyroscope data yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
