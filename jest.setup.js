/* global jest */
// Gesture Handler's Jest mock asks Worklets for the UI runtime, which the web build used
// under Jest does not provide. Returning undefined keeps the rest of the mock working.
jest.mock('react-native-worklets', () => {
  const actual = jest.requireActual('react-native-worklets');
  return { ...actual, getUIRuntimeHolder: () => undefined };
});
require('react-native-reanimated').setUpTests();
require('react-native-gesture-handler/jestSetup');
