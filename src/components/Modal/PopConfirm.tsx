import React, {ReactNode} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {useTranslation} from 'react-i18next';
import {ThemeFunctionComponent, withTheme} from '@/theme';
import Modal from './Modal';

interface PopConfirmProps {
  isVisible: boolean;
  title?: string;
  onOk?: () => void;
  onCancel?: () => void;
  top?: number | string;
  children?: ReactNode;
  renderHeader?: () => ReactNode;
}

const PopConfirm: ThemeFunctionComponent<PopConfirmProps> = props => {
  const {
    title,
    isVisible,
    children,
    top = '40%',
    onOk = () => {},
    onCancel = () => {},
    renderHeader,
    theme,
  } = props;

  const {t} = useTranslation();

  const handleCancel = () => {
    onCancel();
  };

  const handleOk = () => {
    onOk();
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn={'slideInUp'}
      animationOut={'slideOutDown'}
      onBackdropPress={handleCancel}
      onBackButtonPress={handleCancel}>
      <View
        style={[
          styles.container,
          {
            top: top,
            backgroundColor: theme?.colors.background,
            borderTopStartRadius: theme?.roundness,
            borderTopEndRadius: theme?.roundness,
          },
        ]}>
        {renderHeader ? (
          renderHeader()
        ) : (
          <View
            style={[
              styles.header,
              {
                borderColor: theme?.colors.underlayColor,
                borderTopStartRadius: theme?.roundness,
                borderTopEndRadius: theme?.roundness,
              },
            ]}>
            <Text
              style={[styles.text, {color: theme?.colors.text}]}
              onPress={handleCancel}>
              {t('Cancel')}
            </Text>
            <Text style={[styles.title, {color: theme?.colors.text}]}>
              {title}
            </Text>
            <Text
              style={[styles.text, {color: theme?.colors.primary}]}
              onPress={handleOk}>
              {t('Confirm')}
            </Text>
          </View>
        )}
        {children}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    padding: 6,
  },
  text: {
    padding: 8,
    fontSize: 14,
  },
  title: {
    padding: 8,
    fontSize: 14,
    flexShrink: 1,
    textAlign: 'center',
  },
});

export default withTheme<PopConfirmProps>(PopConfirm, 'PopConfirm');
