import { SafeAreaView, ScrollView, Text, View } from 'react-native';

import { useSensorsViewModel } from '../screen/useSensorsViewModel';
import RowBoxContent from '../component/RowBoxContent';
import CustomButton from '../component/CustomButton';
import CardUI from '../component/CardUI';
import { styles } from '../screen/styled';

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
          <CustomButton text="Start Sensors" onPress={start} />
          <CustomButton text="Stop Sensors" onPress={stop} color="#ff0000" />
          <CustomButton
            text="Get Current Location"
            onPress={fetchCurrentLocation}
          />
        </View>
        <CardUI
          title="Location Data:"
          description={location ? '' : 'No location data yet'}
        >
          {location ? (
            <>
              <RowBoxContent title="Heading" content={location?.heading} />
              <RowBoxContent title="Speed" content={location?.speed} />
              <RowBoxContent title="Altitude" content={location?.altitude} />
              <RowBoxContent title="TimeStamp" content={location?.timestamp} />
              <RowBoxContent title="Accuracy" content={location?.accuracy} />
              <RowBoxContent title="Longitude" content={location?.longitude} />
              <RowBoxContent title="Latitude" content={location?.latitude} />
            </>
          ) : null}
        </CardUI>
        <CardUI
          mt={10}
          title="Gyroscope Data:"
          description={gyro ? '' : 'No gyroscope data yet'}
        >
          {gyro ? (
            <>
              <RowBoxContent title="Timestamp" content={gyro?.timestamp} />
              <RowBoxContent title="Z" content={gyro?.z} />
              <RowBoxContent title="Y" content={gyro?.y} />
              <RowBoxContent title="X" content={gyro?.x} />
            </>
          ) : null}
        </CardUI>
      </ScrollView>
    </SafeAreaView>
  );
}
