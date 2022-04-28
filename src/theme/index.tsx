/**
 * base on
 * https://github.com/callstack/react-native-paper
 * https://github.com/react-native-elements/react-native-elements
 */

import LightTheme from './LightTheme';
import withTheme from './withTheme';
import {ThemeProvider} from './ThemeProvider';

export type {
  Theme,
  ThemeFunctionComponent,
  ThemeComponentClass,
  ThemeForwardRefRenderFunction,
} from './types';

export {LightTheme, withTheme, ThemeProvider};
