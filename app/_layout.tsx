import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
import 'react-native-reanimated';

// Suppress known development warnings
if (__DEV__) {
  LogBox.ignoreLogs([
    'props.pointerEvents is deprecated',
    'style.resizeMode is deprecated',
    '[Reanimated] Reduced motion setting',
    'Could not establish connection. Receiving end does not exist',
    'Unchecked runtime.lastError',
  ]);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
