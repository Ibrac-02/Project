/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const primaryBlue = '#1E90FF'; // Consistent primary blue color
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#f3efefff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primaryBlue: primaryBlue, // Add primaryBlue to light theme
    cardBackground: '#fff',
    border: '#f0f0f0',
    danger: '#dc3545',
    success: '#28a745',
  },
  dark: {
    text: '#ECEDEE',
    background: '#272a2cff',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primaryBlue: primaryBlue, // Add primaryBlue to dark theme
    cardBackground: '#303334ff',
    border: '#2c2c2c',
    danger: '#ff6b6b',
    success: '#28a745',
  },
};
