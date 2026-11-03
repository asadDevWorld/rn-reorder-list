import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { GridDemo } from './GridDemo';
import { HandleDemo } from './HandleDemo';
import { TasksDemo } from './TasksDemo';
import { TimeMachineDemo } from './TimeMachineDemo';
import { colors } from './theme';

const TABS = ['Tasks', 'Handle', 'Grid', 'History'] as const;
type Tab = (typeof TABS)[number];

function Shell() {
  const [tab, setTab] = useState<Tab>('Tasks');
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.heading}>rn-reorder-list</Text>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, t === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, t === tab && styles.tabTextActive]}>
              {t}
            </Text>
          </Pressable>
        ))}
      </View>
      {tab === 'Tasks' ? <TasksDemo /> : null}
      {tab === 'Handle' ? <HandleDemo /> : null}
      {tab === 'Grid' ? <GridDemo /> : null}
      {tab === 'History' ? <TimeMachineDemo /> : null}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Shell />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16 },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  tabs: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.muted, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
});
