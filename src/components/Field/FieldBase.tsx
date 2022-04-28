import React, {ReactNode} from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Text,
  // ToastAndroid,
} from 'react-native';
import {useTranslation, TFunction} from 'react-i18next';
import {createAlert} from '@/components/Modal';
import {Theme, ThemeFunctionComponent, withTheme} from '@/theme';

interface FieldBaseProps {
  label: string | number;
  subLabel?: string | number;
  onPress?: () => void;
  touchable?: boolean;
  withoutFeedback?: boolean;
  children?: ReactNode;
  hint?: string;
  renderLeft?: () => ReactNode;
  renderLeftText?: string | Function; // 当renderLeftText存在时，renderLeft失效
}

const showHint = (title: string, hint: string) => {
  createAlert({
    title: title,
    content: hint,
  });
};

const renderField = (props: FieldBaseProps & {theme?: Theme; t: TFunction}) => {
  const {
    label,
    subLabel,
    children,
    renderLeft = () => {},
    renderLeftText,
    hint,
    theme,
    t,
  } = props;
  return children ? (
    <View style={styles.item}>{children}</View>
  ) : (
    <View style={styles.item}>
      <View style={styles.container}>
        <View style={styles.labelContainer}>
          <Text
            style={[styles.label, {color: theme?.colors.text}]}
            numberOfLines={1}>
            {label}
          </Text>
          {hint ? (
            <TouchableWithoutFeedback onPress={() => showHint(t('Hint'), hint)}>
              <View>
                <Text style={[styles.hintText, {color: theme?.colors.text}]}>
                  ?
                </Text>
              </View>
            </TouchableWithoutFeedback>
          ) : null}
        </View>

        {subLabel || subLabel === 0 || subLabel === '' ? (
          <Text
            style={[styles.subLabel, {color: theme?.colors.descript}]}
            numberOfLines={1}>
            {subLabel}
          </Text>
        ) : null}
      </View>
      {renderLeftText ? (
        <Text style={[styles.hintText, {color: theme?.colors.descript}]}>
          {typeof renderLeftText === 'function'
            ? renderLeftText()
            : renderLeftText}
        </Text>
      ) : (
        renderLeft()
      )}
    </View>
  );
};

const FieldBase: ThemeFunctionComponent<FieldBaseProps> = props => {
  const {
    onPress = () => {},
    touchable = true,
    withoutFeedback = false,
    theme,
  } = props;
  const {t} = useTranslation();
  if (touchable && !withoutFeedback) {
    return (
      <View pointerEvents="box-none">
        <TouchableHighlight
          underlayColor={theme?.colors.underlayColor}
          onPress={onPress}>
          {renderField({...props, t})}
        </TouchableHighlight>
      </View>
    );
  }
  if (touchable && withoutFeedback) {
    return (
      <TouchableWithoutFeedback onPress={onPress}>
        {renderField({...props, t})}
      </TouchableWithoutFeedback>
    );
  }
  return renderField({...props, t});
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingTop: 16,
    paddingRight: 10,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
  },
  labelContainer: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
  },
  subLabel: {
    fontSize: 12,
    marginRight: 20,
  },
  hintText: {
    paddingHorizontal: 4,
  },
});

export default withTheme<FieldBaseProps>(FieldBase, 'FieldBase');
