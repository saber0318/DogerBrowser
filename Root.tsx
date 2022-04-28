import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {RootSiblingParent} from 'react-native-root-siblings';
import {ContextProvider} from '@/stores';
import App from '@/pages/App';
import {ThemeProvider} from '@/theme/ThemeProvider';
import '@/i18n';

const Root = () => {
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ContextProvider>
        <ThemeProvider>
          <RootSiblingParent>
            <App />
          </RootSiblingParent>
        </ThemeProvider>
      </ContextProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
});

export default Root;
