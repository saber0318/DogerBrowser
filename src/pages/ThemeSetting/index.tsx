import React, {useEffect} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import PopConfirm from '@/components/Modal/PopConfirm';
import From, {useForm} from '@/components/Form';
import {useUIState, useUIDispatch} from '@/stores';
import {ThemeFunctionComponent, withTheme} from '@/theme';

export type ThemeSetting = 'lightMode' | 'darkMode' | 'followSystem';

const InitialValues = {
  lightMode: false,
  darkMode: false,
  followSystem: false,
};

const ThemeSetting: ThemeFunctionComponent<{}> = () => {
  const {t} = useTranslation();

  const {pagesVisible, themeSetting} = useUIState();
  const {themeSettingVisible} = pagesVisible;

  const {updatePagesVisible, updateThemeSetting} = useUIDispatch();

  const [form] = useForm();

  const onBack = () => {
    updatePagesVisible({themeSettingVisible: false});
  };

  useEffect(() => {
    if (form && themeSettingVisible && themeSetting) {
      form.setFieldsValue({...InitialValues, [themeSetting]: true});
    }
  }, [form, themeSettingVisible, themeSetting]);

  const handleOnValuesChange = async (field: typeof InitialValues) => {
    form.setFieldsValue({...InitialValues, ...field});
  };

  return (
    <PopConfirm
      isVisible={themeSettingVisible}
      title={t('Theme')}
      onCancel={onBack}
      onOk={async () => {
        await form
          .validator()
          .then(async stores => {
            console.log(stores);
            const {lightMode, darkMode, followSystem} = stores;
            let value: ThemeSetting | undefined;
            if (lightMode) {
              value = 'lightMode';
            }
            if (darkMode) {
              value = 'darkMode';
            }
            if (followSystem) {
              value = 'followSystem';
            }
            if (value) {
              updateThemeSetting(value);
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
          <From.ItemRadio label={t('Light mode')} name="lightMode" />
          <From.ItemRadio label={t('Dark mode')} name="darkMode" />
          <From.ItemRadio label={t('Follow system')} name="followSystem" />
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
export default withTheme<{}>(ThemeSetting, 'ThemeSetting');
