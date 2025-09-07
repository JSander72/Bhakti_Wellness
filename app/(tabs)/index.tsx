// app/(tabs)/index.tsx
import { View, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { useMemo } from 'react';
// This is the main tab screen. It should include your BreathPacer component
// If you already have components/BreathPacer, import and pass onStart into it.

export default function Home() {
  // Example fixed values; replace with your component’s state/inputs.
  const inhale = 4, exhale = 6, hold = 0, durationSec = 60;

  const startedAt = useMemo(() => new Date().toISOString(), []);

  const begin = () => {
    router.push({
      pathname: '/session',
      params: {
        startedAt,
        inhale: String(inhale),
        exhale: String(exhale),
        hold: String(hold),
        durationSec: String(durationSec),
      },
    });
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 16, justifyContent: 'center' }}>
      {/* Place your BreathPacer control UI here */}
      <Pressable onPress={begin} style={{ backgroundColor: '#10b981', padding: 16, borderRadius: 12 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
          Start Session
        </Text>
      </Pressable>
    </View>
  );
}
