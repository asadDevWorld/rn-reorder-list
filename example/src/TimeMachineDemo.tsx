import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ReorderList, useReorderHistory } from 'rn-reorder-list';
import { TASKS, type Task } from './data';
import { haptic } from './haptics';
import { Row } from './Row';
import { colors } from './theme';

export function TimeMachineDemo() {
  const history = useReorderHistory<Task>(TASKS.slice(0, 6));
  const steps = [...history.past, history.items];
  return (
    <View style={styles.fill}>
      <Text style={styles.hint}>
        Reorder a few times, then jump back to any earlier order.
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.timeline}
        contentContainerStyle={styles.timelineContent}
      >
        {steps.map((_, i) => {
          const isCurrent = i === steps.length - 1;
          return (
            <Pressable
              key={i}
              onPress={() => (isCurrent ? undefined : history.jumpTo(i))}
              style={[styles.step, isCurrent && styles.stepCurrent]}
            >
              <Text
                style={[styles.stepText, isCurrent && styles.stepTextCurrent]}
              >
                {i === 0 ? 'Start' : `#${i}`}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
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
  timeline: { flexGrow: 0, marginBottom: 8 },
  timelineContent: { gap: 8 },
  step: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.card,
  },
  stepCurrent: { backgroundColor: colors.accent },
  stepText: { color: colors.muted, fontWeight: '600' },
  stepTextCurrent: { color: '#fff' },
});
