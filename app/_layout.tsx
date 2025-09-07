import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* existing routes */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="explore" />
        {/* new session route — IMPORTANT: no leading slash */}
        <Stack.Screen name="session" options={{ title: 'Session' }} />
      </Stack>
    </ThemeProvider>
  );
}
