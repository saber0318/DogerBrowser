import React, {useEffect, useState} from 'react';
import {ScrollView, Text, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import PopConfirm from '@/components/Modal/PopConfirm';
import From, {useForm} from '@/components/Form';
import DescText from '@/components/DescText';
import {useUIState, useUIDispatch} from '@/stores';

const InitialValues = {
  fifty: false,
  seventyFive: false,
  hundred: false,
  hundredAndFifty: false,
};

const TextZoom = () => {
  const {t} = useTranslation();

  const {pagesVisible, textZoom} = useUIState();
  const [previewTextZoom, setPreviewTextZoom] = useState<number>(textZoom);
  const {textZoomVisible} = pagesVisible;

  const {updatePagesVisible, updateTextZoom} = useUIDispatch();

  const [form] = useForm();

  const onBack = () => {
    updatePagesVisible({textZoomVisible: false});
  };

  useEffect(() => {
    if (form && textZoomVisible && textZoom) {
      if (textZoom === 50) {
        form.setFieldsValue({...InitialValues, fifty: true});
      }
      if (textZoom === 75) {
        form.setFieldsValue({...InitialValues, seventyFive: true});
      }
      if (textZoom === 100) {
        form.setFieldsValue({...InitialValues, hundred: true});
      }
      if (textZoom === 150) {
        form.setFieldsValue({...InitialValues, hundredAndFifty: true});
      }
      setPreviewTextZoom(textZoom);
    }
  }, [form, textZoomVisible, textZoom]);

  const handleOnValuesChange = async (field: typeof InitialValues) => {
    if (field.fifty) {
      setPreviewTextZoom(50);
    }
    if (field.seventyFive) {
      setPreviewTextZoom(75);
    }
    if (field.hundred) {
      setPreviewTextZoom(100);
    }
    if (field.hundredAndFifty) {
      setPreviewTextZoom(150);
    }
    form.setFieldsValue({...InitialValues, ...field});
  };

  return (
    <PopConfirm
      isVisible={textZoomVisible}
      title={t('Text zoom')}
      onCancel={onBack}
      onOk={async () => {
        await form
          .validator()
          .then(async stores => {
            console.log(stores);
            const {fifty, seventyFive, hundred, hundredAndFifty} = stores;
            let value = 100;
            if (fifty) {
              value = 50;
            }
            if (seventyFive) {
              value = 75;
            }
            if (hundred) {
              value = 100;
            }
            if (hundredAndFifty) {
              value = 150;
            }
            if (value) {
              updateTextZoom(value);
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
          <From.ItemRadio label="50%" name="fifty" />
          <From.ItemRadio label="75%" name="seventyFive" />
          <From.ItemRadio label={`100%(${t('Default')})`} name="hundred" />
          <From.ItemRadio label="150%" name="hundredAndFifty" />
        </From>
        <DescText desc={[t('Preview text zoom')]} />

        <Text style={[styles.preview, {fontSize: 0.16 * previewTextZoom}]}>
          {t('Flipped')}
        </Text>
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
  preview: {
    textAlign: 'center',
  },
});
export default TextZoom;
