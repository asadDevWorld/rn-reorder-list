import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

export function Row({
  title,
  tag,
  isActive,
  index,
  right,
}: {
  title: string;
  tag: string;
  isActive: boolean;
  index: number;
  right?: ReactNode;
}) {
  return (
    <View style={[styles.row, isActive && styles.rowActive]}>
      <Text style={styles.index}>{index + 1}</Text>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.tag}>{tag}</Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  rowActive: { backgroundColor: colors.cardActive, borderColor: colors.accent },
  index: { width: 22, color: colors.muted, fontVariant: ['tabular-nums'] },
  texts: { flex: 1 },
  title: { color: colors.text, fontSize: 16, fontWeight: '600' },
  tag: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
