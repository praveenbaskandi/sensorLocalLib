package com.praveen.sensorsbridge

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap

class GyroscopeImpl(private val reactContext: ReactApplicationContext) : SensorEventListener {

    private var sensorManager: SensorManager? = null
    private var gyroSensor: Sensor? = null
    private var gyroIntervalMs: Long = 50
    private var lastGyroTimestamp: Long = 0L
    private var eventEmitter: ((String, WritableMap) -> Unit)? = null

    fun startUpdates(config: ReadableMap?, emitEvent: (String, WritableMap) -> Unit) {
        this.eventEmitter = emitEvent
        
        if (config != null && config.hasKey("gyroIntervalMs")) {
            gyroIntervalMs = config.getInt("gyroIntervalMs").toLong()
        }

        sensorManager = reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        gyroSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_GYROSCOPE)

        if (gyroSensor == null) {
            val map = Arguments.createMap()
            map.putString("code", "sensor_unavailable")
            map.putString("message", "Gyroscope sensor not available")
            emitEvent("onGyroError", map)
        } else {
            sensorManager?.registerListener(
                this,
                gyroSensor,
                (gyroIntervalMs * 1000).toInt() // microseconds
            )
        }
    }

    fun stopUpdates() {
        if (sensorManager != null) {
            sensorManager?.unregisterListener(this)
        }
    }

    fun setUpdateInterval(ms: Int) {
        gyroIntervalMs = ms.toLong()
        // Note: Changing interval might require re-registering listener if we want strict enforcement immediately,
        // but typically standard sensor usage grabs latest value. For strict sample rate change, we'd restart.
        // For now, mirroring previous logic which just updated the local var (though previous logic checked timestamp diff).
    }

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
        eventEmitter?.invoke("onGyroUpdate", map)
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // No-op
    }
}
