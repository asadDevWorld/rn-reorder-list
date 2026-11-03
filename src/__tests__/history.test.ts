import { describe, expect, it } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';
import { useReorderHistory } from '../useReorderHistory';

describe('useReorderHistory', () => {
  it('records orders and supports undo and redo', () => {
    const { result } = renderHook(() => useReorderHistory(['a', 'b', 'c']));
    expect(result.current.canUndo).toBe(false);
    act(() => result.current.set(['b', 'a', 'c']));
    act(() => result.current.set(['c', 'b', 'a']));
    expect(result.current.items).toEqual(['c', 'b', 'a']);
    expect(result.current.past).toEqual([
      ['a', 'b', 'c'],
      ['b', 'a', 'c'],
    ]);
    act(() => result.current.undo());
    expect(result.current.items).toEqual(['b', 'a', 'c']);
    expect(result.current.canRedo).toBe(true);
    act(() => result.current.redo());
    expect(result.current.items).toEqual(['c', 'b', 'a']);
    expect(result.current.canRedo).toBe(false);
  });

  it('jumps to a past order and keeps the later ones as future', () => {
    const { result } = renderHook(() => useReorderHistory([1, 2, 3]));
    act(() => result.current.set([2, 1, 3]));
    act(() => result.current.set([3, 2, 1]));
    act(() => result.current.jumpTo(0));
    expect(result.current.items).toEqual([1, 2, 3]);
    expect(result.current.past).toEqual([]);
    act(() => result.current.redo());
    expect(result.current.items).toEqual([2, 1, 3]);
  });

  it('caps the past at the limit', () => {
    const { result } = renderHook(() => useReorderHistory([0], 3));
    for (let i = 1; i <= 6; i++) {
      act(() => result.current.set([i]));
    }
    expect(result.current.past).toEqual([[3], [4], [5]]);
  });
});
