import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import 'intl-pluralrules';
import {Language} from '@/pages/Language';
import en from './en.json';
import zhs from './zhs.json';

export const getAvailableLng = () =>
  RNLocalize.findBestAvailableLanguage(['zh', 'en'])?.languageTag === 'en'
    ? 'en'
    : 'zh';
export const setLng = (lng: Language) => {
  if (lng === 'chinese') {
    return i18next.changeLanguage('zh');
  }
  if (lng === 'english') {
    return i18next.changeLanguage('en');
  }
  if (lng === 'none') {
    return i18next.changeLanguage(getAvailableLng());
  }
  return i18next.changeLanguage('en');
};

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zhs,
  },
};

i18next
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: getAvailableLng(), // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18next;
