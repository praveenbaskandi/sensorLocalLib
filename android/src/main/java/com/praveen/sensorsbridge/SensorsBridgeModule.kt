package com.praveen.sensorsbridge


import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Looper
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.google.android.gms.location.*
import kotlin.math.roundToInt

class SensorsBridgeModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext), SensorEventListener {

    override fun getName(): String = NAME

    // ----- LOCATION -----
    private var fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(reactContext)

    private var locationCallback: LocationCallback? = null
    private var locationRequest: LocationRequest? = null

    // ----- GYROSCOPE -----
    private var sensorManager: SensorManager? = null
    private var gyroSensor: Sensor? = null
    private var gyroIntervalMs: Long = 50
    private var lastGyroTimestamp: Long = 0L

    // ----- JS EVENT EMITTING -----
    private fun emit(event: String, params: WritableMap) {
        reactContext
            .getJSModule(RCTDeviceEventEmitter::class.java)
            .emit(event, params)
    }

    // ----- PERMISSIONS CHECK -----
    private fun hasLocationPermission(): Boolean {
        return ActivityCompat.checkSelfPermission(
            reactContext,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }

    // ----- PUBLIC METHODS -----
    @ReactMethod
    fun isLocationServiceEnabled(promise: Promise) {
        promise.resolve(hasLocationPermission())
    }

    @ReactMethod
    fun getCurrentLocation(promise: Promise) {
        if (!hasLocationPermission()) {
            promise.reject("permission_denied", "Location permission denied")
            return
        }

        fusedLocationClient.lastLocation
            .addOnSuccessListener { location ->
                if (location != null) {
                    val map = Arguments.createMap()
                    map.putDouble("latitude", location.latitude)
                    map.putDouble("longitude", location.longitude)
                    map.putDouble("accuracy", location.accuracy.toDouble())
                    map.putDouble("timestamp", location.time.toDouble())
                    map.putDouble("altitude", location.altitude)
                    map.putDouble("speed", location.speed.toDouble())
                    map.putDouble("heading", location.bearing.toDouble())
                    promise.resolve(map)
                } else {
                    promise.reject("location_unavailable", "Location not available")
                }
            }
            .addOnFailureListener { e ->
                promise.reject("location_error", e.message)
            }
    }

    @ReactMethod
    fun startSensors(config: ReadableMap?, promise: Promise) {
        if (!hasLocationPermission()) {
            promise.reject("permission_denied", "Location permission denied")
            return
        }

        // --- LOCATION ---
        val interval = config?.getInt("locationIntervalMs") ?: 1000
        val accuracy = config?.getString("locationAccuracy")
        val priority = when (accuracy) {
            "low" -> Priority.PRIORITY_LOW_POWER
            "balanced" -> Priority.PRIORITY_BALANCED_POWER_ACCURACY
            else -> Priority.PRIORITY_HIGH_ACCURACY
        }

        locationRequest = LocationRequest.Builder(priority, interval.toLong())
            .setMinUpdateIntervalMillis(interval.toLong())
            .build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                for (loc in result.locations) {
                    val map = Arguments.createMap()
                    map.putDouble("latitude", loc.latitude)
                    map.putDouble("longitude", loc.longitude)
                    map.putDouble("accuracy", loc.accuracy.toDouble())
                    map.putDouble("timestamp", loc.time.toDouble())
                    map.putDouble("altitude", loc.altitude)
                    map.putDouble("speed", loc.speed.toDouble())
                    map.putDouble("heading", loc.bearing.toDouble())
                    emit("onLocationUpdate", map)
                }
            }
        }

        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest!!,
                locationCallback!!,
                Looper.getMainLooper()
            )
        } catch (e: SecurityException) {
            promise.reject("permission_denied", "Location permission denied")
            return
        }

        // --- GYROSCOPE ---
        sensorManager = reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        gyroSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
        if (gyroSensor == null) {
            val map = Arguments.createMap()
            map.putString("code", "sensor_unavailable")
            map.putString("message", "Gyroscope sensor not available")
            emit("onGyroError", map)
        } else {
            sensorManager?.registerListener(
                this,
                gyroSensor,
                (gyroIntervalMs * 1000).toInt() // microseconds
            )
        }

        promise.resolve(null)
    }

    @ReactMethod
    fun stopSensors(promise: Promise) {
        // Stop location updates
        if (locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback!!)
            locationCallback = null
        }
        // Stop gyro updates
        if (sensorManager != null) {
            sensorManager?.unregisterListener(this)
        }
        promise.resolve(null)
    }

    @ReactMethod
    fun setGyroUpdateInterval(ms: Int, promise: Promise) {
        gyroIntervalMs = ms.toLong()
        promise.resolve(null)
    }

    // ----- SENSOR EVENT -----
    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null) return
        val now = System.currentTimeMillis()
        if (now - lastGyroTimestamp < gyroIntervalMs) return
        lastGyroTimestamp = now

        val map = Arguments.createMap()
        map.putDouble("x", event.values[0].toDouble())
        map.putDouble("y", event.values[1].toDouble())
        map.putDouble("z", event.values[2].toDouble())
        map.putDouble("timestamp", now.toDouble())
        emit("onGyroUpdate", map)
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // No-op
    }

    companion object {
        const val NAME = "SensorsBridge"
    }
}
