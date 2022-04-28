import React from 'react';
import {StyleSheet} from 'react-native';
import FieldBase from '@/components/Field/FieldBase';
import Radio from '@/components/Radio';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface FieldRadioProps {
  label: string | number;
  subLabel?: string | number;
  onPress?: (checked: boolean) => void;
  checked?: boolean;
  withoutFeedback?: boolean;
}

const FieldRadio: ThemeFunctionComponent<FieldRadioProps> = props => {
  const {
    label,
    subLabel,
    checked = false,
    withoutFeedback = false,
    onPress = () => {},
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
        return <Radio style={styles.raido} checked={checked} />;
      }}
    />
  );
};

const styles = StyleSheet.create({
  raido: {
    marginRight: 4,
  },
});

export default withTheme<FieldRadioProps>(FieldRadio, 'FieldRadio');
