import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableWithoutFeedback,
  ColorValue,
} from 'react-native';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface CheckboxProps {
  style?: ViewStyle;
  innerPadding?: number;
  size?: number;
  checked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  indeterminateColor?: ColorValue;
  onChange?: (value: boolean) => void;
}

const Checkbox: ThemeFunctionComponent<CheckboxProps> = props => {
  const {
    checked = false,
    size = 20,
    innerPadding = 4,
    style = {},
    disabled = false,
    indeterminate = false,
    indeterminateColor,
    theme,
    onChange,
  } = props;
  const layoutStyle = {
    width: size,
    height: size,
  };
  const boxStyle = {
    width: size - innerPadding,
    height: size - innerPadding,
  };
  return (
    <View pointerEvents={onChange ? 'box-none' : 'none'}>
      <TouchableWithoutFeedback
        onPress={() => {
          if (disabled) {
            return;
          }
          onChange && onChange(!checked);
        }}>
        <>
          {disabled ? (
            <View
              style={[
                styles.checkBox,
                layoutStyle,
                {
                  borderColor: theme?.colors.descript,
                  borderRadius: theme?.roundness,
                },
                style,
              ]}>
              <View
                style={[
                  styles.slash,
                  {
                    backgroundColor: theme?.colors.descript,
                  },
                ]}
              />
            </View>
          ) : null}
          {!disabled && !checked ? (
            <View
              style={[
                styles.checkBox,
                layoutStyle,
                {
                  borderColor: theme?.colors.descript,
                  borderRadius: theme?.roundness,
                },
                style,
              ]}
            />
          ) : null}
          {!disabled && indeterminate && checked ? (
            <View
              style={[
                styles.checkBox,
                layoutStyle,
                {
                  borderColor: theme?.colors.primary,
                  borderRadius: theme?.roundness,
                },
                style,
              ]}>
              <View
                style={[
                  styles.checkedBox,
                  boxStyle,
                  {
                    backgroundColor: theme?.colors.primary,
                    borderRadius: Math.max(
                      (theme?.roundness || 0) - styles.checkedBox.width,
                      0,
                    ),
                  },
                ]}>
                <View
                  style={[
                    styles.indeterminate,
                    {
                      backgroundColor:
                        indeterminateColor ?? theme?.colors.background,
                    },
                  ]}
                />
              </View>
            </View>
          ) : null}
          {!disabled && !indeterminate && checked ? (
            <View
              style={[
                styles.checkedBoxContainer,
                layoutStyle,
                {
                  borderColor: theme?.colors.primary,
                  borderRadius: theme?.roundness,
                },
                style,
              ]}>
              <View
                style={[
                  styles.checkedBox,
                  boxStyle,
                  {
                    backgroundColor: theme?.colors.primary,
                    borderRadius: Math.max(
                      (theme?.roundness || 0) - styles.checkedBox.width,
                      0,
                    ),
                  },
                ]}
              />
            </View>
          ) : null}
        </>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  checkBox: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slash: {
    height: 1,
    width: '141.4%',
    transform: [{rotateZ: '-45deg'}],
  },
  checkedBoxContainer: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    width: 2,
    height: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indeterminate: {
    width: 12,
    height: 2,
  },
});

export default withTheme<CheckboxProps>(Checkbox, 'Checkbox');
