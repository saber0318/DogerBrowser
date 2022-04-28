import React, {useEffect} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import PopConfirm from '@/components/Modal/PopConfirm';
import From, {useForm} from '@/components/Form';
import {useUIState, useUIDispatch} from '@/stores';

export type WhetherToOpenAppType = 'neverAllow' | 'alwaysOpen' | 'askEachTime';

const InitialValues = {
  neverAllow: false,
  alwaysOpen: false,
  askEachTime: false,
};

const WhetherToOpenApp = () => {
  const {t} = useTranslation();

  const {pagesVisible, whetherToOpenApp} = useUIState();
  const {whetherToOpenAppVisible} = pagesVisible;

  const {updatePagesVisible, updateWhetherToOpenApp} = useUIDispatch();

  const [form] = useForm();

  const onBack = () => {
    updatePagesVisible({whetherToOpenAppVisible: false});
  };

  useEffect(() => {
    if (form && whetherToOpenAppVisible && whetherToOpenApp) {
      form.setFieldsValue({...InitialValues, [whetherToOpenApp]: true});
    }
  }, [form, whetherToOpenAppVisible, whetherToOpenApp]);

  const handleOnValuesChange = async (field: typeof InitialValues) => {
    form.setFieldsValue({...InitialValues, ...field});
  };

  return (
    <PopConfirm
      isVisible={whetherToOpenAppVisible}
      title={t('Whether to open third party app')}
      onCancel={onBack}
      onOk={async () => {
        await form
          .validator()
          .then(async stores => {
            console.log(stores);
            const {neverAllow, alwaysOpen, askEachTime} = stores;
            let value = '';
            if (neverAllow) {
              value = 'neverAllow';
            }
            if (alwaysOpen) {
              value = 'alwaysOpen';
            }
            if (askEachTime) {
              value = 'askEachTime';
            }
            if (value) {
              updateWhetherToOpenApp(value);
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
          <From.ItemRadio label={t('Always open')} name="alwaysOpen" />
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
export default WhetherToOpenApp;
