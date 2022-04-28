import React, {useEffect, useState} from 'react';
import {ScrollView, ToastAndroid} from 'react-native';
import {useTranslation} from 'react-i18next';
import DeviceInfo from 'react-native-device-info';
import PageView from '@/components/PageView';
import {FieldText, FieldIcon} from '@/components/Field';
import {SetCurrentWebViewSource} from '@/components/WebView';
import {useUIState, useUIDispatch} from '@/stores';

interface AboutProps {
  setCurrentWebViewSource?: SetCurrentWebViewSource;
}

const About = (props: AboutProps) => {
  const {setCurrentWebViewSource = () => {}} = props;
  const [count, setCount] = useState<number>(0);

  const {pagesVisible} = useUIState();
  const {aboutVisible} = pagesVisible;

  const {t} = useTranslation();

  const {updatePagesVisible, hidePages} = useUIDispatch();

  // useEffect监听isVisible某些情况下设置未生效
  const onBack = () => {
    updatePagesVisible({aboutVisible: false});
  };

  // 小彩蛋
  useEffect(() => {
    if (count === 5) {
      ToastAndroid.show(
        Math.random() >= 0.5 ? '众里寻她千百度' : '怦然心动',
        1000,
      );
    }
  }, [count]);

  const handleVersionPress = () => {
    setCount(count + 1);
    setTimeout(() => {
      setCount(0);
    }, 1000);
  };

  return (
    <PageView name={t('About')} isVisible={aboutVisible} onBack={onBack}>
      <ScrollView>
        <FieldText
          label={t('Application name')}
          content={DeviceInfo.getApplicationName()}
          withoutFeedback={true}
          onPress={handleVersionPress}
        />
        <FieldText
          label={t('Version')}
          content={DeviceInfo.getVersion()}
          withoutFeedback={true}
          onPress={handleVersionPress}
        />
        <FieldText
          label={t('Problem feedback')}
          content="saber0318@outlook.com"
          clipboard={true}
          clipboardText={t('{{text}} copied to clipboard', {
            text: t('Email address'),
          })}
        />
        <FieldIcon
          label={'Github'}
          type="chevron-right"
          onPress={() => {
            hidePages();
            setCurrentWebViewSource({
              uri: 'https://github.com/saber0318',
            });
          }}
        />
        <FieldIcon
          label={t('User agreement')}
          type="chevron-right"
          onPress={() => {
            hidePages();
            setCurrentWebViewSource({
              uri: 'https://saber0318.github.io/agreements/user-service',
            });
          }}
        />
        <FieldIcon
          label={t('Privacy policy')}
          type="chevron-right"
          onPress={() => {
            hidePages();
            setCurrentWebViewSource({
              uri: 'https://saber0318.github.io/agreements/privacy-policy',
            });
          }}
        />
      </ScrollView>
    </PageView>
  );
};

export default About;
