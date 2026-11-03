# rn-reorder-list

Reorderable list and grid for React Native. Long-press a row to lift it, drag it while the others slide out of the way, drop it. The list scrolls by itself near the edges, haptics mark pick-up and drop, screen-reader users get "Move up" and "Move down" actions, and a history hook gives you undo, redo, and a time-machine view. Dragging runs on the UI thread with Reanimated and Gesture Handler.

https://github.com/user-attachments/assets/REPLACE-WITH-UPLOADED-DEMO

_Demo recorded on the iOS Simulator from the example app: [docs/demo.mp4](docs/demo.mp4)._

## Install

```bash
npm install rn-reorder-list react-native-reanimated react-native-worklets react-native-gesture-handler
```

With Expo:

```bash
npx expo install rn-reorder-list react-native-reanimated react-native-worklets react-native-gesture-handler
```

Requires React Native 0.76 or newer, Reanimated 4, and Gesture Handler 3, with `GestureHandlerRootView` at the root of the app.

## Usage

```tsx
import { ReorderList } from 'rn-reorder-list';

function Tasks() {
  const [items, setItems] = useState(TASKS);
  return (
    <ReorderList
      data={items}
      keyExtractor={(t) => t.id}
      itemHeight={72}
      onReorder={setItems}
      renderItem={({ item, index, isActive }) => (
        <Row title={item.title} index={index} highlighted={isActive} />
      )}
    />
  );
}
```

A grid is one prop away:

```tsx
<ReorderList data={photos} keyExtractor={(p) => p.id} itemHeight={110} columns={3} gap={8} ... />
```

Drag from a handle instead of a long press:

```tsx
<ReorderList activation="handle" ...
  renderItem={({ item }) => (
    <Row title={item.title} right={<DragHandle><GripIcon /></DragHandle>} />
  )}
/>
```

Undo and redo:

```tsx
const history = useReorderHistory(TASKS);
<ReorderList data={history.items} onReorder={(next) => history.set(next)} ... />
<Button title="Undo" disabled={!history.canUndo} onPress={history.undo} />
```

## API

### `ReorderList` props

| prop | type | default | description |
|---|---|---|---|
| `data` | `T[]` | required | The items. You own the state. |
| `keyExtractor` | `(item, index) => string` | required | Stable key per item. |
| `renderItem` | `({ item, index, isActive }) => ReactNode` | required | Row content. `isActive` is true while dragging. |
| `onReorder` | `(next, { from, to }) => void` | required | Called once per drop with the new array. Not called when nothing moved. |
| `itemHeight` | `number` | required | Row or cell height. The list is fixed-size for performance. |
| `columns` | `number` | `1` | More than 1 turns the list into a grid. |
| `gap` | `number` | `0` | Space between cells. |
| `activation` | `'longPress' \| 'handle'` | `'longPress'` | Lift after holding, or only from a `DragHandle`. |
| `longPressDelay` | `number` | `250` | Hold time before the lift, in ms. |
| `autoScrollThreshold` | `number` | `80` | Distance from the edge where auto scroll starts. |
| `autoScrollSpeed` | `number` | `900` | Fastest auto scroll, px per second. |
| `haptics` | `(event: 'pick' \| 'drop') => void` | | Hook up `expo-haptics` or any haptics library. |
| `activeScale` | `number` | `1.04` | Scale of the lifted item. |
| `style`, `contentContainerStyle` | `ViewStyle` | | Passed to the scroll view. |
| `ListHeaderComponent`, `ListFooterComponent` | `ReactNode` | | Rendered above and below the items. |

### `DragHandle`

Wrap the grip of a row with it when `activation="handle"`. It takes `style` and children.

### `useReorderHistory(initial, limit = 50)`

Returns `{ items, set, undo, redo, canUndo, canRedo, past, jumpTo }`. `past` holds earlier orders, oldest first. `jumpTo(index)` restores one and keeps the later orders as redo steps.

## Behaviour notes

- A lifted item follows the finger and scales up with a shadow. Others spring into their new slots as the item's centre crosses theirs.
- Dropping where the item started calls nothing. Otherwise `onReorder` fires once, after the drop.
- Near the top or bottom edge the list scrolls at a speed proportional to how deep the finger is in the threshold; the lifted item stays under the finger.
- The scroll view is disabled while an item is lifted, so the gesture never fights the scroll.
- Every row exposes accessibility actions to move it without dragging.
- Reduced motion shortens the springs.

## Example app

```bash
yarn
yarn example ios
```

Four tabs: Tasks (long press, undo, redo), Handle (grip-only drag), Grid (three columns), History (jump to any earlier order).

## Credits

Inspired by the drag-to-sort and time-machine demos by Enzo Mangano at reactiive.io. Implemented from scratch for this package.

## License

MIT © Asad Ali
