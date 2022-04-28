import React from 'react';
import {
  StyleSheet,
  View,
  // Text,
  ViewStyle,
} from 'react-native';
// import {useTranslation} from 'react-i18next';
import {SetCurrentWebViewSource} from '@/components/WebView';
import Shortcut from '@/components/WebView/WelcomeView/Shortcut';
// import {useUIDispatch} from '@/stores';
import {ThemeFunctionComponent, withTheme} from '@/theme';

export type WelcomeViewProps = {
  style?: ViewStyle;
  setCurrentWebViewSource?: SetCurrentWebViewSource;
};

const WelcomeView: ThemeFunctionComponent<WelcomeViewProps> = props => {
  const {style = {}, setCurrentWebViewSource = () => {}, theme} = props;

  // const {t} = useTranslation();

  // const {updatePagesVisible} = useUIDispatch();
  // const handleShowHomePage = () => {
  //   updatePagesVisible({homePageVisible: true});
  // };

  return (
    <View
      style={[
        style,
        styles.welcomeView,
        {backgroundColor: theme?.colors.background},
      ]}>
      <View style={styles.container}>
        <View style={styles.header} />
        <View style={styles.section}>
          <Shortcut setCurrentWebViewSource={setCurrentWebViewSource} />
        </View>

        <View style={styles.footer}>
          {/* <Text
            style={[styles.footerText, {color: theme?.colors.primary}]}
            onPress={handleShowHomePage}>
            {t('To set the home page?')}
          </Text> */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flex: 1,
  },
  section: {
    flex: 3,
  },
  footer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    padding: 10,
    fontSize: 10,
  },
});

export default withTheme<WelcomeViewProps>(WelcomeView, 'WelcomeView');
