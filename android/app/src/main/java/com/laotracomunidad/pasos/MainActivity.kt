package com.laotracomunidad.pasos

import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.text.InputType
import android.view.Gravity
import android.widget.*
import androidx.activity.ComponentActivity
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.HealthConnectFeatures
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    private val leer = HealthPermission.getReadPermission(StepsRecord::class)
    private val fondo = HealthPermission.PERMISSION_READ_HEALTH_DATA_IN_BACKGROUND
    private lateinit var estado: TextView
    private val pedir = registerForActivityResult(PermissionController.createRequestPermissionResultContract()) { ok ->
        if (ok.contains(leer)) { Pasos.programa(this); manda() } else estado.text = "Sin permiso no puedo leer tus pasos. Vuelve a darle al botón y acepta."
    }

    override fun onCreate(b: Bundle?) {
        super.onCreate(b)
        val dp = resources.displayMetrics.density
        val col = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding((24*dp).toInt(), (48*dp).toInt(), (24*dp).toInt(), (24*dp).toInt()); setBackgroundColor(Color.rgb(20,17,11)) }
        fun texto(t: String, s: Float, c: Int = Color.rgb(243,234,210)) = TextView(this).apply { text = t; textSize = s; setTextColor(c); setPadding(0, (8*dp).toInt(), 0, (8*dp).toInt()) }
        col.addView(texto("La Otra Comunidad", 26f, Color.rgb(232,194,106)).apply { gravity = Gravity.CENTER })
        col.addView(texto("Esta app manda tus pasos de hoy al juego cada hora, sola. Solo hay que configurarla una vez.", 16f))
        col.addView(texto("Tu nombre, tal cual sale en el juego:", 15f))
        val nom = EditText(this).apply { setText(Pasos.nombre(this@MainActivity)); hint = "Por ejemplo, Arturo"; inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_WORDS; setTextColor(Color.WHITE); setHintTextColor(Color.GRAY) }
        col.addView(nom)
        val boton = Button(this).apply { text = "Activar y mandar mis pasos" }
        col.addView(boton)
        estado = texto("", 16f, Color.rgb(201,188,156)); col.addView(estado)
        val juego = Button(this).apply { text = "Abrir el juego" }
        col.addView(juego)
        setContentView(ScrollView(this).apply { setBackgroundColor(Color.rgb(20,17,11)); addView(col) })

        boton.setOnClickListener {
            val n = nom.text.toString().trim()
            if (n.isEmpty()) { estado.text = "Pon tu nombre."; return@setOnClickListener }
            Pasos.prefs(this).edit().putString("nombre", n).apply()
            if (HealthConnectClient.getSdkStatus(this) != HealthConnectClient.SDK_AVAILABLE) {
                estado.text = "Este móvil no tiene Health Connect. Instálalo desde Play Store y vuelve."
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=com.google.android.apps.healthdata"))); return@setOnClickListener
            }
            lifecycleScope.launch {
                val hc = HealthConnectClient.getOrCreate(this@MainActivity)
                val quiero = mutableSetOf(leer)
                if (hc.features.getFeatureStatus(HealthConnectFeatures.FEATURE_READ_HEALTH_DATA_IN_BACKGROUND) == HealthConnectFeatures.FEATURE_STATUS_AVAILABLE) quiero.add(fondo)
                val tengo = hc.permissionController.getGrantedPermissions()
                if (tengo.containsAll(quiero)) { Pasos.programa(this@MainActivity); manda() } else pedir.launch(quiero)
            }
        }
        juego.setOnClickListener { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(Pasos.JUEGO))) }
        if (Pasos.nombre(this).isNotEmpty()) estado.text = "Configurada para " + Pasos.nombre(this) + ". Se manda sola cada hora."
    }

    private fun manda() {
        estado.text = "Mandando…"
        lifecycleScope.launch {
            estado.text = try { Pasos.sincroniza(this@MainActivity) + ".\nYa está: a partir de ahora se manda sola cada hora." } catch (e: Exception) { "No se ha podido: " + (e.message ?: e.toString()) }
        }
    }
}
