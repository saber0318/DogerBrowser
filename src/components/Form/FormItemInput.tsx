import React, {useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableHighlight,
} from 'react-native';
import {Theme, ThemeFunctionComponent, withTheme} from '@/theme';
import Field from './Field';
import {InternalFieldProps} from './interface';
interface ChildProps {
  [propName: string]: any;
  theme?: Theme;
}

type FormItemInputProps = Omit<InternalFieldProps, 'trigger' | 'children'>;

const WrapTextInput = (props: ChildProps) => {
  const {
    label,
    value,
    error,
    onChangeText,
    desc,
    multiline = false,
    numberOfLines = 1,
    theme,
  } = props;

  const refTextInput = useRef<TextInput>();

  const inputStyle = {
    ...styles.textInput,
    height: multiline ? numberOfLines * 14 : 26,
    borderTopWidth: multiline ? 1 : 0,
    borderLeftWidth: multiline ? 1 : 0,
    borderRightWidth: multiline ? 1 : 0,
    // backgroundColor: 'red',
    color: theme?.colors.text,
    borderColor: error ? theme?.colors.error : theme?.colors.grey3,
  };

  const onPress = () => {
    refTextInput.current?.focus();
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
          <TextInput
            ref={r => {
              if (r) {
                refTextInput.current = r;
              }
            }}
            style={inputStyle}
            onChangeText={onChangeText}
            value={value}
            multiline={multiline}
            numberOfLines={numberOfLines}
          />
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

const FormItemInput: ThemeFunctionComponent<FormItemInputProps> = props => {
  const {label, name, rules = []} = props;
  return (
    <Field label={label} name={name} rules={rules} trigger="onChangeText">
      <WrapTextInput {...props} />
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
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  label: {
    // color: '#666',
    fontSize: 14,
    marginRight: 20,
    // width: 70,
    // textAlign: 'right',
    // backgroundColor: 'red',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 2,
    paddingHorizontal: 4,
    // height: 26,
    // color: '#666',
    borderBottomWidth: 1,
  },
  textContainer: {
    // height: 14,
  },
  desc: {
    // color: '#666',
    fontSize: 12,
    textAlign: 'left',
    flex: 1,
    alignSelf: 'flex-end',
  },
  error: {
    marginLeft: 50,
    // color: '#ee3b4a',
    fontSize: 12,
    marginBottom: 2,
    lineHeight: 14,
    textAlign: 'left',
  },
});

export default withTheme<FormItemInputProps>(FormItemInput, 'FormItemInput');
