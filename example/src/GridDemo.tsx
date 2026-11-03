import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ReorderList } from 'rn-reorder-list';
import { PHOTO_COLORS } from './data';
import { haptic } from './haptics';
import { colors } from './theme';

interface Photo {
  id: string;
  color: string;
}

const PHOTOS: Photo[] = PHOTO_COLORS.map((color, i) => ({
  id: `p${i}`,
  color,
}));

export function GridDemo() {
  const [items, setItems] = useState(PHOTOS);
  return (
    <View style={styles.fill}>
      <Text style={styles.hint}>Three columns. Drag across rows.</Text>
      <ReorderList
        data={items}
        keyExtractor={(p) => p.id}
        itemHeight={110}
        columns={3}
        gap={8}
        haptics={haptic}
        onReorder={setItems}
        renderItem={({ item, index, isActive }) => (
          <View
            style={[
              styles.cell,
              { backgroundColor: item.color },
              isActive && styles.cellActive,
            ]}
          >
            <Text style={styles.cellText}>{index + 1}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hint: { color: colors.muted, marginBottom: 8 },
  cell: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 8,
  },
  cellActive: { borderWidth: 2, borderColor: '#fff' },
  cellText: { color: 'rgba(255,255,255,0.9)', fontWeight: '700' },
});
