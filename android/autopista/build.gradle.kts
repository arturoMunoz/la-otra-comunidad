plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android {
    namespace = "com.laotracomunidad.autopista"
    compileSdk = 36
    defaultConfig {
        applicationId = "com.laotracomunidad.autopista"
        minSdk = 26; targetSdk = 35
        versionCode = (System.getenv("GITHUB_RUN_NUMBER") ?: "1").toInt(); versionName = "1.0." + (System.getenv("GITHUB_RUN_NUMBER") ?: "0")
    }
    signingConfigs { create("loc") { storeFile = file("../app/firma.jks"); storePassword = "comunidad"; keyAlias = "loc"; keyPassword = "comunidad" } }
    buildTypes { getByName("release") { isMinifyEnabled = false; signingConfig = signingConfigs.getByName("loc") }
                 getByName("debug") { signingConfig = signingConfigs.getByName("loc") } }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
}
