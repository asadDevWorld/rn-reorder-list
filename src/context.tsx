import { createContext, useContext } from 'react';
import type { PanGesture } from 'react-native-gesture-handler';

export interface ItemContextValue {
  pan: PanGesture;
  activation: 'longPress' | 'handle';
}

export const ItemContext = createContext<ItemContextValue | null>(null);

export function useItemContext(): ItemContextValue {
  const value = useContext(ItemContext);
  if (!value) {
    throw new Error('DragHandle must be rendered inside a ReorderList item.');
  }
  return value;
}
