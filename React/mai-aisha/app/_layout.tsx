import { Stack } from "expo-router";
import { AuthProvider } from "@/lib/auth";
import { StatusBar } from "expo-status-bar"; 
import BottomNav from "@/components/BottomNav";
import BottomNavSpacer from "../components/BottomNavSpacer";
import NetworkStatus from "@/components/NetworkStatus";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="(headteacher)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
        <Stack.Screen name="(settings)" options={{ headerShown: false }} />
      </Stack>

      <StatusBar style="auto" />
      {/* Network status indicator */}
      <NetworkStatus />
      {/* Conditional spacer so content isn't hidden when nav is visible */}
      <BottomNavSpacer />
      {/* Persistent bottom navigation */}
      <BottomNav />
    </AuthProvider>
  );
}
