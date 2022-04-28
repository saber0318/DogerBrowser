import React from 'react';
import {ScrollView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  FieldIcon,
  // FieldSwitch,
} from '@/components/Field';
import PageView from '@/components/PageView';
import {useUIState, useUIDispatch} from '@/stores';

const Tool = () => {
  const {
    pagesVisible,
    enableSniffingResources,
    // enableBlockAds,
  } = useUIState();
  const {toolVisible} = pagesVisible;

  const {t} = useTranslation();

  const {
    updatePagesVisible,
    // updateEnableBlockAds,
  } = useUIDispatch();

  const handleOnPageBack = () => {
    updatePagesVisible({toolVisible: false});
  };

  return (
    <PageView
      name={t('Tool')}
      isVisible={toolVisible}
      onBack={handleOnPageBack}>
      <ScrollView>
        <FieldIcon
          label={t('Scan')}
          type="ellipsis1"
          onPress={() => updatePagesVisible({scanVisible: true})}
        />
        <FieldIcon
          label={t('Ads blocker')}
          hint={t(
            'Only use Adblock Plus to hide the elements indicated in EasylistChina.text, do not filter resources and prevent pop-ups.',
          )}
          type="chevron-right"
          onPress={() => {
            updatePagesVisible({adsBlockerVisible: true});
          }}
        />
        {enableSniffingResources ? (
          <FieldIcon
            label={t('Sniff resources')}
            hint={t('Get video resources from current page.')}
            type="chevron-right"
            onPress={() => {
              updatePagesVisible({sniffResourcesVisible: true});
            }}
          />
        ) : null}
      </ScrollView>
    </PageView>
  );
};

export default Tool;
