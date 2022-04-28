/**
 * base on
 * https://blog.csdn.net/qq_38356174/article/details/95360470
 * https://blog.csdn.net/xukongjing1/article/details/102522392
 */
import React, {useCallback, useState} from 'react';
import {ToastAndroid} from 'react-native';
import {useTranslation} from 'react-i18next';
import ImagePicker from 'react-native-image-crop-picker';
import {readerQR} from 'react-native-lewin-qrcode';
import {request, PERMISSIONS} from 'react-native-permissions';
import Clipboard from '@react-native-clipboard/clipboard';
import ActionSheet from '@/components/Modal/ActionSheet';
import {SetCurrentWebViewSource} from '@/components/WebView';
import {ThemeFunctionComponent, withTheme} from '@/theme';
import {useUIState, useUIDispatch} from '@/stores';
import {getProcessedUrl} from '@/utils';
import WithCamera, {OnBarCodeRead} from './WithCamera';

interface Props {
  setCurrentWebViewSource?: SetCurrentWebViewSource;
}

const Scan: ThemeFunctionComponent<Props> = props => {
  const {setCurrentWebViewSource} = props;
  const {pagesVisible} = useUIState();
  const {updatePagesVisible, hidePages} = useUIDispatch();
  const {scanVisible} = pagesVisible;

  const [isWithCameraVisible, setIsWithCameraVisible] =
    useState<boolean>(false);

  const [isDataModalVisible, setDataModalVisible] = useState<boolean>(false);
  const [data, setData] = useState<string>('');

  const {t} = useTranslation();

  const handleOnCancel = () => {
    updatePagesVisible({scanVisible: false});
  };

  const recoginze = useCallback(
    async (path: string) => {
      readerQR(path)
        .then((d: string) => {
          console.log('识别结果', d);
          setData(d);
          setDataModalVisible(true);
        })
        .catch((err: any) => {
          console.log('识别失败', err);
          ToastAndroid.show(t('Fail to scan'), 1000);
        });
    },
    [t],
  );

  const openImagePicker = useCallback(() => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: false,
      includeBase64: true,
    })
      .then(image => {
        console.log('image', image);
        recoginze(image.path);
      })
      .catch(err => {
        console.log('err', err);
      });
  }, [recoginze]);

  const requestReadPermission = useCallback(
    async errorCallback => {
      await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE).then(result => {
        if (result !== 'granted') {
          ToastAndroid.show(
            t(
              'Unaffected read permissions, please allow permission in the system settings!',
            ),
            3000,
          );
        } else {
          if (typeof errorCallback === 'function') {
            errorCallback();
          }
        }
      });
    },
    [t],
  );

  const handleWithCameraOnBack = useCallback(() => {
    setIsWithCameraVisible(false);
  }, []);

  const handleDataModalOnCancel = () => {
    setDataModalVisible(false);
  };

  const handleOnBarCodeRead = useCallback<OnBarCodeRead>(event => {
    console.log(event);
    const {data: d} = event;
    setIsWithCameraVisible(false);
    setData(d);
    setDataModalVisible(true);
  }, []);

  return (
    <>
      <ActionSheet
        isVisible={scanVisible}
        title={t('Scan')}
        onCancel={handleOnCancel}
        options={[
          {
            name: t('Select from album'),
            value: 'album',
            onPress: () => {
              handleOnCancel();
              requestReadPermission(() => {
                openImagePicker();
              });
            },
          },
          {
            name: t('Scan with camera'),
            value: 'camera',
            onPress: () => {
              handleOnCancel();
              setIsWithCameraVisible(true);
            },
          },
        ]}
      />
      <WithCamera
        isVisible={isWithCameraVisible}
        onBack={handleWithCameraOnBack}
        onBarCodeRead={handleOnBarCodeRead}
      />
      <ActionSheet
        isVisible={isDataModalVisible}
        title={data}
        onCancel={handleDataModalOnCancel}
        options={[
          {
            name: t('Search or Open'),
            value: 'open',
            onPress: async () => {
              setDataModalVisible(false);
              setIsWithCameraVisible(false);
              hidePages();
              if (setCurrentWebViewSource) {
                const uri = await getProcessedUrl(data);
                setCurrentWebViewSource({uri});
              }
            },
          },
          {
            name: t('Copy {{text}}', {text: t('Text')}),
            value: 'copy',
            onPress: () => {
              setDataModalVisible(false);
              setIsWithCameraVisible(false);
              Clipboard.setString(data);
              ToastAndroid.show(
                t('{{text}} copied to clipboard', {text: t('Text')}),
                1000,
              );
            },
          },
        ]}
      />
    </>
  );
};

export default withTheme<Props>(Scan, 'Scan');
