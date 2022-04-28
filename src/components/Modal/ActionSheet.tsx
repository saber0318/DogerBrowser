import React from 'react';
import {StyleSheet, View, Text, TouchableHighlight} from 'react-native';
import {useTranslation} from 'react-i18next';
import {ThemeFunctionComponent, withTheme} from '@/theme';
import Modal from './Modal';
export interface ActionSheetOption {
  name: string;
  value: string;
  onPress?: (item: ActionSheetOption) => void;
}
export interface ActionSheetProps {
  isVisible: boolean;
  title?: string;
  options?: ActionSheetOption[];
  onCancel?: () => void;
  onModalHide?: () => void;
}

const ActionSheet: ThemeFunctionComponent<ActionSheetProps> = props => {
  const {
    isVisible,
    title,
    options = [],
    onCancel = () => {},
    onModalHide = () => {},
    theme,
  } = props;

  const {t} = useTranslation();

  const handleCancel = () => {
    onCancel();
  };

  const handleOnPress = (item: ActionSheetOption) => {
    console.log('handleOnPress', item);
    if (item.onPress) {
      item.onPress(item);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn={'slideInUp'}
      animationOut={'slideOutDown'}
      onBackdropPress={handleCancel}
      onBackButtonPress={handleCancel}
      onModalHide={onModalHide}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme?.colors.underlayColor,
          },
        ]}>
        {title ? (
          <Text
            style={[
              styles.title,
              {
                color: theme?.colors.descript,
                backgroundColor: theme?.colors.background,
              },
            ]}>
            {title}
          </Text>
        ) : null}
        {options.map(item => {
          return (
            <TouchableHighlight
              underlayColor={theme?.colors.underlayColor}
              key={item.value}
              style={[
                styles.optionContainer,
                {backgroundColor: theme?.colors.background},
              ]}
              onPress={() => {
                handleOnPress(item);
              }}>
              <Text style={[{color: theme?.colors.text}]}>{item.name}</Text>
            </TouchableHighlight>
          );
        })}
        <TouchableHighlight
          underlayColor={theme?.colors.underlayColor}
          style={[
            styles.optionContainer,
            styles.cancel,
            {backgroundColor: theme?.colors.background},
          ]}
          onPress={handleCancel}>
          <Text style={[{color: theme?.colors.notification}]}>
            {t('Cancel')}
          </Text>
        </TouchableHighlight>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 0,
  },
  title: {
    padding: 6,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 2,
  },
  optionContainer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 1,
  },
  cancel: {
    marginTop: 6,
  },
});

export default withTheme<ActionSheetProps>(ActionSheet, 'ActionSheet');
