import React, {useEffect} from 'react';
import {ToastAndroid, ScrollView, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  ClearCache,
  ClearHistory,
  ClearFromData,
  ClearCookie,
} from '@/components/WebView';
import PopConfirm from '@/components/Modal/PopConfirm';
import From, {useForm} from '@/components/Form';
import {useUIState, useUIDispatch} from '@/stores';
import {resetHistory, resetDownload} from '@/servces';

interface ClearDataProps {
  clearCache: ClearCache;
  clearHistory: ClearHistory;
  clearFromData: ClearFromData;
  clearCookie: ClearCookie;
}

const InitialValues = {
  cache: true,
  history: true,
  download: true,
  cookie: true,
  form: false,
};

const ClearData = (props: ClearDataProps) => {
  const {
    clearCache = () => {},
    clearHistory = () => {},
    clearFromData = () => {},
    clearCookie = () => {},
  } = props;

  const {t} = useTranslation();

  const {pagesVisible} = useUIState();
  const {clearDataVisible} = pagesVisible;

  const {updatePagesVisible} = useUIDispatch();

  const [form] = useForm();

  const onBack = () => {
    updatePagesVisible({clearDataVisible: false});
  };

  useEffect(() => {
    if (clearDataVisible) {
      form.setFieldsValue(InitialValues);
    }
  }, [form, clearDataVisible]);

  return (
    <PopConfirm
      isVisible={clearDataVisible}
      title={t('Clear browsing data')}
      onCancel={onBack}
      onOk={async () => {
        await form
          .validator()
          .then(async stores => {
            console.log(stores);
            const {cache, history, download, cookie, formData} = stores;
            if (cache) {
              clearCache(true);
            }
            if (history) {
              clearHistory();
              await resetHistory();
            }
            if (download) {
              await resetDownload();
            }
            if (cookie) {
              clearCookie();
            }
            if (formData) {
              clearFromData();
            }
            ToastAndroid.show(t('Browser data has been cleared'), 1000);
            onBack();
          })
          .catch(err => {
            console.log(err);
          });
      }}>
      <ScrollView style={styles.form}>
        <From form={form} initialValues={InitialValues}>
          <From.ItemCheckbox label={t('Page cache')} name="cache" />
          <From.ItemCheckbox label={t('History')} name="history" />
          <From.ItemCheckbox
            label={t('Download record')}
            name="download"
            desc={t("Won't delete files")}
          />
          <From.ItemCheckbox label="Cookies" name="cookie" />
          <From.ItemCheckbox label={t('Form data')} name="formData" />
        </From>
      </ScrollView>
    </PopConfirm>
  );
};

const styles = StyleSheet.create({
  form: {
    flex: 1,
  },
});
export default ClearData;
