# @praveen/sensors-bridge

A React Native native module providing **Location** and **Gyroscope** sensors using core Android (FusedLocationProviderClient, SensorManager) and iOS (CLLocationManager, CMMotionManager) APIs. 

Built for performance, battery efficiency, and ease of use.

## Features

- **One-shot Location**: Get current location (Promise-based).
- **Continuous Updates**: Real-time event streams for Location and Gyroscope.
- **Configurable**: Adjustable update intervals and accuracy.
- **Battery Efficient**: Respects requested intervals and lifecycle.
- **Native Implementation**: No external dependencies/libraries.
- **TypeScript Support**: Full typing included.

## Installation

```sh
npm install @praveen/sensors-bridge
# or
yarn add @praveen/sensors-bridge
```

### iOS Setup

1. **Pod Install**:
   ```sh
   cd ios && pod install
   ```
2. **Permissions**: Add the following keys to your `Info.plist`:
   ```xml
   <key>NSLocationWhenInUseUsageDescription</key>
   <string>We need your location to demonstrate the sensors.</string>
   <key>NSMotionUsageDescription</key>
   <string>We need access to the gyroscope.</string>
   ```

### Android Setup

1. **Permissions**: The library automatically adds the required permissions to your `AndroidManifest.xml`.
   ```xml
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
   ```
   *Note: Runtime permissions are handled via the JS API.*

## Usage

### 1. Basic API

```ts
import { 
  startSensors, 
  stopSensors, 
  getCurrentLocation,
  isLocationServiceEnabled 
} from '@praveen/sensors-bridge';

// Check if services are enabled
const enabled = await isLocationServiceEnabled();

// Get single location update
const location = await getCurrentLocation();
console.log(location); 
// { latitude: 37.7749, longitude: -122.4194, ... }

// Start continuous updates
await startSensors({
  locationIntervalMs: 1000, // 1 second
  gyroIntervalMs: 50,       // 20 Hz
  locationAccuracy: 'high'  // 'high' | 'balanced' | 'low'
});

// Stop everything
await stopSensors();
```

### 2. Listening to Events

```ts
import { 
  addLocationListener, 
  addGyroListener, 
  addLocationErrorListener,
  addGyroErrorListener 
} from '@praveen/sensors-bridge';

// Subscribe
const locSub = addLocationListener((data) => {
  console.log('Loc:', data.latitude, data.longitude);
});

const gyroSub = addGyroListener((data) => {
  console.log('Gyro:', data.x, data.y, data.z);
});

// Handle Errors
addLocationErrorListener((err) => console.error('Loc Error:', err));
addGyroErrorListener((err) => console.error('Gyro Error:', err));

// Cleanup (e.g. in React useEffect cleanup)
locSub.remove();
gyroSub.remove();
```

## API Reference

### `startSensors(config)`

| Option | Type | Default | Description |
|---|---|---|---|
| `locationIntervalMs` | number | 1000 | Interval for location updates in ms |
| `gyroIntervalMs` | number | 50 | Interval for gyro updates in ms |
| `locationAccuracy` | string | 'high' | 'high', 'balanced', 'low' |
| `useSignificantChangesOnly` | boolean | false | (iOS only) optimization |

### Types

**LocationData**
```ts
{
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}
```

**GyroData**
```ts
{
  x: number;
  y: number;
  z: number;
  timestamp: number;
}
```

## Platform Details

- **Android**: Uses Google Play Services `FusedLocationProviderClient`.
- **iOS**: Uses `CoreLocation` and `CoreMotion`. Honors `locationAccuracy` settings mapping to `kCLLocationAccuracyBest`, `kCLLocationAccuracyHundredMeters`, etc.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT



Example


https://github.com/user-attachments/assets/8231829f-9bf2-401c-9b61-3e0e9beeb85a






