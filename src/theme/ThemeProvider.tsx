import React from 'react';
import {StatusBar, Appearance} from 'react-native';

import {Theme, ChangeTheme} from './types';

import LightTheme from './LightTheme';
import DarkTheme from './DarkTheme';

export type ThemeProps = {
  theme: Theme;
  changeTheme: ChangeTheme;
};

export const ThemeContext: React.Context<ThemeProps> = React.createContext({
  theme: LightTheme,
} as ThemeProps);

export const ThemeProvider: React.FC<{
  theme?: Theme;
}> = ({theme = LightTheme, children}) => {
  const [themeState, setThemeState] = React.useState<Theme>(theme);

  const changeTheme: ChangeTheme = React.useCallback(myTheme => {
    console.log('myTheme', myTheme);
    if (myTheme === 'lightMode') {
      StatusBar.setBarStyle('dark-content');
      StatusBar.setBackgroundColor(LightTheme.colors.background);
      setThemeState(LightTheme);
    }
    if (myTheme === 'darkMode') {
      StatusBar.setBarStyle('light-content');
      StatusBar.setBackgroundColor(DarkTheme.colors.background);
      setThemeState(DarkTheme);
    }
    if (myTheme === 'followSystem') {
      const colorScheme = Appearance.getColorScheme();
      if (colorScheme === 'dark') {
        StatusBar.setBarStyle('light-content');
        StatusBar.setBackgroundColor(DarkTheme.colors.background);
        setThemeState(DarkTheme);
      } else {
        StatusBar.setBarStyle('dark-content');
        StatusBar.setBackgroundColor(LightTheme.colors.background);
        setThemeState(LightTheme);
      }
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: themeState,
        changeTheme,
      }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const ThemeConsumer = ThemeContext.Consumer;
