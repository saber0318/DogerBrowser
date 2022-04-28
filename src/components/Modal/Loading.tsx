import React, {ReactNode} from 'react';
import {StyleSheet, View, Text, TextStyle} from 'react-native';
import Icon from '@/components/Icon';
import {ThemeFunctionComponent, withTheme} from '@/theme';
import Modal from './Modal';

export interface LoadingProps {
  isVisible: boolean;
  content?: any;
  renderContent?: () => ReactNode;
  contentTextStyle?: TextStyle;
  onBackdropPress?: () => void;
  onModalHide?: () => void;
}

const Loading: ThemeFunctionComponent<LoadingProps> = props => {
  const {
    isVisible,
    content,
    renderContent,
    contentTextStyle = {},
    onBackdropPress,
    onModalHide = () => {},
    theme,
  } = props;

  return (
    <Modal
      isVisible={isVisible}
      animationIn={'fadeIn'}
      animationOut={'fadeOut'}
      onBackdropPress={onBackdropPress}
      onModalHide={onModalHide}>
      <View style={styles.modal}>
        {renderContent ? (
          renderContent()
        ) : (
          <View style={styles.content}>
            <Icon.Loading color={theme?.colors.white} />
            {content && content !== 0 ? (
              <Text
                style={{
                  color: theme?.colors.white,
                  ...styles.contentText,
                  ...contentTextStyle,
                }}>
                {content}
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    padding: 10,
  },
});

export default withTheme<LoadingProps>(Loading, 'Loading');
