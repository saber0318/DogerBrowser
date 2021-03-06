import React, {useEffect, useCallback, useState} from 'react';
import {
  View,
  Text,
  Easing,
  Image,
  // PermissionsAndroid,
  ToastAndroid,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {RNCamera, BarCodeReadEvent} from 'react-native-camera';
import {request, PERMISSIONS} from 'react-native-permissions';
import Modal from '@/components/Modal';
import {useUIState} from '@/stores';
import {ThemeFunctionComponent, withTheme} from '@/theme';

export type OnBarCodeRead = (event: BarCodeReadEvent) => void;

const particleLightSource = require('@/assets/particleLight.png');
const {width: particleLightWidth, height: particleLightHeight} =
  Image.resolveAssetSource(particleLightSource);

interface Props {
  isVisible?: boolean;
  onBack?: () => void;
  onBarCodeRead?: OnBarCodeRead;
}

const WithCamera: ThemeFunctionComponent<Props> = props => {
  const {isVisible, onBack = () => {}, onBarCodeRead = () => {}, theme} = props;

  const [isCameraVisible, setIsCameraVisible] = useState<boolean>(false);

  const [cancelButtonStyle, setCancelButtonStyle] = useState<ViewStyle>({});
  const [particleDimension, setParticleDimension] = useState<{
    width: number;
    height: number;
  }>({width: 0, height: 0});

  const [moveAnim] = useState(new Animated.Value(0));

  const {dimension} = useUIState();

  const {t} = useTranslation();

  useEffect(() => {
    const {statusBarHeight = 0, deviceWidth = 0} = dimension || {};
    setCancelButtonStyle({
      marginTop: statusBarHeight,
    });
    setParticleDimension({
      width: deviceWidth * 0.85,
      height:
        (deviceWidth * 0.85 * particleLightHeight) / (particleLightWidth || 1),
    });
  }, [dimension]);

  const handleOnBack = useCallback(() => {
    setIsCameraVisible(false);
    onBack();
  }, [onBack]);

  const requestCameraPermission = useCallback(
    async (successCallback, errorCallBack) => {
      await request(PERMISSIONS.ANDROID.CAMERA).then(result => {
        if (result !== 'granted') {
          if (typeof successCallback === 'function') {
            successCallback();
          }
          ToastAndroid.show(
            t(
              'Unaffected camera permissions, please allow permission in the system settings!',
            ),
            3000,
          );
        } else {
          if (typeof errorCallBack === 'function') {
            errorCallBack();
          }
        }
      });
    },
    [t],
  );

  useEffect(() => {
    if (isVisible) {
      requestCameraPermission(
        () => {
          handleOnBack();
        },
        () => {
          setIsCameraVisible(true);
        },
      );
    }
  }, [requestCameraPermission, handleOnBack, isVisible]);

  /** ??????????????? */
  const startAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(moveAnim, {
        toValue: 200,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),

      Animated.timing(moveAnim, {
        toValue: -1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => startAnimation());
  }, [moveAnim]);

  useEffect(() => {
    if (isCameraVisible) {
      startAnimation();
    }
  }, [startAnimation, isCameraVisible]);

  const handleOnBarCodeRead = (result: BarCodeReadEvent) => {
    handleOnBack();
    onBarCodeRead(result);
  };

  return (
    <Modal
      isVisible={isCameraVisible}
      onBackdropPress={handleOnBack}
      onBackButtonPress={handleOnBack}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      backdropOpacity={0}>
      <View style={styles.container}>
        <RNCamera
          style={styles.camera}
          autoFocus={RNCamera.Constants.AutoFocus.on} /*????????????*/
          type={RNCamera.Constants.Type.back} /*????????????????????? front???back???*/
          flashMode={RNCamera.Constants.FlashMode.off} /*??????????????????*/
          onBarCodeRead={handleOnBarCodeRead}
        />
        <View
          style={[
            styles.boxContainer,
            // {backgroundColor: theme?.colors.onSurface},
          ]}>
          <TouchableOpacity
            style={[cancelButtonStyle, styles.cancelButtonContainer]}
            activeOpacity={0.3}
            onPress={handleOnBack}>
            <Text
              style={[
                styles.cancelButton,
                {
                  color: theme?.colors.notification,
                  backgroundColor: theme?.colors.onSurface,
                },
              ]}>
              {t('Cancel')}
            </Text>
          </TouchableOpacity>
          <View style={styles.scanContainer}>
            <View
              style={{
                ...styles.scan,
              }}>
              <Animated.Image
                source={particleLightSource}
                style={{
                  marginTop: -particleDimension.height / 2,
                  width: particleDimension.width,
                  height: particleDimension.height,
                  transform: [{translateY: moveAnim}],
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  boxContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  cancelButtonContainer: {
    zIndex: 1,
    marginLeft: 14,
    alignSelf: 'flex-start',
  },
  cancelButton: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  scanContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scan: {
    alignItems: 'center',
    height: 200,
  },
});
export default withTheme<{}>(WithCamera, 'Scan');
