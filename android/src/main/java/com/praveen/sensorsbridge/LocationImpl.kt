package com.praveen.sensorsbridge

import android.Manifest
import android.content.pm.PackageManager
import android.os.Looper
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.google.android.gms.location.*

class LocationImpl(private val reactContext: ReactApplicationContext) {

    private var fusedLocationClient: FusedLocationProviderClient =
        LocationServices.getFusedLocationProviderClient(reactContext)
    private var locationCallback: LocationCallback? = null

    // ----- PERMISSIONS CHECK -----
    private fun hasLocationPermission(): Boolean {
        return ActivityCompat.checkSelfPermission(
            reactContext,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }

    // ----- PUBLIC METHODS -----
    
    fun isLocationServiceEnabled(promise: Promise) {
        promise.resolve(hasLocationPermission())
    }

    fun getCurrentLocation(promise: Promise) {
        if (!hasLocationPermission()) {
            promise.reject("permission_denied", "Location permission denied")
            return
        }

        try {
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
        } catch (e: SecurityException) {
            promise.reject("permission_denied", "Location permission denied")
        }
    }

    fun startUpdates(config: ReadableMap?, promise: Promise, emitEvent: (String, WritableMap) -> Unit) {
        if (!hasLocationPermission()) {
            promise.reject("permission_denied", "Location permission denied")
            return
        }

        // Prevent multiple listeners: stop existing updates if any
        if (locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback!!)
            locationCallback = null
        }

        val interval = config?.getInt("locationIntervalMs") ?: 1000
        val accuracy = config?.getString("locationAccuracy")
        val priority = when (accuracy) {
            "low" -> Priority.PRIORITY_LOW_POWER
            "balanced" -> Priority.PRIORITY_BALANCED_POWER_ACCURACY
            else -> Priority.PRIORITY_HIGH_ACCURACY
        }

        val locationRequest = LocationRequest.Builder(priority, interval.toLong())
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
                    emitEvent("onLocationUpdate", map)
                }
            }
        }

        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback!!,
                Looper.getMainLooper()
            )
            promise.resolve(null)
        } catch (e: SecurityException) {
            promise.reject("permission_denied", "Location permission denied")
        }
    }

    fun stopUpdates(promise: Promise? = null) {
        if (locationCallback != null) {
            fusedLocationClient.removeLocationUpdates(locationCallback!!)
            locationCallback = null
        }
        promise?.resolve(null)
    }
}
