import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Squito Haptics Utility
 * 
 * Wraps Capacitor Haptics so it works safely on both web and native.
 * On web, these calls are silently ignored. On iOS, they trigger
 * the Taptic Engine for satisfying physical feedback.
 */

const isNative = Capacitor.isNativePlatform();

export const haptics = {
  /** Light tap — use for button presses, toggles */
  light: async () => {
    if (!isNative) return;
    await Haptics.impact({ style: ImpactStyle.Light });
  },

  /** Medium tap — use for card selections, nav taps */
  medium: async () => {
    if (!isNative) return;
    await Haptics.impact({ style: ImpactStyle.Medium });
  },

  /** Heavy tap — use for important actions like "Book Now" */
  heavy: async () => {
    if (!isNative) return;
    await Haptics.impact({ style: ImpactStyle.Heavy });
  },

  /** Success vibration — use after booking confirmation, achievements */
  success: async () => {
    if (!isNative) return;
    await Haptics.notification({ type: NotificationType.Success });
  },

  /** Warning vibration — use for errors, validation failures */
  warning: async () => {
    if (!isNative) return;
    await Haptics.notification({ type: NotificationType.Warning });
  },

  /** Error vibration — use for critical failures */
  error: async () => {
    if (!isNative) return;
    await Haptics.notification({ type: NotificationType.Error });
  },
};
