package com.laotracomunidad.pasos

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.text.InputType
import android.view.Gravity
import android.webkit.*
import android.widget.*
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.HealthConnectFeatures
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import org.json.JSONObject

/** La app es el juego a pantalla completa; la primera vez (o desde «Tu cuenta») sale la pantalla para activar los pasos. */
class MainActivity : ComponentActivity() {
    private val leer = HealthPermission.getReadPermission(StepsRecord::class)
    private val fondo = HealthPermission.PERMISSION_READ_HEALTH_DATA_IN_BACKGROUND
    private var estado: TextView? = null
    private var web: WebView? = null
    private val pedir = registerForActivityResult(PermissionController.createRequestPermissionResultContract()) { ok ->
        if (ok.contains(leer)) { Pasos.programa(this); manda() } else estado?.text = "Sin permiso no puedo leer tus pasos. Vuelve a darle al botón y acepta."
    }

    override fun onCreate(b: Bundle?) {
        super.onCreate(b)
        val prev = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { t, e -> Pasos.prefs(this).edit().putString("fallo", e.toString() + "\n" + e.stackTrace.take(6).joinToString("\n")).putBoolean("listo", false).commit(); prev?.uncaughtException(t, e) }
        window.statusBarColor = Color.rgb(20, 17, 11)
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() { val w = web; if (w != null && w.canGoBack()) w.goBack() else finish() } })
        if (Pasos.prefs(this).getBoolean("listo", false)) { Pasos.programa(this); abreJuego() } else ajustes()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun abreJuego() {
        val w = web ?: WebView(this).also { v ->
            v.settings.javaScriptEnabled = true; v.settings.domStorageEnabled = true; v.settings.mediaPlaybackRequiresUserGesture = false
            v.webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView, r: WebResourceRequest): Boolean {
                    if (r.url.toString().startsWith(Pasos.JUEGO)) return false
                    startActivity(Intent(Intent.ACTION_VIEW, r.url)); return true } }
            v.webChromeClient = WebChromeClient()
            v.addJavascriptInterface(Puente(), "LocAndroid")
            v.loadUrl(Pasos.JUEGO)
            web = v
        }
        setContentView(w)
        lifecycleScope.launch { try { Pasos.sincroniza(this@MainActivity) } catch (_: Exception) {} }
    }

    inner class Puente {
        @JavascriptInterface fun sincroniza() { lifecycleScope.launch {
            val t = try { Pasos.sincroniza(this@MainActivity) } catch (e: Exception) { "No se ha podido: " + (e.message ?: "") }
            web?.evaluateJavascript("window.locAndroidHecho&&locAndroidHecho(" + JSONObject.quote(t) + ")", null) } }
        @JavascriptInterface fun ajustes() { runOnUiThread { ajustes() } }
    }

    private fun ajustes() {
        val dp = resources.displayMetrics.density
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding((24*dp).toInt(), (48*dp).toInt(), (24*dp).toInt(), (24*dp).toInt()) }
        fun texto(t: String, s: Float, c: Int = Color.rgb(243,234,210)) = TextView(this).apply { text = t; textSize = s; setTextColor(c); setPadding(0, (8*dp).toInt(), 0, (8*dp).toInt()) }
        col.addView(texto("La Otra Comunidad", 26f, Color.rgb(232,194,106)).apply { gravity = Gravity.CENTER })
        col.addView(texto("La app manda tus pasos de hoy al juego cada hora, sola. Solo hay que activarla una vez.", 16f))
        col.addView(texto("Tu nombre, tal cual sale en el juego:", 15f))
        val nom = EditText(this).apply { setText(Pasos.nombre(this@MainActivity)); hint = "Por ejemplo, Arturo"; inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_WORDS; setTextColor(Color.WHITE); setHintTextColor(Color.GRAY) }
        col.addView(nom)
        val boton = Button(this).apply { text = "Activar y mandar mis pasos" }; col.addView(boton)
        estado = texto("", 16f, Color.rgb(201,188,156)); col.addView(estado)
        val juego = Button(this).apply { text = "Abrir el juego" }; col.addView(juego)
        val diag = Button(this).apply { text = "¿Qué ve la app? (diagnóstico)" }; col.addView(diag)
        val diagT = texto(Pasos.prefs(this).getString("fallo", null)?.let { "Último fallo: " + it } ?: "", 14f, Color.rgb(201,188,156)); col.addView(diagT)
        diag.setOnClickListener { diagT.text = "Mirando…"; lifecycleScope.launch { diagT.text = try { kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) { Pasos.diagnostico(this@MainActivity) } } catch (e: Throwable) { "Error: " + e + "\n" + e.stackTrace.take(4).joinToString("\n") } } }
        setContentView(ScrollView(this).apply { setBackgroundColor(Color.rgb(20,17,11)); addView(col) })
X

        boton.setOnClickListener {
            val n = nom.text.toString().trim()
            if (n.isEmpty()) { estado?.text = "Pon tu nombre."; return@setOnClickListener }
            Pasos.prefs(this).edit().putString("nombre", n).apply()
            if (HealthConnectClient.getSdkStatus(this) != HealthConnectClient.SDK_AVAILABLE) {
                estado?.text = "Este móvil no tiene Health Connect. Instálalo desde Play Store y vuelve."
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=com.google.android.apps.healthdata"))); return@setOnClickListener
            }
            lifecycleScope.launch {
                val hc = HealthConnectClient.getOrCreate(this@MainActivity)
                val quiero = mutableSetOf(leer)
                if (hc.features.getFeatureStatus(HealthConnectFeatures.FEATURE_READ_HEALTH_DATA_IN_BACKGROUND) == HealthConnectFeatures.FEATURE_STATUS_AVAILABLE) quiero.add(fondo)
                if (hc.permissionController.getGrantedPermissions().containsAll(quiero)) { Pasos.programa(this@MainActivity); manda() } else pedir.launch(quiero)
            }
        }
        juego.setOnClickListener { abreJuego() }
    }

    private fun manda() {
        estado?.text = "Mandando…"
        lifecycleScope.launch {
            estado?.text = try { val t = Pasos.sincroniza(this@MainActivity)
                if (!t.startsWith("Error")) { Pasos.prefs(this@MainActivity).edit().putBoolean("listo", true).apply(); "$t.\nYa está: se mandan solos cada hora. Toca «Abrir el juego»." } else t
            } catch (e: Exception) { "No se ha podido: " + (e.message ?: e.toString()) }
        }
    }
}
