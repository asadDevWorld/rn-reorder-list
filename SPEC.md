# rn-reorder-list: behaviour spec

Written from the behaviour of two earlier demos (a drag-to-sort list and a "time machine" variant that
keeps a history of orders) and from what a production reorderable list needs. Built from this document.

## Goal

A typed, generic list where the user long-presses an item to pick it up, drags it to a new position
while the others slide out of the way, and drops it. The list scrolls by itself when the item is dragged
near the top or bottom edge. Haptics mark pick-up and drop. The component reports the new order; the
caller owns the data. Works as a vertical list and as a grid.

## Public API

```tsx
<ReorderList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item, index, isActive, drag }) => <Row {...} />}
  onReorder={(next, { from, to }) => setItems(next)}
  itemHeight={72}            // fixed height list; or
  columns={1}                // >1 switches to grid with square cells of width / columns
  activation="longPress"     // 'longPress' (default, 300 ms) | 'handle' (call drag() from a handle)
  autoScrollThreshold={80}   // px from the edge where auto scroll starts
  haptics                    // boolean, default true when expo-haptics is installed
  activeScale={1.04}
  activeShadow
  contentContainerStyle, style, ListHeaderComponent, ListFooterComponent
/>

const history = useReorderHistory(items)   // { items, set, undo, redo, canUndo, canRedo, past }
```

## Behaviour

Pick up: a long press (or calling `drag()` from a handle) lifts the item: scale up slightly, shadow, light
haptic. The item follows the finger on the UI thread. Other items animate to make room as the dragged
item's centre crosses their midpoints.

Drop: the item springs into its slot, medium haptic, `onReorder` is called once with the new array and
the indices. If dropped where it started, no callback.

Auto scroll: while dragging within `autoScrollThreshold` of the top or bottom edge of the viewport, the
list scrolls at a speed proportional to how deep into the threshold the finger is. The dragged item stays
under the finger.

Grid: with `columns > 1`, cells are square and the drag reorders across rows. Same callbacks.

Keyboard and screen readers: each item exposes accessibility actions "Move up" and "Move down" (and
"Move left" / "Move right" in a grid), which reorder without dragging.

History: `useReorderHistory` keeps the past orders so an app can offer undo and redo, with a cap of 50.
The example shows a "Time machine" screen that scrubs through past orders.

Reduced motion shortens springs to timings.

## Example app

1. Tasks: vertical list of 12 rows, long-press to reorder, undo and redo buttons.
2. Handle: rows with a grip icon; only the grip starts the drag.
3. Grid: 3-column photo grid.
4. Time machine: slider over the order history.
