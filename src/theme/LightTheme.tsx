import {black, white, pinkA400} from './colors';
import {Theme} from './types';

const LightTheme: Theme = {
  dark: false,
  roundness: 4,
  colors: {
    primary: '#2089dc',
    lightPrimary: '#00b0ff',
    backgroudPrimary: '#ADC7DC',
    secondary: '#ca71eb',
    white: '#ffffff',
    black: '#242424',
    grey0: '#393e42',
    grey1: '#43484d',
    grey2: '#5e6977',
    grey3: '#86939e',
    grey4: '#bdc6cf',
    grey5: '#e1e8ee',

    background: '#fff',
    underlayColor: '#f6f6f6',
    surface: white,
    onSurface: black,

    success: '#52c41a',
    warning: '#ffeb3b',
    error: '#f44336',

    text: '#333',
    descript: '#aaaaaa',
    disabled: '#cccccc',
    placeholder: '#8a8a8a',
    backdrop: '#808080',
    notification: pinkA400,
  },
  fonts: {
    regular: {
      fontFamily: 'Microsoft YaHei UI Regular',
      fontWeight: 'normal',
    },
    bold: {
      fontFamily: 'Microsoft YaHei UI Bold',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'Microsoft YaHei UI Light',
      fontWeight: 'normal',
    },
  },
  animation: {
    scale: 1.0,
  },
};

export default LightTheme;
