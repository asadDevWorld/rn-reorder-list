import { useCallback, useMemo, useRef, useState } from 'react';

const DEFAULT_LIMIT = 50;

export interface ReorderHistory<T> {
  items: T[];
  /** Set a new order and push the old one onto the past. */
  set: (next: T[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** Older orders, oldest first. */
  past: T[][];
  /** Jump to a past order by index (0 is the oldest); later orders become the future. */
  jumpTo: (index: number) => void;
}

/** Keeps the history of orders so an app can offer undo, redo, or a time-machine view. */
export function useReorderHistory<T>(
  initial: T[],
  limit = DEFAULT_LIMIT
): ReorderHistory<T> {
  const [items, setItems] = useState(initial);
  const [past, setPast] = useState<T[][]>([]);
  const [future, setFuture] = useState<T[][]>([]);
  const current = useRef(items);
  current.current = items;

  const set = useCallback(
    (next: T[]) => {
      setPast((p) => [...p, current.current].slice(-limit));
      setFuture([]);
      setItems(next);
    },
    [limit]
  );

  const undo = useCallback(() => {
    setPast((p) => {
      const previous = p[p.length - 1];
      if (!previous) {
        return p;
      }
      setFuture((f) => [current.current, ...f]);
      setItems(previous);
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      const next = f[0];
      if (!next) {
        return f;
      }
      setPast((p) => [...p, current.current].slice(-limit));
      setItems(next);
      return f.slice(1);
    });
  }, [limit]);

  const jumpTo = useCallback((index: number) => {
    setPast((p) => {
      const target = p[index];
      if (!target) {
        return p;
      }
      setFuture((f) => [...p.slice(index + 1), current.current, ...f]);
      setItems(target);
      return p.slice(0, index);
    });
  }, []);

  return useMemo(
    () => ({
      items,
      set,
      undo,
      redo,
      canUndo: past.length > 0,
      canRedo: future.length > 0,
      past,
      jumpTo,
    }),
    [items, set, undo, redo, past, future.length, jumpTo]
  );
}
