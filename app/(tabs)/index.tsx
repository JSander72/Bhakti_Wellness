// app/(tabs)/index.tsx
import React from 'react';
import { View, Button } from 'react-native';
import { router } from 'expo-router';

export default function HomeTab() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Button
        title="Start Session"
        onPress={() =>
          router.push({
            pathname: '/session',
            params: {
              cycleDurationMs: '4000', // change to '4800' for 4.8s cycles, etc.
              totalBreaths: '5',
            },
          })
        }
      />
    </View>
  );
}
