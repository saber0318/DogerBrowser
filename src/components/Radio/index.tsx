import React from 'react';
import {
  View,
  TouchableWithoutFeedback,
  ColorValue,
  ViewStyle,
} from 'react-native';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface RadioProps {
  checked?: boolean;
  disabled?: boolean;
  size?: number;
  color?: ColorValue;
  checkedColor?: ColorValue;
  disabledColor?: ColorValue;
  style?: ViewStyle;
  onChange?: (value: boolean) => void;
}

const Radio: ThemeFunctionComponent<RadioProps> = props => {
  const {
    style = {},
    checked = false,
    disabled = false,
    size = 18,
    color,
    checkedColor,
    disabledColor,
    onChange,
    theme,
  } = props;

  const detaultStyle = {
    width: size,
    height: size,
    borderRadius: size,
    borderWidth: 1,
    borderColor: disabled
      ? disabledColor ?? theme?.colors.disabled
      : color ?? theme?.colors.descript,
  };

  const checkedStyle = {
    width: size,
    height: size,
    borderRadius: size,
    borderWidth: 4,
    borderColor: disabled
      ? disabledColor ?? theme?.colors.disabled
      : checkedColor ?? theme?.colors.primary,
  };

  return (
    <View pointerEvents={onChange ? 'box-none' : 'none'} style={style}>
      <TouchableWithoutFeedback
        onPress={() => {
          if (disabled || checked) {
            return;
          }
          onChange && onChange(true); // 只允许 false 变为 true
        }}>
        <View style={checked ? checkedStyle : detaultStyle} />
      </TouchableWithoutFeedback>
    </View>
  );
};

export default withTheme<RadioProps>(Radio, 'Radio');
