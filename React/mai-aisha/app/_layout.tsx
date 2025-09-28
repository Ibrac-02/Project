import { Stack } from "expo-router";
import { AuthProvider } from "@/lib/auth";
import { StatusBar } from "expo-status-bar"; 
import BottomNav from "@/components/BottomNav";
import BottomNavSpacer from "../components/BottomNavSpacer";
import NetworkStatus from "@/components/NetworkStatus";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useEffect } from "react";
import { pushNotificationService } from "@/lib/pushNotifications.stub";

function AppContent() {
  useEffect(() => {
    // Initialize push notifications when app starts
    pushNotificationService.initialize().catch(console.error);
  }, []);

  return (
    <>
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
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
