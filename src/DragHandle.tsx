import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useItemContext } from './context';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Wrap the grip icon of a row with this when the list uses `activation="handle"`.
 * Dragging starts from the handle without a long press.
 */
export function DragHandle({ children, style }: Props) {
  const { pan } = useItemContext();
  return (
    <GestureDetector gesture={pan}>
      <View
        style={style}
        accessibilityRole="button"
        accessibilityLabel="Drag to reorder"
      >
        {children}
      </View>
    </GestureDetector>
  );
}
