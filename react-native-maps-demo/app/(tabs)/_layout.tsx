import { Stack } from 'expo-router';
import { useFonts, Koulen_400Regular } from '@expo-google-fonts/koulen';
import { Anton_400Regular } from '@expo-google-fonts/anton';
import { Text } from 'react-native'; // Optional: for fallback

export default function TabsLayout() {
  const [fontsLoaded] = useFonts({
    Koulen_400Regular,
    Anton_400Regular,
  });

  // 👇 Don't render layout until fonts are loaded
  if (!fontsLoaded) {
    return null; // Or return a <Text>Loading...</Text>
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
