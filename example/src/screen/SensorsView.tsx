import { SafeAreaView, ScrollView, Text, View } from 'react-native';

import { useSensorsViewModel } from '../screen/useSensorsViewModel';
import RowBoxContent from '../component/RowBoxContent';
import RoundButton from '../component/RoundButton';
import CardUI from '../component/CardUI';
import { styles } from '../screen/styled';

export function SensorsView() {
  const { location, gyro, locationEnabled, status, start, stop } =
    useSensorsViewModel();

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
          <View style={styles.rowBox}>
            <RoundButton
              title="Start Sensors"
              onPress={start}
              backgroundColor="#097969"
            />
            <RoundButton
              title="Stop Sensors"
              onPress={stop}
              backgroundColor="#ff0000"
            />
          </View>
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
