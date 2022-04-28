import React from 'react';
import {ScrollView} from 'react-native';
// import SendIntentAndroid from 'react-native-send-intent';
import {useTranslation} from 'react-i18next';
import {FieldIcon, FieldDivider, FieldSwitch} from '@/components/Field';
import PageView from '@/components/PageView';
import {useUIState, useUIDispatch} from '@/stores';

const CustomControl = () => {
  const {pagesVisible, incognitoMode} = useUIState();
  const {customControlVisible} = pagesVisible;

  const {t} = useTranslation();

  const {updatePagesVisible, updateIncognitoMode} = useUIDispatch();

  const handleOnBack = () => {
    updatePagesVisible({customControlVisible: false});
  };

  const handleShowBookmark = () => {
    updatePagesVisible({bookmarkVisible: true});
  };

  const handleShowDownload = () => {
    updatePagesVisible({downloadVisible: true});
  };

  // const handleOpenDownloadManager = () => {
  //   SendIntentAndroid.openDownloadManager();
  // };

  const handleShowHistory = () => {
    updatePagesVisible({historyVisible: true});
  };

  const handleTool = () => {
    updatePagesVisible({toolVisible: true});
  };

  const handleShowSetting = () => {
    updatePagesVisible({settingVisible: true});
  };

  const handleShowClearData = () => {
    updatePagesVisible({clearDataVisible: true});
  };

  const handleIncognitoModePress = async (value: boolean) => {
    updateIncognitoMode(!value);
  };

  // const handleShowConfirmReset = () => {
  //   updatePagesVisible({resetAppVisible: true});
  // };

  const handleShowAbout = () => {
    updatePagesVisible({aboutVisible: true});
  };

  return (
    <PageView
      name={t('Custom and Control')}
      isVisible={customControlVisible}
      // left={'50%'}
      onBack={handleOnBack}>
      <ScrollView>
        <FieldIcon
          label={t('Favorites')}
          type="chevron-right"
          onPress={handleShowBookmark}
        />

        <FieldDivider />

        <FieldIcon
          label={t('Download record')}
          type="chevron-right"
          onPress={handleShowDownload}
        />

        {/* <FieldIcon
          label={t('Download manager')}
          type="chevron-right"
          onPress={handleOpenDownloadManager}
        /> */}

        <FieldIcon
          label={t('History')}
          type="chevron-right"
          onPress={handleShowHistory}
        />

        <FieldDivider />

        <FieldIcon
          label={t('Clear browsing data')}
          type="ellipsis1"
          onPress={handleShowClearData}
        />

        <FieldDivider />

        <FieldSwitch
          checked={incognitoMode}
          label={t('Incognito mode')}
          onPress={handleIncognitoModePress}
        />

        <FieldDivider />

        <FieldIcon
          label={t('Tool')}
          type="chevron-right"
          onPress={handleTool}
        />

        <FieldDivider />

        <FieldIcon
          label={t('Setting')}
          type="chevron-right"
          onPress={handleShowSetting}
        />

        {/* <FieldDivider />

        <FieldIcon
          label={t('Reset application')}
          type="ellipsis1"
          onPress={handleShowConfirmReset}
        /> */}

        <FieldDivider />

        <FieldIcon
          label={t('About')}
          type="chevron-right"
          onPress={handleShowAbout}
        />

        <FieldDivider />
      </ScrollView>
    </PageView>
  );
};

export default CustomControl;
