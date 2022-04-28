import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  // Image,
  ViewStyle,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Reload} from '@/components/WebView';
import {ThemeFunctionComponent, withTheme} from '@/theme';

export interface ErrorViewState {
  code?: number;
  description?: string;
}
export type ErrorViewProps = ErrorViewState & {
  style?: ViewStyle;
  reload: Reload;
};

// const errorViewPng = require('./errorView.png');

const ErrorView: ThemeFunctionComponent<ErrorViewProps> = props => {
  const {style = {}, code, description, reload = () => {}, theme} = props;

  const {t} = useTranslation();

  return (
    <View
      style={[
        style,
        styles.errorView,
        {backgroundColor: theme?.colors.background},
      ]}>
      {/* <Image source={errorViewPng} /> */}
      <Text style={[styles.title, {color: theme?.colors.text}]}>
        {t('Too bad! Something went wrong!')}
      </Text>
      <Text style={[styles.subTitle, {color: theme?.colors.text}]}>
        {t('The web page cannot be opened, please reload!')}
      </Text>
      {code && description ? (
        <Text style={[styles.description, {color: theme?.colors.descript}]}>
          code:{code},description:{description}
        </Text>
      ) : null}

      <TouchableOpacity activeOpacity={0.8} onPress={reload}>
        <Text
          style={[
            styles.botton,
            {
              color: theme?.colors.white,
              backgroundColor: theme?.colors.primary,
              borderRadius: theme?.roundness,
            },
          ]}>
          {t('Reload')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  errorView: {
    flex: 1,
    padding: 10,
  },
  title: {
    marginTop: 30,
    fontSize: 20,
  },
  subTitle: {
    marginTop: 20,
    fontSize: 14,
  },
  description: {
    marginTop: 0,
    fontSize: 14,
    textAlign: 'left',
    alignContent: 'flex-start',
  },
  botton: {
    marginTop: 30,
    height: 34,
    lineHeight: 34,
    textAlign: 'center',
  },
});

export default withTheme<ErrorViewProps>(ErrorView, 'ErrorView');
