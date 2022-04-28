import React from 'react';
import {StyleSheet} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FieldBase from '@/components/Field/FieldBase';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface FieldIconProps {
  label: string | number;
  type: 'chevron-right' | 'ellipsis1';
  subLabel?: string | number;
  hint?: string;
  touchable?: boolean;
  withoutFeedback?: boolean;
  onPress?: () => void;
  renderLeftText?: string;
}

const FieldIcon: ThemeFunctionComponent<FieldIconProps> = props => {
  const {
    label,
    subLabel,
    hint,
    type = 'chevron-right',
    touchable = true,
    withoutFeedback = false,
    onPress = () => {},
    theme,
    renderLeftText,
  } = props;
  return (
    <FieldBase
      label={label}
      subLabel={subLabel}
      hint={hint}
      touchable={touchable}
      withoutFeedback={withoutFeedback}
      onPress={onPress}
      renderLeftText={renderLeftText}
      renderLeft={() => {
        if (type === 'chevron-right') {
          return (
            <EvilIcons
              style={[styles.chevronRight, {color: theme?.colors.descript}]}
              name="chevron-right"
            />
          );
        }
        if (type === 'ellipsis1') {
          return (
            <AntDesign
              style={[styles.ellipsis1, {color: theme?.colors.descript}]}
              name="ellipsis1"
            />
          );
        }
      }}
    />
  );
};

const styles = StyleSheet.create({
  chevronRight: {
    fontSize: 30,
    marginRight: -6,
  },
  ellipsis1: {
    fontSize: 20,
    marginRight: 8,
  },
});

export default withTheme<FieldIconProps>(FieldIcon, 'FieldIcon');
