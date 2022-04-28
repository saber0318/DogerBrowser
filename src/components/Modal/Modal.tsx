import React, {useState, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import {useUIState} from '@/stores';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface ModalProps {
  isVisible: boolean;
  children?: React.ReactNode;
  animationIn?:
    | 'fadeIn'
    | 'slideInDown'
    | 'slideInUp'
    | 'slideInLeft'
    | 'slideInRight'
    | 'slideOutDown'
    | 'slideOutUp'
    | 'slideOutLeft'
    | 'slideOutRight';
  animationOut?:
    | 'fadeOut'
    | 'slideInDown'
    | 'slideInUp'
    | 'slideInLeft'
    | 'slideInRight'
    | 'slideOutDown'
    | 'slideOutUp'
    | 'slideOutLeft'
    | 'slideOutRight';
  onBackdropPress?: () => void;
  onBackButtonPress?: () => void;
  backdropOpacity?: number;
  onModalHide?: () => void;
}

const Modal: ThemeFunctionComponent<ModalProps> = props => {
  const {
    children,
    animationIn = 'fadeIn',
    animationOut = 'fadeOut',
    backdropOpacity = 0.35,
    onBackdropPress = () => {},
    onBackButtonPress = () => {},
    onModalHide = () => {},
    isVisible = false,
    theme,
  } = props;

  const {dimension} = useUIState();
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const {deviceWidth = 0, deviceHeight = 0} = dimension || {};
    setWidth(deviceWidth);
    setHeight(deviceHeight);
  }, [dimension]);

  return (
    <ReactNativeModal
      animationIn={animationIn}
      animationOut={animationOut}
      style={styles.modal}
      isVisible={isVisible}
      deviceWidth={width}
      deviceHeight={height}
      onBackdropPress={onBackdropPress}
      onBackButtonPress={onBackButtonPress}
      onModalHide={onModalHide}
      backdropColor={theme?.colors.onSurface}
      backdropOpacity={backdropOpacity}
      statusBarTranslucent
      useNativeDriver>
      {children}
    </ReactNativeModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
});

export default withTheme<ModalProps>(Modal, 'Modal');
