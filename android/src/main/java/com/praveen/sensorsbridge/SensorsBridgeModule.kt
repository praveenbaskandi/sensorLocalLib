package com.praveen.sensorsbridge

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter

class SensorsBridgeModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = NAME

    private val locationImpl = LocationImpl(reactContext)
    private val gyroscopeImpl = GyroscopeImpl(reactContext)

    // ----- JS EVENT EMITTING -----
    private fun emit(event: String, params: WritableMap) {
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(RCTDeviceEventEmitter::class.java)
                .emit(event, params)
        }
    }

    // ----- PUBLIC METHODS -----
    @ReactMethod
    fun isLocationServiceEnabled(promise: Promise) {
        locationImpl.isLocationServiceEnabled(promise)
    }

    @ReactMethod
    fun getCurrentLocation(promise: Promise) {
        locationImpl.getCurrentLocation(promise)
    }

    @ReactMethod
    fun startSensors(config: ReadableMap?, promise: Promise) {
        // Start Location
        locationImpl.startUpdates(config, promise) { event, params ->
            emit(event, params)
        }
        
        // Start Gyro
        gyroscopeImpl.startUpdates(config) { event, params ->
            emit(event, params)
        }
    }

    @ReactMethod
    fun stopSensors(promise: Promise) {
        locationImpl.stopUpdates(null) // pass null as we resolve fully at the end
        gyroscopeImpl.stopUpdates()
        promise.resolve(null)
    }

    @ReactMethod
    fun setGyroUpdateInterval(ms: Int, promise: Promise) {
        gyroscopeImpl.setUpdateInterval(ms)
        promise.resolve(null)
    }

    companion object {
        const val NAME = "SensorsBridge"
    }
}
