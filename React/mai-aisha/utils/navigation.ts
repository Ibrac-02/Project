import { router } from 'expo-router';
import { Platform } from 'react-native';

export interface NavigationOptions {
  animated?: boolean;
  duration?: number;
}

/**
 * Smooth animated back navigation with fallback
 */
export const animatedGoBack = (fallbackRoute?: string, options: NavigationOptions = {}) => {
  const { animated = true, duration = 300 } = options;
  
  try {
    // Use native back navigation with animation
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      router.back();
    } else {
      // For web, use replace with animation-like delay
      if (animated) {
        setTimeout(() => {
          if (fallbackRoute) {
            router.replace(fallbackRoute as any);
          } else {
            router.back();
          }
        }, 50); // Small delay for smoother transition
      } else {
        if (fallbackRoute) {
          router.replace(fallbackRoute as any);
        } else {
          router.back();
        }
      }
    }
  } catch (error) {
    console.log('Router.back() failed, using fallback navigation', error);
    if (fallbackRoute) {
      if (animated && Platform.OS === 'web') {
        setTimeout(() => {
          router.replace(fallbackRoute as any);
        }, 100);
      } else {
        router.replace(fallbackRoute as any);
      }
    }
  }
};

/**
 * Role-based back navigation with smooth animations
 */
export const roleBasedGoBack = (role: string | null) => {
  let fallbackRoute: string;
  
  switch (role) {
    case 'admin':
      fallbackRoute = '/(admin)/dashboard';
      break;
    case 'teacher':
      fallbackRoute = '/(teacher)/dashboard';
      break;
    case 'headteacher':
      fallbackRoute = '/(headteacher)/dashboard';
      break;
    default:
      fallbackRoute = '/(main)/announcements';
      break;
  }
  
  animatedGoBack(fallbackRoute);
};

/**
 * Smooth navigation with custom transition
 */
export const smoothNavigate = (route: string, options: NavigationOptions = {}) => {
  const { animated = true, duration = 300 } = options;
  
  if (animated && Platform.OS === 'web') {
    // Add a slight delay for web to create smoother transition
    setTimeout(() => {
      router.push(route as any);
    }, 50);
  } else {
    router.push(route as any);
  }
};
