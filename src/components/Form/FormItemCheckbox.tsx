import React from 'react';
import {StyleSheet, View, Text, TouchableHighlight} from 'react-native';
import Checkbox from '@/components/Checkbox';
import {Theme, ThemeFunctionComponent, withTheme} from '@/theme';
import Field from './Field';
import {InternalFieldProps} from './interface';
interface ChildProps {
  [propName: string]: any;
  theme?: Theme;
}

type FormItemCheckboxProps = Omit<InternalFieldProps, 'trigger' | 'children'>;

const Wrap = (props: ChildProps) => {
  const {label, value, error, onChange = () => {}, desc, theme} = props;

  const onPress = () => {
    onChange(!value);
  };

  return (
    <View
      style={[
        styles.formItemContainer,
        {borderBottomColor: theme?.colors.underlayColor},
      ]}>
      <TouchableHighlight
        underlayColor={theme?.colors.underlayColor}
        onPress={onPress}>
        <View style={styles.formItem}>
          <Text style={[styles.label, {color: theme?.colors.text}]}>
            {label}
          </Text>
          {desc ? (
            <Text style={[styles.desc, {color: theme?.colors.descript}]}>
              {' ' + desc}
            </Text>
          ) : null}
          <Checkbox checked={value} />
        </View>
      </TouchableHighlight>

      <View style={styles.textContainer}>
        {error ? (
          <Text style={[styles.error, {color: theme?.colors.error}]}>
            {error.join('、')}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const FormItemCheckbox: ThemeFunctionComponent<
  FormItemCheckboxProps
> = props => {
  const {label, name, rules = []} = props;
  return (
    <Field label={label} name={name} rules={rules} trigger="onChange">
      <Wrap {...props} />
    </Field>
  );
};

const styles = StyleSheet.create({
  formItemContainer: {
    marginHorizontal: 20,
    borderBottomWidth: 1,
  },
  formItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 14,
  },
  textContainer: {
    // height: 14,
  },
  desc: {
    fontSize: 12,
    textAlign: 'left',
    flex: 1,
    alignSelf: 'flex-end',
  },
  error: {
    marginLeft: 70,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 14,
    textAlign: 'left',
  },
});

export default withTheme<FormItemCheckboxProps>(
  FormItemCheckbox,
  'FormItemCheckbox',
);
