import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type ReorderActivation = 'longPress' | 'handle';

export interface ReorderRenderInfo<T> {
  item: T;
  index: number;
  /** True while this item is being dragged. */
  isActive: boolean;
}

export interface ReorderChange {
  from: number;
  to: number;
}

export type HapticEvent = 'pick' | 'drop';

export interface ReorderListProps<T> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (info: ReorderRenderInfo<T>) => ReactNode;
  /** Called once per drop with the new array and the moved indices. Not called when nothing moved. */
  onReorder: (next: T[], change: ReorderChange) => void;
  /** Height of every row (or cell, in a grid). Required, the list is fixed-size for performance. */
  itemHeight: number;
  /** More than 1 switches to a grid of square-ish cells, `columns` per row. Default 1. */
  columns?: number;
  /** 'longPress' (default) lifts an item after holding it; 'handle' lifts only from a `DragHandle`. */
  activation?: ReorderActivation;
  /** Hold time in ms before a long press lifts the item. Default 250. */
  longPressDelay?: number;
  /** Distance from the viewport edge where auto scroll starts, in px. Default 80. */
  autoScrollThreshold?: number;
  /** Fastest auto scroll, in px per second. Default 900. */
  autoScrollSpeed?: number;
  /** Called on pick-up and drop so the app can trigger haptics (for example with expo-haptics). */
  haptics?: (event: HapticEvent) => void;
  /** Scale of the lifted item. Default 1.04. */
  activeScale?: number;
  /** Gap between cells in px. Default 0. */
  gap?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  ListHeaderComponent?: ReactNode;
  ListFooterComponent?: ReactNode;
}
