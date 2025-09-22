// app/splash.tsx
import { router } from 'expo-router';
import { ImageBackground, Pressable, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

function pickBg(width: number, height: number) {
  const isLandscape = width > height;
  // simple tablet heuristic: >= 600dp short-edge
  const isTablet = Math.min(width, height) >= 600;

  if (isTablet && !isLandscape) return require('../assets/images/bg-tablet-portrait.png');
  if (isTablet && isLandscape)  return require('../assets/images/bg-tablet-landscape.jpg');
  if (!isTablet && !isLandscape) return require('../assets/images/bg-phone-portrait.jpg');
  return require('../assets/images/bg-phone-landscape.png');
}

export default function Splash() {
  const { width, height } = useWindowDimensions();
  const bg = pickBg(width, height);

  return (
    <View style={styles.screen}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {/* fullscreen, responsive background */}
      <ImageBackground
        source={bg}
        style={styles.bg}
        resizeMode="cover" // fill screen, crop as needed while preserving aspect
      />

      {/* optional subtle overlay for readability */}
      <View style={styles.overlay} />

      {/* foreground content */}
      <View style={styles.content}>
        <Text style={styles.title}>Bhakti Breath Pacer</Text>
        <Text style={styles.subtitle}>Find your rhythm. Tap Start to continue.</Text>

        <Pressable onPress={() => router.replace('/(tabs)')} style={styles.button}>
          <Text style={styles.buttonText}>Start</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'black' },
  bg: { ...StyleSheet.absoluteFillObject },           // <- fills any device
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  content: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 16, color: '#fff', opacity: 0.9 },
  button: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});
