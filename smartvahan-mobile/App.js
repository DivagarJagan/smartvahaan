import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Platform, StatusBar as RNStatusBar, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef, useState } from 'react';

/**
 * SmartVahaan Mobile App
 * ─────────────────────────────────────────────────────────────
 * This wraps the SmartVahaan web app inside a native WebView.
 *
 * ► LOCAL DEVELOPMENT:
 *   Set TARGET_URL to your PC's local IP on port 5173.
 *   Find it by running: ipconfig (Windows) or ifconfig (Mac/Linux)
 *   Example: 'http://192.168.1.10:5173'
 *
 * ► PRODUCTION:
 *   Set TARGET_URL to your deployed frontend URL.
 *   Example: 'https://smartvahaan.vercel.app'
 */
const TARGET_URL = 'http://10.218.114.65:5173/';

// JavaScript injected into the WebView to make it behave like a native app
const INJECTED_JS = `
  // Prevent zoom on double-tap (iOS)
  var lastTouchEnd = 0;
  document.addEventListener('touchend', function(event) {
    var now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) { event.preventDefault(); }
    lastTouchEnd = now;
  }, false);

  // Set viewport meta for mobile optimization
  var meta = document.querySelector('meta[name="viewport"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'viewport';
    document.head.appendChild(meta);
  }
  meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

  // Tell the web app it is running inside a native WebView
  window.isNativeApp = true;
  window.nativePlatform = '${Platform.OS}';
  true; // required return value for injectedJavaScript
`;

export default function App() {
  const webViewRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setError(`Cannot connect to SmartVahaan.\n\nMake sure:\n1. Your backend is running\n2. Your frontend (Vite) is running\n3. The URL below is your PC's IP address\n\nCurrent URL: ${TARGET_URL}`);
  };

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <Text style={styles.errorEmoji}>🔌</Text>
        <Text style={styles.errorTitle}>Connection Failed</Text>
        <Text style={styles.errorMsg}>{error}</Text>
        <Text
          style={styles.retryBtn}
          onPress={() => { setError(null); setLoading(true); }}
        >
          Retry
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <WebView
        ref={webViewRef}
        source={{ uri: TARGET_URL }}
        style={styles.webview}
        // Navigation
        allowsBackForwardNavigationGestures={true}
        // Permissions
        geolocationEnabled={true}
        // JavaScript
        javaScriptEnabled={true}
        injectedJavaScript={INJECTED_JS}
        // Storage (needed for JWT tokens in localStorage)
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        // Media
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // File uploads
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        // Mixed content (HTTP APIs from HTTPS pages)
        mixedContentMode="always"
        // Loading & error handlers
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={handleError}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          if (nativeEvent.statusCode >= 500) {
            setError(`Server error (${nativeEvent.statusCode}). Is the backend running?`);
          }
        }}
        // Android: hardware acceleration
        androidHardwareAccelerationDisabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMsg: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  retryBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#1976d2',
    color: '#fff',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: '600',
    overflow: 'hidden',
  },
});
