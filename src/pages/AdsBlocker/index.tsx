import React, {useState} from 'react';
import {ScrollView, ToastAndroid} from 'react-native';
import {useTranslation} from 'react-i18next';
import PageView from '@/components/PageView';
import {createActionSheet, Loading} from '@/components/Modal';
import {FieldIcon, FieldSwitch} from '@/components/Field';
import {useUIState, useUIDispatch} from '@/stores';
import {ThemeFunctionComponent, withTheme} from '@/theme';
import {
  saveNetworkDataToEngine,
  saveLocalDataToEngine,
  getAdsBlockerEngine,
} from '@/servces';
import FilterEngine from '@cliqz/adblocker/dist/types/src/engine/engine';

export type AdsBlocker = {
  engine: FilterEngine;
  time: string;
};

const AdsBlocker: ThemeFunctionComponent<{}> = () => {
  const [loading, setLoading] = useState<{
    isVisible: boolean;
    content?: string;
  }>({
    isVisible: false,
  });
  const {pagesVisible, enableBlockAds, adsBlocker} = useUIState();
  const {adsBlockerVisible} = pagesVisible;

  const {t} = useTranslation();

  const {updatePagesVisible, updateEnableBlockAds, updateAdsBlocker} =
    useUIDispatch();

  const onBack = () => {
    updatePagesVisible({adsBlockerVisible: false});
  };

  return (
    <PageView
      name={t('Ads blocker')}
      isVisible={adsBlockerVisible}
      onBack={onBack}>
      <ScrollView>
        <FieldSwitch
          label={t('Block ads')}
          type="ellipsis1"
          checked={enableBlockAds}
          onPress={(value: boolean) => {
            updateEnableBlockAds(!value);
          }}
        />
        <FieldIcon
          label={t('Manage rules')}
          type="ellipsis1"
          onPress={() => {
            const actionSheet = createActionSheet({
              title: t('Rule update time: {{text}}', {text: adsBlocker.time}),
              options: [
                {
                  name: t('Use default rules'),
                  value: 'local',
                  onPress: async () => {
                    actionSheet.close();
                    setLoading({
                      isVisible: true,
                      content: t('Updating'),
                    });
                    const s = await saveLocalDataToEngine();
                    if (s.code !== 200) {
                      setLoading({
                        isVisible: false,
                      });
                      ToastAndroid.show(
                        t('{{text}} failed!', {text: t('Update')}),
                        1000,
                      );
                      return;
                    }

                    const r = await getAdsBlockerEngine();
                    if (r.code !== 200) {
                      setLoading({
                        isVisible: false,
                      });
                      ToastAndroid.show(
                        t('{{text}} failed!', {text: t('Update')}),
                        1000,
                      );
                      return;
                    }
                    setLoading({
                      isVisible: false,
                    });
                    ToastAndroid.show(
                      t('{{text}} succeed!', {text: t('Update')}),
                      1000,
                    );
                    updateAdsBlocker(r.data);
                  },
                },
                {
                  name: t('Update rule'),
                  value: 'update',
                  onPress: async () => {
                    actionSheet.close();
                    // ToastAndroid.show('正在更新', 1000);
                    setLoading({
                      isVisible: true,
                      content: t('Updating'),
                    });
                    const s = await saveNetworkDataToEngine();
                    if (s.code !== 200) {
                      setLoading({
                        isVisible: false,
                      });
                      ToastAndroid.show(
                        t('{{text}} failed!', {text: t('Update')}),
                        1000,
                      );
                      return;
                    }

                    const r = await getAdsBlockerEngine();
                    if (r.code !== 200) {
                      setLoading({
                        isVisible: false,
                      });
                      ToastAndroid.show(
                        t('{{text}} failed!', {text: t('Update')}),
                        1000,
                      );
                      return;
                    }
                    setLoading({
                      isVisible: false,
                    });
                    ToastAndroid.show(
                      t('{{text}} succeed!', {text: t('Update')}),
                      1000,
                    );
                    updateAdsBlocker(r.data);
                  },
                },
              ],
            });
          }}
        />
      </ScrollView>
      <Loading isVisible={loading.isVisible} content={loading.content} />
    </PageView>
  );
};

export default withTheme<{}>(AdsBlocker, 'AdsBlocker');
