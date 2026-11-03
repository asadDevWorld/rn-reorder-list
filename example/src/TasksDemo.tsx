import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ReorderList, useReorderHistory } from 'rn-reorder-list';
import { TASKS, type Task } from './data';
import { haptic } from './haptics';
import { Row } from './Row';
import { colors } from './theme';

export function TasksDemo() {
  const history = useReorderHistory<Task>(TASKS);
  return (
    <View style={styles.fill}>
      <Text style={styles.hint}>
        Hold a row, then drag. Drag to an edge to auto scroll.
      </Text>
      <View style={styles.toolbar}>
        <Pressable
          disabled={!history.canUndo}
          onPress={history.undo}
          style={[styles.button, !history.canUndo && styles.disabled]}
        >
          <Text style={styles.buttonText}>Undo</Text>
        </Pressable>
        <Pressable
          disabled={!history.canRedo}
          onPress={history.redo}
          style={[styles.button, !history.canRedo && styles.disabled]}
        >
          <Text style={styles.buttonText}>Redo</Text>
        </Pressable>
      </View>
      <ReorderList
        data={history.items}
        keyExtractor={(t) => t.id}
        itemHeight={72}
        haptics={haptic}
        onReorder={(next) => history.set(next)}
        renderItem={({ item, index, isActive }) => (
          <Row
            title={item.title}
            tag={item.tag}
            index={index}
            isActive={isActive}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hint: { color: colors.muted, marginBottom: 8 },
  toolbar: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.card,
  },
  disabled: { opacity: 0.4 },
  buttonText: { color: colors.text, fontWeight: '600' },
});
