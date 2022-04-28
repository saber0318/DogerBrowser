import React, {useEffect} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import PopConfirm from '@/components/Modal/PopConfirm';
import From, {useForm} from '@/components/Form';
import DescText from '@/components/DescText';
import {useUIState, useUIDispatch} from '@/stores';

export type MixedContentModeType = 'never' | 'always' | 'compatibility';

const InitialValues = {
  never: false,
  always: false,
  compatibility: false,
};

const MixedContentMode = () => {
  const {t} = useTranslation();

  const {pagesVisible, mixedContentMode} = useUIState();
  const {mixedContentModeVisible} = pagesVisible;

  const {updatePagesVisible, updateMixedContentMode} = useUIDispatch();

  const [form] = useForm();

  const onBack = () => {
    updatePagesVisible({mixedContentModeVisible: false});
  };

  useEffect(() => {
    if (form && mixedContentModeVisible && mixedContentMode) {
      form.setFieldsValue({...InitialValues, [mixedContentMode]: true});
    }
  }, [form, mixedContentModeVisible, mixedContentMode]);

  const handleOnValuesChange = async (field: typeof InitialValues) => {
    form.setFieldsValue({...InitialValues, ...field});
  };

  return (
    <PopConfirm
      isVisible={mixedContentModeVisible}
      title={t('Mixed content mode')}
      onCancel={onBack}
      onOk={async () => {
        await form
          .validator()
          .then(async stores => {
            console.log(stores);
            const {never, always, compatibility} = stores;
            let value = '';
            if (never) {
              value = 'never';
            }
            if (always) {
              value = 'always';
            }
            if (compatibility) {
              value = 'compatibility';
            }
            if (value) {
              updateMixedContentMode(value);
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
          <From.ItemRadio label={t('Never')} name="never" />
          <From.ItemRadio label={t('Always')} name="always" />
          <From.ItemRadio label={t('Compatibility')} name="compatibility" />
        </From>
        <DescText
          desc={[
            t('What is mixed content mode'),
            t('What is mixed content mode', {context: 'Never'}),
            t('What is mixed content mode', {context: 'Always'}),
            t('What is mixed content mode', {context: 'Compatibility'}),
          ]}
        />
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
export default MixedContentMode;
