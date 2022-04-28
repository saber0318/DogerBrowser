import React, {useEffect} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import PopConfirm from '@/components/Modal/PopConfirm';
import From, {useForm} from '@/components/Form';
import {useUIState, useUIDispatch} from '@/stores';

export type WhetherToDownloadFileType =
  | 'neverAllow'
  | 'alwaysDownload'
  | 'askEachTime';

const InitialValues = {
  neverAllow: false,
  alwaysDownload: false,
  askEachTime: false,
};

const WhetherToDownloadFile = () => {
  const {t} = useTranslation();

  const {pagesVisible, whetherToDownloadFile} = useUIState();
  const {whetherToDownloadFileVisible} = pagesVisible;

  const {updatePagesVisible, updateWhetherToDownloadFile} = useUIDispatch();

  const [form] = useForm();

  const onBack = () => {
    updatePagesVisible({whetherToDownloadFileVisible: false});
  };

  useEffect(() => {
    if (form && whetherToDownloadFileVisible && whetherToDownloadFile) {
      form.setFieldsValue({...InitialValues, [whetherToDownloadFile]: true});
    }
  }, [form, whetherToDownloadFileVisible, whetherToDownloadFile]);

  const handleOnValuesChange = async (field: typeof InitialValues) => {
    form.setFieldsValue({...InitialValues, ...field});
  };

  return (
    <PopConfirm
      isVisible={whetherToDownloadFileVisible}
      title={t('Whether to download file')}
      onCancel={onBack}
      onOk={async () => {
        await form
          .validator()
          .then(async stores => {
            console.log(stores);
            const {neverAllow, alwaysDownload, askEachTime} = stores;
            let value = '';
            if (neverAllow) {
              value = 'neverAllow';
            }
            if (alwaysDownload) {
              value = 'alwaysDownload';
            }
            if (askEachTime) {
              value = 'askEachTime';
            }
            if (value) {
              updateWhetherToDownloadFile(value);
            }
            onBack();
          })
          .catch(err => {
            console.log(err);
          });
      }}>
      <ScrollView style={styles.form}>
        <From
          form={form}
          initialValues={InitialValues}
          onValuesChange={handleOnValuesChange}>
          <From.ItemRadio label={t('Never allow')} name="neverAllow" />
          <From.ItemRadio label={t('Always download')} name="alwaysDownload" />
          <From.ItemRadio label={t('Ask each time')} name="askEachTime" />
        </From>
      </ScrollView>
    </PopConfirm>
  );
};

const styles = StyleSheet.create({
  item: {
    flex: 1,
  },
  form: {
    flex: 1,
  },
});
export default WhetherToDownloadFile;
