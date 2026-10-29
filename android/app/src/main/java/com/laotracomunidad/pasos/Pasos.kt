package com.laotracomunidad.pasos

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withTimeoutOrNull
import kotlin.coroutines.resume
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.work.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.concurrent.TimeUnit

/** Lee los pasos de hoy en Health Connect y los manda al juego (la misma función que el atajo del iPhone). */
object Pasos {
    const val URL_RPC = "https://egdnytvckttgvybdbvmw.supabase.co/rest/v1/rpc/loc_pasos_hoy"
    const val CLAVE = "sb_publishable_1-eGqPkYOPKsW-ZEtUBo7A_16RQQGdK"
    const val JUEGO = "https://la-otra-comunidad.benbarek1903.workers.dev/"

    fun prefs(c: Context) = c.getSharedPreferences("loc", Context.MODE_PRIVATE)
    fun nombre(c: Context) = prefs(c).getString("nombre", "") ?: ""

    var ultimoSensor = "sin leer"
    fun permisoSensor(c: Context) = android.os.Build.VERSION.SDK_INT < 29 ||
        c.checkSelfPermission(android.Manifest.permission.ACTIVITY_RECOGNITION) == android.content.pm.PackageManager.PERMISSION_GRANTED

    /** Suma al día lo que ha avanzado el contador del móvil (que cuenta desde que se encendió). */
    fun alPaso(c: Context, v: Float): Long {
        val p = prefs(c); val hoy = LocalDate.now(ZoneId.of("Europe/Madrid")).toString()
        var dia = p.getString("s_dia", null); var acc = p.getLong("s_acc", 0); val ult = p.getFloat("s_ult", -1f)
        if (ult >= 0 && dia == hoy) acc += if (v >= ult) (v - ult).toLong() else v.toLong()
        if (dia != hoy) { dia = hoy; acc = 0 }
        p.edit().putString("s_dia", dia).putLong("s_acc", acc).putFloat("s_ult", v).apply()
        return acc
    }
    fun accHoy(c: Context): Long { val p = prefs(c); return if (p.getString("s_dia", null) == LocalDate.now(ZoneId.of("Europe/Madrid")).toString()) p.getLong("s_acc", 0) else 0 }

    suspend fun sensor(c: Context): Long? {
        if (!permisoSensor(c)) { ultimoSensor = "sin permiso de actividad física"; return null }
        val sm = c.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val s = sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER) ?: run { ultimoSensor = "este móvil no tiene sensor de pasos"; return null }
        val v = withTimeoutOrNull(6000) { suspendCancellableCoroutine<Float> { k ->
            val l = object : SensorEventListener {
                override fun onSensorChanged(e: SensorEvent) { sm.unregisterListener(this); if (k.isActive) k.resume(e.values[0]) }
                override fun onAccuracyChanged(a: Sensor?, b: Int) {} }
            sm.registerListener(l, s, SensorManager.SENSOR_DELAY_NORMAL); k.invokeOnCancellation { sm.unregisterListener(l) } } }
        if (v == null) { ultimoSensor = "conectado, esperando a que des algún paso"; return accHoy(c) }
        ultimoSensor = "funcionando"; return alPaso(c, v)
    }

    suspend fun pasosHoy(c: Context): Long {
        val sen = try { sensor(c) } catch (e: Exception) { null } ?: 0L
        val hcv = try { pasosHC(c) } catch (e: Exception) { 0L }
        return maxOf(sen, hcv)
    }

    /** Pasos de hoy en Health Connect, app por app (Samsung Health, Google Fit...). Se queda con la app que
     *  más pasos tenga, nunca suma unas con otras: si dos apps apuntan los mismos pasos, se contarían dos veces. */
    suspend fun pasosPorApp(c: Context): Map<String, Long> {
        val hc = HealthConnectClient.getOrCreate(c); val z = ZoneId.of("Europe/Madrid")
        val desde = LocalDate.now(z).atStartOfDay(z).toInstant()
        val tot = mutableMapOf<String, Long>(); var token: String? = null
        do {
            val r = hc.readRecords(ReadRecordsRequest(StepsRecord::class, TimeRangeFilter.between(desde, Instant.now()), pageToken = token))
            r.records.forEach { val k = it.metadata.dataOrigin.packageName; tot[k] = (tot[k] ?: 0L) + it.count }
            token = r.pageToken
        } while (token != null)
        return tot
    }
    suspend fun pasosHC(c: Context): Long = pasosPorApp(c).values.maxOrNull() ?: 0L

    /** Qué hay en Health Connect: pasos de hoy y de qué apps vienen, y de los últimos 7 días. */
    suspend fun diagnostico(c: Context): String {
        val hc = HealthConnectClient.getOrCreate(c); val z = ZoneId.of("Europe/Madrid")
        val hoy = LocalDate.now(z).atStartOfDay(z).toInstant(); val semana = LocalDate.now(z).minusDays(7).atStartOfDay(z).toInstant()
        val rh = hc.readRecords(ReadRecordsRequest(StepsRecord::class, TimeRangeFilter.between(hoy, Instant.now()))).records
        val rs = hc.readRecords(ReadRecordsRequest(StepsRecord::class, TimeRangeFilter.between(semana, Instant.now()))).records
        val apps = rs.map { it.metadata.dataOrigin.packageName }.toSet()
        val ult = rs.maxByOrNull { it.endTime }?.endTime?.atZone(z)?.toLocalDateTime()?.toString()?.replace('T',' ')?.take(16) ?: "nunca"
        val sen = try { sensor(c) } catch (e: Exception) { null }
        val porApp = try { pasosPorApp(c) } catch (e: Exception) { emptyMap() }
        val desglose = if (porApp.isEmpty()) "" else "\nHoy por app: " + porApp.entries.joinToString(" · ") { it.key + " " + it.value } +
            ".\nSe envía el mayor (no se suma): " + maxOf(sen ?: 0L, porApp.values.maxOrNull() ?: 0L) + " pasos."
        return "Sensor del móvil: " + ultimoSensor + (sen?.let { " · $it pasos hoy (desde que se activó)" } ?: "") + ".\nHealth Connect: hoy " + rh.size + " registros (" + rh.sumOf { it.count } + " pasos); últimos 7 días " + rs.size +
            " registros. Último paso: " + ult + ". Apps que escriben pasos: " + (if (apps.isEmpty()) "ninguna" else apps.joinToString(", ")) + desglose
    }

    /** Devuelve un texto para enseñar: "8.420 pasos enviados" o el error. */
    suspend fun sincroniza(c: Context): String {
        val n = nombre(c); if (n.isBlank()) return "Pon tu nombre primero."
        val pasos = pasosHoy(c)
        return withContext(Dispatchers.IO) {
            val con = URL(URL_RPC).openConnection() as HttpURLConnection
            con.requestMethod = "POST"; con.doOutput = true; con.connectTimeout = 15000; con.readTimeout = 15000
            con.setRequestProperty("apikey", CLAVE); con.setRequestProperty("Content-Type", "application/json")
            con.outputStream.use { it.write(JSONObject().put("p_clave", n).put("p_pasos", pasos.toString()).toString().toByteArray()) }
            val code = con.responseCode
            val txt = (if (code < 300) con.inputStream else con.errorStream)?.bufferedReader()?.readText() ?: ""
            prefs(c).edit().putLong("ultima", System.currentTimeMillis()).putLong("pasos", pasos).apply()
            if (code < 300) "%,d pasos de hoy enviados".format(pasos).replace(',', '.')
            else "Error " + code + ": " + (try { JSONObject(txt).optString("message", txt) } catch (e: Exception) { txt })
        }
    }

    fun programa(c: Context) {
        val req = PeriodicWorkRequestBuilder<Trabajo>(1, TimeUnit.HOURS)
            .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).build()
        WorkManager.getInstance(c).enqueueUniquePeriodicWork("pasos", ExistingPeriodicWorkPolicy.UPDATE, req)
    }
}

class Trabajo(c: Context, p: WorkerParameters) : CoroutineWorker(c, p) {
    override suspend fun doWork(): Result = try { Pasos.sincroniza(applicationContext); Result.success() } catch (e: Exception) { Result.retry() }
}
