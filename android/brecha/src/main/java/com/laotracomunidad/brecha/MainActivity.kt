package com.laotracomunidad.brecha

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.webkit.*
import android.widget.FrameLayout
import android.widget.ImageView

/** La Brecha sola: el juego de duelos a pantalla completa y en horizontal, sin barra del navegador. */
class MainActivity : Activity() {
    companion object { const val WEB = "https://la-otra-comunidad.benbarek1903.workers.dev/"; const val JUEGO = WEB + "batalla/" }
    private var web: WebView? = null
    private var carga: View? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(b: Bundle?) {
        super.onCreate(b)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        val raiz = FrameLayout(this).apply { setBackgroundColor(Color.BLACK) }
        val w = WebView(this).apply {
            settings.javaScriptEnabled = true; settings.domStorageEnabled = true; settings.mediaPlaybackRequiresUserGesture = false
            settings.cacheMode = WebSettings.LOAD_DEFAULT
            setLayerType(View.LAYER_TYPE_HARDWARE, null)
            setBackgroundColor(Color.BLACK)
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView, r: WebResourceRequest): Boolean {
                    val u = r.url.toString()
                    if (u.startsWith(JUEGO)) return false
                    if (u.startsWith(WEB)) { finish(); return true } /* «volver» del menú: en la app sola, cierra */
                    startActivity(Intent(Intent.ACTION_VIEW, r.url)); return true
                }
                override fun onPageFinished(view: WebView, url: String) { quitaCarga() }
            }
            webChromeClient = WebChromeClient()
            addJavascriptInterface(Puente(), "BrechaAndroid")
            loadUrl(JUEGO)
        }
        web = w
        raiz.addView(w, FrameLayout.LayoutParams(-1, -1))
        val img = ImageView(this).apply { setImageResource(R.drawable.carga); scaleType = ImageView.ScaleType.CENTER_CROP }
        carga = img; raiz.addView(img, FrameLayout.LayoutParams(-1, -1))
        setContentView(raiz)
        pantallaCompleta()
    }

    private fun quitaCarga() { val c = carga ?: return; carga = null; c.animate().alpha(0f).setDuration(350).withEndAction { (c.parent as? FrameLayout)?.removeView(c) }.start() }

    private fun pantallaCompleta() {
        if (android.os.Build.VERSION.SDK_INT >= 30) {
            window.setDecorFitsSystemWindows(false)
            window.insetsController?.let { it.hide(WindowInsets.Type.systemBars()); it.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or View.SYSTEM_UI_FLAG_FULLSCREEN or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_LAYOUT_STABLE or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN)
        }
    }

    override fun onWindowFocusChanged(f: Boolean) { super.onWindowFocusChanged(f); if (f) pantallaCompleta() }
    override fun onResume() { super.onResume(); web?.onResume(); web?.resumeTimers() }
    override fun onPause() { web?.onPause(); web?.pauseTimers(); super.onPause() }
    /* atrás (botón o gesto): lo decide siempre el juego; en partida pregunta, en el menú pregunta si quieres salir de la app */
    private fun atras() { val w = web ?: return finish(); w.evaluateJavascript("window.brechaAtras?brechaAtras():'no'") { r -> if (r == null || r.contains("no")) finish() } }
    private var cbAtras: Any? = null
    override fun onStart() {
        super.onStart()
        if (android.os.Build.VERSION.SDK_INT >= 33 && cbAtras == null) { val cb = android.window.OnBackInvokedCallback { atras() }; onBackInvokedDispatcher.registerOnBackInvokedCallback(android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, cb); cbAtras = cb }
    }
    @Deprecated("") override fun onBackPressed() { atras() }

    inner class Puente {
        @JavascriptInterface fun salir() { runOnUiThread { finish() } }
        @JavascriptInterface fun vibra(ms: Int) { runOnUiThread { web?.performHapticFeedback(android.view.HapticFeedbackConstants.LONG_PRESS) } }
    }
}
