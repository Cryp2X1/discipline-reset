import { Anton_400Regular } from '@expo-google-fonts/anton/400Regular';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_500Medium_Italic } from '@expo-google-fonts/inter/500Medium_Italic';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Inter_800ExtraBold } from '@expo-google-fonts/inter/800ExtraBold';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@/lib/notifications';
import { StoreProvider, useStore } from '@/lib/store';
import { C, F } from '@/lib/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const header = {
  headerStyle: { backgroundColor: C.black },
  headerTintColor: C.yellow,
  headerTitleStyle: { fontFamily: F.display, fontSize: 20, color: C.white },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal' as const,
};

function Nav({ fontsReady }: { fontsReady: boolean }) {
  const { ready, data } = useStore();
  const show = ready && fontsReady;
  useEffect(() => { if (show) SplashScreen.hideAsync().catch(() => {}); }, [show]);
  if (!show) return null;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.white } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!data.onboarded}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="setup" />
      </Stack.Protected>
      <Stack.Protected guard={data.onboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="day/[n]" options={{ ...header, headerShown: true, title: 'JOURNEY' }} />
        <Stack.Screen name="review/[w]" options={{ ...header, headerShown: true, title: 'WEEKLY REVIEW' }} />
        <Stack.Screen name="final" options={{ ...header, headerShown: true, title: 'DAY 30 REVIEW' }} />
        <Stack.Screen name="next" options={{ ...header, headerShown: true, title: "WHAT'S NEXT" }} />
        <Stack.Screen name="edit-setup" options={{ ...header, headerShown: true, title: 'DAY 0 / SETUP' }} />
        <Stack.Screen name="about" options={{ ...header, headerShown: true, title: 'ABOUT THE RESET' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Anton_400Regular, Inter_400Regular, Inter_500Medium, Inter_500Medium_Italic, Inter_600SemiBold,
    Inter_700Bold, Inter_800ExtraBold, JetBrainsMono_500Medium, JetBrainsMono_700Bold,
  });
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <View style={shell.outer}>
          <View style={shell.frame}>
            <Nav fontsReady={loaded || !!error} />
          </View>
        </View>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

/** On phones this is a no-op (width < 720). On iPad / wide web, keep the
 *  workbook readable instead of stretching forms, buttons and text edge-to-edge. */
const shell = StyleSheet.create({
  outer: { flex: 1, backgroundColor: C.black, alignItems: 'center' },
  frame: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center' },
});
