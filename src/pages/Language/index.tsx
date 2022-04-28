import React, {useEffect} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import PopConfirm from '@/components/Modal/PopConfirm';
import From, {useForm} from '@/components/Form';
import {useUIState, useUIDispatch} from '@/stores';
import {ThemeFunctionComponent, withTheme} from '@/theme';
// import {setLng} from '@/i18n';

export type Language = 'none' | 'english' | 'chinese';

const InitialValues = {
  none: false,
  english: false,
  chinese: false,
};

const Language: ThemeFunctionComponent<{}> = () => {
  const {t} = useTranslation();

  const {pagesVisible, language} = useUIState();
  const {languageVisible} = pagesVisible;

  const {updatePagesVisible, updateLanguage} = useUIDispatch();

  const [form] = useForm();

  const onBack = () => {
    updatePagesVisible({languageVisible: false});
  };

  useEffect(() => {
    if (form && languageVisible && language) {
      form.setFieldsValue({...InitialValues, [language]: true});
    }
  }, [form, languageVisible, language]);

  const handleOnValuesChange = async (field: typeof InitialValues) => {
    form.setFieldsValue({...InitialValues, ...field});
  };

  return (
    <PopConfirm
      isVisible={languageVisible}
      title={t('Language')}
      onCancel={onBack}
      onOk={async () => {
        await form
          .validator()
          .then(async stores => {
            console.log(stores);
            const {none, english, chinese} = stores;
            let value: Language | undefined;
            if (none) {
              value = 'none';
            }
            if (english) {
              value = 'english';
            }
            if (chinese) {
              value = 'chinese';
            }
            if (value) {
              updateLanguage(value);
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
          <From.ItemRadio label={t('Default')} name="none" />
          <From.ItemRadio label="English" name="english" />
          <From.ItemRadio label="中文" name="chinese" />
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
export default withTheme<{}>(Language, 'Language');
