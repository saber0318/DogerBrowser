import React from 'react';
import {StyleSheet, Text, ToastAndroid} from 'react-native';
import {useTranslation} from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import FieldBase from '@/components/Field/FieldBase';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface FieldTextProps {
  label: string | number;
  content: string | number;
  subLabel?: string | number;
  onPress?: () => void;
  touchable?: boolean;
  clipboard?: boolean; // 是否允许点击复制内容
  withoutFeedback?: boolean;
  clipboardText?: string;
}

const FieldText: ThemeFunctionComponent<FieldTextProps> = props => {
  const {
    label,
    subLabel,
    content,
    clipboardText,
    touchable = true,
    clipboard = false,
    withoutFeedback = false,
    onPress = () => {},
    theme,
  } = props;
  const {t} = useTranslation();

  return (
    <FieldBase
      label={label}
      subLabel={subLabel}
      touchable={touchable || clipboard}
      withoutFeedback={withoutFeedback}
      onPress={() => {
        if (clipboard) {
          Clipboard.setString(String(content));
          ToastAndroid.show(
            clipboardText
              ? clipboardText
              : t('{{text}} copied to clipboard', {text: String(label)}),
            1000,
          );
        }
        onPress();
      }}
      renderLeft={() => {
        return (
          <Text style={[styles.content, {color: theme?.colors.descript}]}>
            {content}
          </Text>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    fontSize: 14,
  },
});

export default withTheme<FieldTextProps>(FieldText, 'FieldText');
