import React from 'react';
import {Switch} from 'react-native-switch';
import FieldBase from '@/components/Field/FieldBase';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface FieldSwitchProps {
  label: string | number;
  subLabel?: string | number;
  onPress?: (checked: boolean) => void;
  checked?: boolean;
  withoutFeedback?: boolean;
}

const FieldSwitch: ThemeFunctionComponent<FieldSwitchProps> = props => {
  const {
    label,
    subLabel,
    checked = false,
    withoutFeedback = false,
    onPress = () => {},
    theme,
  } = props;
  return (
    <FieldBase
      label={label}
      subLabel={subLabel}
      touchable={true}
      withoutFeedback={withoutFeedback}
      onPress={() => {
        onPress(checked);
      }}
      renderLeft={() => {
        return (
          <Switch
            value={checked}
            onValueChange={() => {
              onPress(checked);
            }}
            renderActiveText={false}
            renderInActiveText={false}
            circleBorderWidth={0}
            barHeight={16}
            circleSize={20}
            backgroundActive={theme?.colors.grey5}
            backgroundInactive={theme?.colors.grey5}
            circleActiveColor={theme?.colors.lightPrimary}
            circleInActiveColor={theme?.colors.disabled}
          />
        );
      }}
    />
  );
};

export default withTheme<FieldSwitchProps>(FieldSwitch, 'FieldSwitch');
