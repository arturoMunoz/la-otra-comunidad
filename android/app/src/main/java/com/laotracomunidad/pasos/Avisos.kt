package com.laotracomunidad.pasos

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.work.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.TimeUnit

/** Avisos al móvil en Android: cada 15 min pregunta al juego si hay avisos nuevos (Máster, sitio nuevo, fardo, hoguera) y los enseña. */
object Avisos {
    const val URL_AVISOS = "https://egdnytvckttgvybdbvmw.supabase.co/rest/v1/rpc/loc_avisos_android"
    const val CANAL = "avisos"

    fun canal(c: Context) {
        val nm = c.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (nm.getNotificationChannel(CANAL) == null)
            nm.createNotificationChannel(NotificationChannel(CANAL, "Avisos del juego", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "Mensajes del Máster, sitios nuevos, fardos y la hoguera" })
    }

    fun permiso(c: Context) = android.os.Build.VERSION.SDK_INT < 33 ||
        c.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) == android.content.pm.PackageManager.PERMISSION_GRANTED

    suspend fun mira(c: Context) {
        val n = Pasos.nombre(c); if (n.isBlank()) return
        if (!permiso(c)) return   // sin permiso no se recogen: si se recogieran, se perderían sin enseñarse
        val lista = withContext(Dispatchers.IO) {
            val con = URL(URL_AVISOS).openConnection() as HttpURLConnection
            con.requestMethod = "POST"; con.doOutput = true; con.connectTimeout = 15000; con.readTimeout = 15000
            con.setRequestProperty("apikey", Pasos.CLAVE); con.setRequestProperty("Content-Type", "application/json")
            con.outputStream.use { it.write(JSONObject().put("p_clave", n).toString().toByteArray()) }
            if (con.responseCode >= 300) return@withContext JSONArray()
            JSONArray(con.inputStream.bufferedReader().readText())
        }
        if (lista.length() == 0) return
        canal(c)
        val nm = c.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val abre = PendingIntent.getActivity(c, 0, Intent(c, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
        val icono = try { android.graphics.BitmapFactory.decodeResource(c.resources, R.mipmap.ic_launcher) } catch (e: Exception) { null }
        for (i in 0 until lista.length()) {
            val a = lista.getJSONObject(i)
            val noti = android.app.Notification.Builder(c, CANAL)
                .setSmallIcon(android.R.drawable.ic_popup_reminder)
                .setLargeIcon(icono)
                .setColor(android.graphics.Color.rgb(200, 138, 38))
                .setContentTitle(a.optString("titulo", "La Otra Comunidad"))
                .setContentText(a.optString("texto", ""))
                .setStyle(android.app.Notification.BigTextStyle().bigText(a.optString("texto", "")))
                .setContentIntent(abre).setAutoCancel(true).build()
            nm.notify(a.optLong("id", i.toLong()).toInt(), noti)
        }
    }

    fun programa(c: Context) {
        val req = PeriodicWorkRequestBuilder<AvisosTrabajo>(15, TimeUnit.MINUTES)
            .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).build()
        WorkManager.getInstance(c).enqueueUniquePeriodicWork("avisos", ExistingPeriodicWorkPolicy.KEEP, req)
    }
}

class AvisosTrabajo(c: Context, p: WorkerParameters) : CoroutineWorker(c, p) {
    override suspend fun doWork(): Result = try { Avisos.mira(applicationContext); Result.success() } catch (e: Exception) { Result.retry() }
}
