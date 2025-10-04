// app/splash.tsx
import { View, Text, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { Heart } from 'lucide-react-native';

export default function Splash() {
  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 24,
      }}
    >
      {/* Centered image above the title */}
      <Image
        source={require('../assets/images/bhakti-logo.png')} 
        style={{ width: 240, height: 240, resizeMode: 'contain' }}
      />

      <Text style={{ fontSize: 28, fontWeight: '700', color: '#405b2b' }}>
        Bhakti Breath Pacer
      </Text>
      <Text
        style={{
          fontSize: 16,
          opacity: 0.8,
          textAlign: 'center',
          color: '#37432e',
        }}
      >
        Find your rhythm. Tap the heart to continue.
      </Text>

      {/* Heart that beats and acts as button */}
      <Pressable onPress={() => router.replace('/(tabs)')}>
        <Animatable.View
          animation="pulse"
          easing="ease-in-out"
          iterationCount="infinite"
          duration={1200}
          style={{ alignItems: 'center', justifyContent: 'center' }}
        >
          <Heart size={100} stroke="#a02528" fill="#a02528" />
        </Animatable.View>
      </Pressable>
    </View>
  );
}

