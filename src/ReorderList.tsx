import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import {
  GestureDetector,
  useNativeGesture,
  usePanGesture,
} from 'react-native-gesture-handler';
import Animated, {
  ReduceMotion,
  runOnJS,
  scrollTo,
  useAnimatedProps,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { ItemContext } from './context';
import type { ReorderListProps } from './types';

const SPRING = {
  damping: 28,
  stiffness: 320,
  mass: 1,
  reduceMotion: ReduceMotion.System,
};

interface Layout {
  columns: number;
  cellWidth: number;
  cellHeight: number;
  gap: number;
}

function cellX(index: number, layout: Layout): number {
  'worklet';
  return (index % layout.columns) * (layout.cellWidth + layout.gap);
}

function cellY(index: number, layout: Layout): number {
  'worklet';
  return Math.floor(index / layout.columns) * (layout.cellHeight + layout.gap);
}

function indexAt(x: number, y: number, count: number, layout: Layout): number {
  'worklet';
  const col = Math.min(
    layout.columns - 1,
    Math.max(0, Math.round(x / (layout.cellWidth + layout.gap)))
  );
  const row = Math.max(0, Math.round(y / (layout.cellHeight + layout.gap)));
  return Math.min(count - 1, row * layout.columns + col);
}

function moveKey(order: string[], key: string, to: number): string[] {
  'worklet';
  const from = order.indexOf(key);
  if (from === -1 || from === to) {
    return order;
  }
  const next = order.slice();
  next.splice(from, 1);
  next.splice(to, 0, key);
  return next;
}

export function ReorderList<T>({
  data,
  keyExtractor,
  renderItem,
  onReorder,
  itemHeight,
  columns = 1,
  activation = 'longPress',
  longPressDelay = 250,
  autoScrollThreshold = 80,
  autoScrollSpeed = 900,
  haptics,
  activeScale = 1.04,
  gap = 0,
  style,
  contentContainerStyle,
  ListHeaderComponent,
  ListFooterComponent,
}: ReorderListProps<T>) {
  const keys = useMemo(() => data.map(keyExtractor), [data, keyExtractor]);
  const count = keys.length;
  const [width, setWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);

  const layout = useMemo<Layout>(() => {
    const cols = Math.max(1, Math.floor(columns));
    const cellWidth = cols === 1 ? width : (width - gap * (cols - 1)) / cols;
    return { columns: cols, cellWidth, cellHeight: itemHeight, gap };
  }, [columns, width, itemHeight, gap]);
  const rows = Math.ceil(count / layout.columns);
  const contentHeight = Math.max(0, rows * (itemHeight + gap) - gap);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);
  const order = useSharedValue<string[]>(keys);
  const activeKey = useSharedValue<string | null>(null);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const grabX = useSharedValue(0);
  const grabY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const scrollAtStart = useSharedValue(0);
  const autoScrollDelta = useSharedValue(0);
  const layoutSv = useSharedValue<Layout>(layout);
  const viewportSv = useSharedValue(0);
  const contentSv = useSharedValue(0);
  const headerSv = useSharedValue(0);
  const [activeState, setActiveState] = useState<string | null>(null);

  useEffect(() => {
    order.value = keys;
  }, [keys, order]);
  useEffect(() => {
    layoutSv.value = layout;
    viewportSv.value = viewportHeight;
    contentSv.value = contentHeight + headerHeight;
    headerSv.value = headerHeight;
  }, [
    layout,
    viewportHeight,
    contentHeight,
    headerHeight,
    layoutSv,
    viewportSv,
    contentSv,
    headerSv,
  ]);

  const dataRef = useRef(data);
  dataRef.current = data;
  const keysRef = useRef(keys);
  keysRef.current = keys;

  const commit = useCallback(
    (nextOrder: string[], key: string) => {
      const from = keysRef.current.indexOf(key);
      const to = nextOrder.indexOf(key);
      if (from === -1 || to === -1 || from === to) {
        return;
      }
      const byKey = new Map(
        keysRef.current.map((k, i) => [k, dataRef.current[i] as T])
      );
      const next = nextOrder.map((k) => byKey.get(k) as T);
      onReorder(next, { from, to });
    },
    [onReorder]
  );

  const onPick = useCallback(
    (key: string) => {
      setActiveState(key);
      haptics?.('pick');
    },
    [haptics]
  );
  const onDrop = useCallback(
    (nextOrder: string[], key: string) => {
      setActiveState(null);
      haptics?.('drop');
      commit(nextOrder, key);
    },
    [commit, haptics]
  );

  const scrollGesture = useNativeGesture();
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });
  const scrollProps = useAnimatedProps(() => ({
    scrollEnabled: activeKey.value === null,
  }));

  // Auto scroll while the lifted item is near the top or bottom edge of the viewport.
  useFrameCallback((frame) => {
    const key = activeKey.value;
    if (!key || !frame.timeSincePreviousFrame) {
      return;
    }
    const fingerY = dragY.value + grabY.value + headerSv.value - scrollY.value;
    const threshold = autoScrollThreshold;
    let speed = 0;
    if (fingerY < threshold) {
      speed = -autoScrollSpeed * (1 - Math.max(0, fingerY) / threshold);
    } else if (fingerY > viewportSv.value - threshold) {
      speed =
        autoScrollSpeed *
        (1 - Math.max(0, viewportSv.value - fingerY) / threshold);
    }
    if (speed === 0) {
      return;
    }
    const maxScroll = Math.max(0, contentSv.value - viewportSv.value);
    const delta = (speed * frame.timeSincePreviousFrame) / 1000;
    const next = Math.min(maxScroll, Math.max(0, scrollY.value + delta));
    const applied = next - scrollY.value;
    if (applied === 0) {
      return;
    }
    autoScrollDelta.value += applied;
    scrollY.value = next;
    scrollTo(scrollRef, 0, next, false);
    dragY.value += applied;
    order.value = moveKey(
      order.value,
      key,
      indexAt(dragX.value, dragY.value, order.value.length, layoutSv.value)
    );
  });

  const onContentLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(Math.round(e.nativeEvent.layout.width));
  }, []);
  const onViewportLayout = useCallback((e: LayoutChangeEvent) => {
    setViewportHeight(Math.round(e.nativeEvent.layout.height));
  }, []);
  const onHeaderLayout = useCallback((e: LayoutChangeEvent) => {
    setHeaderHeight(Math.round(e.nativeEvent.layout.height));
  }, []);

  return (
    <GestureDetector gesture={scrollGesture}>
      <Animated.ScrollView
        ref={scrollRef}
        style={[styles.list, style]}
        onScroll={onScroll}
        scrollEventThrottle={16}
        animatedProps={scrollProps}
        onLayout={onViewportLayout}
        contentContainerStyle={contentContainerStyle}
      >
        {ListHeaderComponent ? (
          <View onLayout={onHeaderLayout}>{ListHeaderComponent}</View>
        ) : null}
        <View style={{ height: contentHeight }} onLayout={onContentLayout}>
          {width > 0 &&
            data.map((item, index) => {
              const key = keys[index] as string;
              return (
                <Item
                  key={key}
                  itemKey={key}
                  index={index}
                  isActive={activeState === key}
                  count={count}
                  layoutSv={layoutSv}
                  order={order}
                  activeKey={activeKey}
                  dragX={dragX}
                  dragY={dragY}
                  grabX={grabX}
                  grabY={grabY}
                  startX={startX}
                  startY={startY}
                  scrollY={scrollY}
                  scrollAtStart={scrollAtStart}
                  autoScrollDelta={autoScrollDelta}
                  activation={activation}
                  longPressDelay={longPressDelay}
                  activeScale={activeScale}
                  scrollGesture={scrollGesture}
                  onPick={onPick}
                  onDrop={onDrop}
                  onReorderA11y={(to) =>
                    commit(moveKey(order.value, key, to), key)
                  }
                >
                  {renderItem({ item, index, isActive: activeState === key })}
                </Item>
              );
            })}
        </View>
        {ListFooterComponent}
      </Animated.ScrollView>
    </GestureDetector>
  );
}

interface ItemProps {
  itemKey: string;
  index: number;
  isActive: boolean;
  count: number;
  layoutSv: SharedValue<Layout>;
  order: SharedValue<string[]>;
  activeKey: SharedValue<string | null>;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  grabX: SharedValue<number>;
  grabY: SharedValue<number>;
  startX: SharedValue<number>;
  startY: SharedValue<number>;
  scrollY: SharedValue<number>;
  scrollAtStart: SharedValue<number>;
  autoScrollDelta: SharedValue<number>;
  activation: 'longPress' | 'handle';
  longPressDelay: number;
  activeScale: number;
  scrollGesture: ReturnType<typeof useNativeGesture>;
  onPick: (key: string) => void;
  onDrop: (order: string[], key: string) => void;
  onReorderA11y: (to: number) => void;
  children: React.ReactNode;
}

function Item({
  itemKey,
  index,
  isActive,
  count,
  layoutSv,
  order,
  activeKey,
  dragX,
  dragY,
  grabX,
  grabY,
  startX,
  startY,
  scrollY,
  scrollAtStart,
  autoScrollDelta,
  activation,
  longPressDelay,
  activeScale,
  scrollGesture,
  onPick,
  onDrop,
  onReorderA11y,
  children,
}: ItemProps) {
  const lift = useSharedValue(0);

  const pan = usePanGesture({
    activateAfterLongPress:
      activation === 'longPress' ? longPressDelay : undefined,
    simultaneousWith: scrollGesture,
    onActivate: (e) => {
      'worklet';
      const current = order.value.indexOf(itemKey);
      activeKey.value = itemKey;
      startX.value = cellX(current, layoutSv.value);
      startY.value = cellY(current, layoutSv.value);
      dragX.value = startX.value;
      dragY.value = startY.value;
      grabX.value = e.x;
      grabY.value = e.y;
      scrollAtStart.value = scrollY.value;
      autoScrollDelta.value = 0;
      lift.value = withSpring(1, SPRING);
      runOnJS(onPick)(itemKey);
    },
    onUpdate: (e) => {
      'worklet';
      if (activeKey.value !== itemKey) {
        return;
      }
      dragX.value = startX.value + e.translationX;
      dragY.value = startY.value + e.translationY + autoScrollDelta.value;
      const target = indexAt(dragX.value, dragY.value, count, layoutSv.value);
      order.value = moveKey(order.value, itemKey, target);
    },
    onFinalize: () => {
      'worklet';
      if (activeKey.value !== itemKey) {
        return;
      }
      activeKey.value = null;
      lift.value = withTiming(0, { duration: 160 });
      runOnJS(onDrop)(order.value, itemKey);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const layout = layoutSv.value;
    const position = order.value.indexOf(itemKey);
    const active = activeKey.value === itemKey;
    const x = active
      ? dragX.value
      : withSpring(cellX(position, layout), SPRING);
    const y = active
      ? dragY.value
      : withSpring(cellY(position, layout), SPRING);
    const scale = 1 + lift.value * (activeScale - 1);
    return {
      width: layout.cellWidth,
      height: layout.cellHeight,
      zIndex: active || lift.value > 0 ? 10 : 1,
      shadowOpacity: 0.25 * lift.value,
      elevation: 8 * lift.value,
      transform: [{ translateX: x }, { translateY: y }, { scale }],
    };
  });

  const canMoveUp = index > 0;
  const canMoveDown = index < count - 1;
  const content = (
    <Animated.View
      style={[styles.item, animatedStyle]}
      accessible
      accessibilityActions={[
        ...(canMoveUp ? [{ name: 'moveUp', label: 'Move up' }] : []),
        ...(canMoveDown ? [{ name: 'moveDown', label: 'Move down' }] : []),
      ]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'moveUp') {
          onReorderA11y(index - 1);
        } else if (e.nativeEvent.actionName === 'moveDown') {
          onReorderA11y(index + 1);
        }
      }}
      accessibilityState={{ selected: isActive }}
    >
      {children}
    </Animated.View>
  );

  return (
    <ItemContext.Provider value={{ pan, activation }}>
      {activation === 'longPress' ? (
        <GestureDetector gesture={pan}>{content}</GestureDetector>
      ) : (
        content
      )}
    </ItemContext.Provider>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  item: {
    position: 'absolute',
    left: 0,
    top: 0,
    shadowColor: '#000',
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
});
