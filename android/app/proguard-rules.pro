# React Native Proguard Rules

# Keep React Native internals
-keep class com.facebook.react.bridge.CatalystInstanceImpl { *; }
-keep class com.facebook.react.bridge.WritableNativeMap { *; }
-keep class com.facebook.react.bridge.WritableNativeArray { *; }
-keep class com.facebook.react.bridge.ReadableNativeMap { *; }
-keep class com.facebook.react.bridge.ReadableNativeArray { *; }
-keep class com.facebook.react.bridge.NativeModule { *; }
-keep class com.facebook.react.bridge.JavaScriptModule { *; }
-keep class com.facebook.react.bridge.BaseJavaModule { *; }
-keep class com.facebook.react.uimanager.RootViewManager { *; }
-keep class com.facebook.react.uimanager.ViewManager { *; }

# Keep OkHttp / Axios
-keepattributes Signature
-keepattributes *Annotation*
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**
-keep class okio.** { *; }
-dontwarn okio.**

# Keep Gson / JSON models if any
-keep class com.google.gson.** { *; }

# Keep your own models if they are accessed via reflection
-keep class com.ecommerce.models.** { *; }

# Maintain compatibility with Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
