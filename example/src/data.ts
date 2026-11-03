export interface Task {
  id: string;
  title: string;
  tag: string;
}

export const TASKS: Task[] = [
  { id: '1', title: 'Write the spec', tag: 'Docs' },
  { id: '2', title: 'Scaffold the package', tag: 'Setup' },
  { id: '3', title: 'Build the gesture engine', tag: 'Core' },
  { id: '4', title: 'Auto scroll at the edges', tag: 'Core' },
  { id: '5', title: 'Grid layout', tag: 'Core' },
  { id: '6', title: 'Haptics on pick and drop', tag: 'Polish' },
  { id: '7', title: 'Accessibility actions', tag: 'A11y' },
  { id: '8', title: 'Undo and redo history', tag: 'Core' },
  { id: '9', title: 'Example app', tag: 'Demo' },
  { id: '10', title: 'Unit tests', tag: 'QA' },
  { id: '11', title: 'Record the demo video', tag: 'Docs' },
  { id: '12', title: 'Write the README', tag: 'Docs' },
  { id: '13', title: 'Publish to npm', tag: 'Release' },
  { id: '14', title: 'Announce it', tag: 'Release' },
];

export const PHOTO_COLORS = [
  '#F97316',
  '#22C55E',
  '#3B82F6',
  '#A855F7',
  '#EC4899',
  '#14B8A6',
  '#EAB308',
  '#EF4444',
  '#6366F1',
  '#84CC16',
  '#06B6D4',
  '#F43F5E',
];
