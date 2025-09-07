// app/splash.tsx
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function Splash() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: '700' }}>Bhakti Breath Pacer</Text>
      <Text style={{ fontSize: 16, opacity: 0.8 }}>
        Find your rhythm. Tap Start to continue.
      </Text>
      <Pressable
        onPress={() => router.replace('/(tabs)')}
        style={{ backgroundColor: '#3b82f6', padding: 16, borderRadius: 12 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
          Start
        </Text>
      </Pressable>
    </View>
  );
}
