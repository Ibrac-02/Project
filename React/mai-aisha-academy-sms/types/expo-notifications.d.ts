declare module 'expo-notifications' {
  // Minimal ambient declarations to satisfy TypeScript.
  // Install the real package: `npx expo install expo-notifications` for full typings.
  export type AndroidImportance = number;
  export const AndroidImportance: { DEFAULT: AndroidImportance };
  export function setNotificationHandler(handler: any): void;
  export function setNotificationChannelAsync(name: string, config: any): Promise<void>;
  export function getPermissionsAsync(): Promise<{ status: string }>;
  export function requestPermissionsAsync(): Promise<{ status: string }>;
  export function getExpoPushTokenAsync(): Promise<{ data: string }>;
}
