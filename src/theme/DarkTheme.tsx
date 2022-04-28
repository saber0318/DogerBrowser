import LightTheme from './LightTheme';
import {white, pinkA100} from './colors';
import type {Theme} from './types';

const DarkTheme: Theme = {
  ...LightTheme,
  dark: true,
  colors: {
    ...LightTheme.colors,
    primary: '#BB86FC',
    lightPrimary: '#6200ea',
    backgroudPrimary: '#801BFC',
    background: '#121212',
    underlayColor: '#333',
    surface: '#121212',
    onSurface: '#FFFFFF',
    error: '#CF6679',
    text: white,
    disabled: '#424242',
    placeholder: '#8a8a8a',
    backdrop: '#808080',
    notification: pinkA100,
  },
};

export default DarkTheme;
