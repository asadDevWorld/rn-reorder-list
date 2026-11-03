import { describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ReorderList } from '../index';

const DATA = [
  { id: 'a', title: 'Alpha' },
  { id: 'b', title: 'Beta' },
  { id: 'c', title: 'Gamma' },
];

function layoutContent() {
  const container = screen
    .UNSAFE_getAllByType(View)
    .find(
      (v) =>
        typeof v.props.onLayout === 'function' &&
        v.props.style?.height !== undefined
    );
  if (!container) {
    throw new Error('content container not found');
  }
  act(() => {
    container.props.onLayout({
      nativeEvent: { layout: { width: 320, height: 216, x: 0, y: 0 } },
    });
  });
}

describe('ReorderList', () => {
  it('renders every item once the width is known', () => {
    render(
      <GestureHandlerRootView>
        <ReorderList
          data={DATA}
          keyExtractor={(d) => d.id}
          itemHeight={72}
          onReorder={() => undefined}
          renderItem={({ item, index }) => (
            <Text>{`${index}:${item.title}`}</Text>
          )}
        />
      </GestureHandlerRootView>
    );
    expect(screen.queryByText('0:Alpha')).toBeNull();
    layoutContent();
    expect(screen.getByText('0:Alpha')).toBeTruthy();
    expect(screen.getByText('2:Gamma')).toBeTruthy();
  });

  it('reorders through the accessibility actions and reports from and to', () => {
    const onReorder = jest.fn();
    render(
      <GestureHandlerRootView>
        <ReorderList
          data={DATA}
          keyExtractor={(d) => d.id}
          itemHeight={72}
          onReorder={onReorder}
          renderItem={({ item }) => <Text>{item.title}</Text>}
        />
      </GestureHandlerRootView>
    );
    layoutContent();
    const first = screen.getByText('Alpha').parent?.parent;
    if (!first) {
      throw new Error('row not found');
    }
    fireEvent(first, 'accessibilityAction', {
      nativeEvent: { actionName: 'moveDown' },
    });
    expect(onReorder).toHaveBeenCalledWith([DATA[1], DATA[0], DATA[2]], {
      from: 0,
      to: 1,
    });
  });
});
