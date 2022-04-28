import React, {useState, useEffect} from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {WebViewNativeEvent} from 'react-native-webview/lib/WebViewTypes';
import {
  GoBack,
  GoForward,
  Reload,
  StopLoading,
  Capture,
} from '@/components/WebView';
import {
  WebViewGroupItem,
  SetCurrentWebViewSource,
  SetCurrentWebViewId,
  CreateWebView,
  DelWebView,
} from '@/components/WebView';
import {useUIState} from '@/stores';
import {ThemeFunctionComponent, withTheme} from '@/theme';
import Control from './Control';
import Input from './Input';
import Viewport from './Viewport';
import More from './More';

export type NavState = Omit<WebViewNativeEvent, 'lockIdentifier'> & {
  canReload: boolean;
};
export type SetNavState = (state: NavState) => void;

interface NavProps {
  navState: NavState;
  goBack: GoBack;
  goForward: GoForward;
  reload: Reload;
  stopLoading: StopLoading;
  setCurrentWebView: SetCurrentWebViewId;
  createWebView: CreateWebView;
  delWebView: DelWebView;
  setCurrentWebViewSource: SetCurrentWebViewSource;
  capture: Capture;
  webViewGroup: WebViewGroupItem[];
  currentRouteId?: number;
}

const Nav: ThemeFunctionComponent<NavProps> = props => {
  const {
    navState,
    goBack = () => {},
    goForward = () => {},
    reload = () => {},
    stopLoading = () => {},
    setCurrentWebViewSource = () => {},
    createWebView = () => {},
    delWebView = () => {},
    setCurrentWebView = () => {},
    capture = () => {},
    webViewGroup = [],
    currentRouteId,
    theme,
  } = props;

  const {dimension} = useUIState();
  const [navStyle, setNavStyle] = useState<ViewStyle>({});

  useEffect(() => {
    const {navHeight = 0} = dimension || {};
    setNavStyle({
      height: navHeight,
    });
  }, [dimension]);

  return (
    <View
      style={[
        navStyle,
        styles.nav,
        {
          backgroundColor: theme?.colors.background,
          borderBottomColor: theme?.colors.underlayColor,
        },
      ]}>
      <Control
        navState={navState}
        goBack={goBack}
        goForward={goForward}
        reload={reload}
        stopLoading={stopLoading}
      />
      <Input
        navState={navState}
        setCurrentWebViewSource={setCurrentWebViewSource}
      />
      <Viewport
        webViewGroup={webViewGroup}
        currentRouteId={currentRouteId}
        capture={capture}
        createWebView={createWebView}
        delWebView={delWebView}
        setCurrentWebView={setCurrentWebView}
      />
      <More />
    </View>
  );
};

const styles = StyleSheet.create({
  nav: {
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
});

export default withTheme<NavProps>(Nav, 'Nav');
