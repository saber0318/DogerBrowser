import React from 'react';
import {ScrollView} from 'react-native';
import SendIntentAndroid from 'react-native-send-intent';
import {useTranslation} from 'react-i18next';
import {FieldIcon, FieldDivider, FieldSwitch} from '@/components/Field';
import PageView from '@/components/PageView';
import {useUIState, useUIDispatch} from '@/stores';

const Setting = () => {
  const {
    pagesVisible,
    themeSetting,
    language,
    textZoom,
    mixedContentMode,
    whetherToOpenApp,
    whetherToDownloadFile,
    enableSniffingResources,
  } = useUIState();
  const {settingVisible} = pagesVisible;

  const {t} = useTranslation();

  const {updatePagesVisible, updateEnableSniffingResources} = useUIDispatch();

  const handleOnBack = () => {
    updatePagesVisible({settingVisible: false});
  };

  const handleThemeSetting = () => {
    updatePagesVisible({themeSettingVisible: true});
  };

  const handleLanguage = () => {
    updatePagesVisible({languageVisible: true});
  };

  const handleTextZoom = () => {
    updatePagesVisible({textZoomVisible: true});
  };

  const handleShowHome = () => {
    updatePagesVisible({homePageVisible: true});
  };

  const handleShowSearchEngine = () => {
    updatePagesVisible({searchEngineVisible: true});
  };

  const handleShowUserAgent = () => {
    updatePagesVisible({userAgentVisible: true});
  };

  const handleShowMixedContentMode = () => {
    updatePagesVisible({mixedContentModeVisible: true});
  };

  const handleShowWhetherToOpenApp = () => {
    updatePagesVisible({whetherToOpenAppVisible: true});
  };

  const handleShowWhetherToDownloadFile = () => {
    updatePagesVisible({whetherToDownloadFileVisible: true});
  };

  const handleSetDefaultBrowser = () => {
    SendIntentAndroid.openSettings(
      'android.settings.MANAGE_DEFAULT_APPS_SETTINGS',
    );
  };

  const handleShowConfirmReset = () => {
    updatePagesVisible({resetAppVisible: true});
  };

  return (
    <PageView
      name={t('Setting')}
      isVisible={settingVisible}
      onBack={handleOnBack}>
      <ScrollView>
        <FieldIcon
          label={t('Home page')}
          type="chevron-right"
          onPress={handleShowHome}
        />

        <FieldIcon
          label={t('Search engine')}
          type="chevron-right"
          onPress={handleShowSearchEngine}
        />

        <FieldDivider />

        <FieldIcon
          label={t('User agent')}
          type="chevron-right"
          hint={t('What is user agent')}
          onPress={handleShowUserAgent}
        />

        <FieldDivider />

        <FieldIcon
          label={t('Theme')}
          type="ellipsis1"
          onPress={handleThemeSetting}
          renderLeftText={() => {
            if (themeSetting === 'darkMode') {
              return t('Dark mode');
            }
            if (themeSetting === 'followSystem') {
              return t('Follow system');
            }
            if (themeSetting === 'lightMode') {
              return t('Light mode');
            }
          }}
        />
        <FieldIcon
          label={t('Language')}
          type="ellipsis1"
          onPress={handleLanguage}
          renderLeftText={() => {
            if (language === 'chinese') {
              return '中文';
            }
            if (language === 'english') {
              return 'English';
            }
            if (language === 'none') {
              return t('Default');
            }
          }}
        />
        <FieldIcon
          label={t('Text zoom')}
          type="ellipsis1"
          onPress={handleTextZoom}
          renderLeftText={`${textZoom}%`}
        />

        <FieldDivider />

        <FieldIcon
          label={t('Mixed content mode')}
          type="ellipsis1"
          hint={t('What is mixed content mode')}
          onPress={handleShowMixedContentMode}
          renderLeftText={() => {
            if (mixedContentMode === 'always') {
              return t('Always');
            }
            if (mixedContentMode === 'compatibility') {
              return t('Compatibility');
            }
            if (mixedContentMode === 'never') {
              return t('Never');
            }
          }}
        />
        <FieldIcon
          label={t('Whether to open third party app')}
          type="ellipsis1"
          onPress={handleShowWhetherToOpenApp}
          renderLeftText={() => {
            if (whetherToOpenApp === 'alwaysOpen') {
              return t('Always open');
            }
            if (whetherToOpenApp === 'askEachTime') {
              return t('Ask each time');
            }
            if (whetherToOpenApp === 'neverAllow') {
              return t('Never allow');
            }
          }}
        />
        <FieldIcon
          label={t('Whether to download file')}
          type="ellipsis1"
          onPress={handleShowWhetherToDownloadFile}
          renderLeftText={() => {
            if (whetherToDownloadFile === 'alwaysDownload') {
              return t('Always download');
            }
            if (whetherToDownloadFile === 'askEachTime') {
              return t('Ask each time');
            }
            if (whetherToDownloadFile === 'neverAllow') {
              return t('Never allow');
            }
          }}
        />

        <FieldDivider />

        <FieldSwitch
          label={t('Enable sniffing resources in the tool')}
          checked={enableSniffingResources}
          onPress={(value: boolean) => {
            updateEnableSniffingResources(!value);
          }}
        />

        <FieldDivider />

        <FieldIcon
          label={t('Set as default browser')}
          type="ellipsis1"
          onPress={handleSetDefaultBrowser}
        />

        <FieldDivider />

        <FieldIcon
          label={t('Reset application')}
          type="ellipsis1"
          onPress={handleShowConfirmReset}
        />

        <FieldDivider />
      </ScrollView>
    </PageView>
  );
};

export default Setting;
