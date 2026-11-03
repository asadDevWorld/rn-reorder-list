import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DragHandle, ReorderList } from 'rn-reorder-list';
import { TASKS, type Task } from './data';
import { haptic } from './haptics';
import { Row } from './Row';
import { colors } from './theme';

export function HandleDemo() {
  const [items, setItems] = useState<Task[]>(TASKS.slice(0, 8));
  return (
    <View style={styles.fill}>
      <Text style={styles.hint}>
        Only the grip starts a drag. The rest of the row stays tappable.
      </Text>
      <ReorderList
        data={items}
        keyExtractor={(t) => t.id}
        itemHeight={72}
        activation="handle"
        haptics={haptic}
        onReorder={setItems}
        renderItem={({ item, index, isActive }) => (
          <Row
            title={item.title}
            tag={item.tag}
            index={index}
            isActive={isActive}
            right={
              <DragHandle style={styles.grip}>
                <View style={styles.gripLine} />
                <View style={styles.gripLine} />
                <View style={styles.gripLine} />
              </DragHandle>
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hint: { color: colors.muted, marginBottom: 8 },
  grip: {
    paddingVertical: 14,
    paddingLeft: 12,
    gap: 4,
    justifyContent: 'center',
  },
  gripLine: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.muted,
  },
});
