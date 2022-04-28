import React, {ReactNode, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextStyle,
  ToastAndroid,
  ViewStyle,
  ScrollView,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from '@/components/Icon';
import {useUIState} from '@/stores';
import {ThemeFunctionComponent, withTheme} from '@/theme';
import Modal from './Modal';

export interface ConfirmProps {
  isVisible: boolean;
  title?: string;
  onOk?: () => void;
  onCancel?: () => void;
  content?: string | number;
  renderContent?: () => ReactNode;
  top?: number | string;
  children?: ReactNode;
  loading?: boolean;
  confirmTextStyle?: TextStyle;
  onModalHide?: () => void;
}

const Confirm: ThemeFunctionComponent<ConfirmProps> = props => {
  const {
    title,
    isVisible,
    children,
    onOk = () => {},
    onCancel = () => {},
    content,
    renderContent,
    confirmTextStyle = {},
    onModalHide = () => {},
    loading = false,
    theme,
  } = props;

  const [containerStyle, setContainerStyle] = useState<ViewStyle>();

  const {t} = useTranslation();

  const {dimension} = useUIState();
  useEffect(() => {
    const {containerWidth = 0, containerHeight = 0} = dimension || {};
    setContainerStyle({width: Math.min(containerWidth, containerHeight)});
  }, [dimension]);

  const handleCancel = () => {
    if (loading) {
      ToastAndroid.show(t('Processing, please wait!'), 1000);
      return;
    }
    onCancel();
  };

  const handleOk = () => {
    if (loading) {
      ToastAndroid.show(t('Processing, please wait!'), 1000);
      return;
    }
    onOk();
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn={'fadeIn'}
      animationOut={'fadeOut'}
      onModalHide={onModalHide}>
      <View style={styles.modal}>
        <View style={containerStyle}>
          {title ? (
            <View
              style={[
                styles.header,
                {
                  backgroundColor: theme?.colors.background,
                  borderBottomColor: theme?.colors.underlayColor,
                  borderTopStartRadius: theme?.roundness,
                  borderTopEndRadius: theme?.roundness,
                },
              ]}>
              <Text style={[styles.headerText, {color: theme?.colors.text}]}>
                {title}
              </Text>
            </View>
          ) : null}
          <View
            style={[
              styles.content,
              {
                backgroundColor: theme?.colors.background,
              },
            ]}>
            {renderContent ? renderContent() : null}
            {!renderContent && (content || content === 0) ? (
              <ScrollView
                style={[{maxHeight: dimension.containerHeight / 2 - 100}]}>
                <Text style={[{color: theme?.colors.text}]}>{content}</Text>
              </ScrollView>
            ) : null}
            {!renderContent && !content && content !== 0 ? (
              <View>{children}</View>
            ) : null}
          </View>
          <View
            style={[
              styles.footer,
              {
                backgroundColor: theme?.colors.background,
                borderTopColor: theme?.colors.underlayColor,
                borderBottomStartRadius: theme?.roundness,
                borderBottomEndRadius: theme?.roundness,
              },
            ]}>
            <TouchableOpacity
              style={styles.footerButton}
              activeOpacity={0.3}
              onPress={handleCancel}>
              <Text
                style={[styles.footerButtonText, {color: theme?.colors.text}]}>
                {t('Cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.footerButton}
              activeOpacity={0.3}
              onPress={handleOk}>
              <View
                style={[
                  styles.footerButton,
                  styles.confirmButton,
                  {borderColor: theme?.colors.underlayColor},
                ]}>
                {loading ? (
                  <Icon.Loading color={theme?.colors.primary} />
                ) : null}
                <Text
                  style={[
                    styles.confirmText,
                    {color: theme?.colors.primary},
                    confirmTextStyle,
                  ]}>
                  {t('Confirm')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginHorizontal: 30,
    padding: 10,
    borderBottomWidth: 1,
  },
  headerText: {
    textAlign: 'center',
    fontSize: 16,
  },
  content: {
    marginHorizontal: 30,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  footer: {
    marginHorizontal: 30,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    borderLeftWidth: 1,
  },
  footerButtonText: {
    textAlign: 'center',
    fontSize: 14,
    padding: 10,
  },
  confirmText: {
    textAlign: 'center',
    fontSize: 14,
    padding: 10,
  },
});

export default withTheme<ConfirmProps>(Confirm, 'Confirm');
