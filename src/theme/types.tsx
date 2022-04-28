import React from 'react';
import {ThemeSetting} from '@/pages/ThemeSetting';

export type Font = {
  fontFamily: string;
  fontWeight?:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
};

export type Fonts = {
  regular: Font;
  bold: Font;
  light: Font;
};

export type Theme = {
  dark: boolean;
  roundness: number;
  colors: {
    primary: string;
    lightPrimary: string;
    backgroudPrimary: string;
    secondary: string;
    white: string;
    black: string;
    grey0: string;
    grey1: string;
    grey2: string;
    grey3: string;
    grey4: string;
    grey5: string;

    background: string;
    underlayColor: string;
    surface: string;
    onSurface: string;

    success: string;
    warning: string;
    error: string;

    text: string;
    descript: string;
    disabled: string;
    placeholder: string;
    backdrop: string;
    notification: string;
  };
  fonts: Fonts;
  animation: {
    scale: number;
  };
};
export type ChangeTheme = (myTheme: ThemeSetting) => void;

export type ThemeFunctionComponent<T> = React.FunctionComponent<
  T & {
    theme?: Theme;
    changeTheme?: ChangeTheme;
  }
>;

export type ThemeComponentClass<T, P> = React.ComponentClass<
  T & {
    theme?: Theme;
  },
  P
>;

export type ThemeForwardRefRenderFunction<T, P> =
  React.ForwardRefExoticComponent<
    React.PropsWithoutRef<
      P & {
        theme?: Theme;
      }
    > &
      React.RefAttributes<T>
  >;
