import React from 'react';
import {StyleSheet, View} from 'react-native';
import Icon from '@/components/Icon';
import {NavState} from '@/components/Nav';
import {GoBack, GoForward, Reload, StopLoading} from '@/components/WebView';

interface ControlProps {
  navState: NavState;
  goBack: GoBack;
  goForward: GoForward;
  reload: Reload;
  stopLoading: StopLoading;
}

const Control = (props: ControlProps) => {
  const {
    navState,
    goBack = () => {},
    goForward = () => {},
    reload = () => {},
    stopLoading = () => {},
  } = props;
  const {loading, canGoBack, canGoForward, canReload} = navState;

  return (
    <View style={styles.control}>
      <Icon name="chevron-left" disable={!canGoBack} onPress={goBack} />
      <Icon name="chevron-right" disable={!canGoForward} onPress={goForward} />
      <Icon name="close" visible={loading} onPress={stopLoading} />
      <Icon
        name="undo"
        disable={!canReload}
        visible={!loading}
        onPress={reload}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  control: {
    flexDirection: 'row',
  },
  iconContainer: {
    // margin: 2,
    alignContent: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  icon: {
    fontSize: 30,
  },
});

export default Control;
