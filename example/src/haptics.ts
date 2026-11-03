import * as Haptics from 'expo-haptics';
import type { HapticEvent } from 'rn-reorder-list';

export function haptic(event: HapticEvent) {
  Haptics.impactAsync(
    event === 'pick'
      ? Haptics.ImpactFeedbackStyle.Light
      : Haptics.ImpactFeedbackStyle.Medium
  ).catch(() => undefined);
}
