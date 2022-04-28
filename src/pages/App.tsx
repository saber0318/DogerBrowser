import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ToastAndroid,
  BackHandler,
  Linking,
  ViewStyle,
  LayoutRectangle,
  // Text,
} from 'react-native';
import Orientation from 'react-native-orientation';
import {useTranslation} from 'react-i18next';
import SplashScreen from 'react-native-splash-screen';
import CustomControl from '@/pages/CustomControl';
import Bookmark from '@/pages/Bookmark';
import History from '@/pages/History';
import ClearData from '@/pages/ClearData';
import Tool from '@/pages/Tool';
import ThemeSetting from '@/pages/ThemeSetting';
import Language from '@/pages/Language';
import TextZoom from '@/pages/TextZoom';
import HomePage from '@/pages/HomePage';
import SearchEngine from '@/pages/SearchEngine';
import UserAgent from '@/pages/UserAgent';
import MixedContentMode from '@/pages/MixedContentMode';
import WhetherToOpenApp from '@/pages/WhetherToOpenApp';
import WhetherToDownloadFile from '@/pages/WhetherToDownloadFile';
import ResetApp from '@/pages/ResetApp';
import About from '@/pages/About';
import Setting from '@/pages/Setting';
import Download from '@/pages/Download';
import SniffResources from '@/pages/SniffResources';
import Scan from '@/pages/Scan';
import AdsBlocker from '@/pages/AdsBlocker';
import Nav, {NavState} from '@/components/Nav';
import WebView, {
  DEFAULT_WEBVIEW_STATE,
  GoBack,
  GoForward,
  Reload,
  StopLoading,
  Capture,
  WebViewGroupItem,
  WebViewGroupRef,
  WebViewGroupActType,
  OnWebViewGroupChange,
  OnCurrentWebViewChange,
  SetCurrentWebViewSource,
  SetCurrentWebViewId,
  CreateWebView,
  DelWebView,
  ClearCache,
  ClearHistory,
  ClearCookie,
  ClearFromData,
  UpdateSniffResources,
  DownloadFile,
} from '@/components/WebView';
import {AppSetting, useUIState, useUIDispatch} from '@/stores';
import {
  getWhetherIsFirstTimeToEnterApp,
  initAppDatabase,
  getAppSetting,
  getAdsBlockerEngine,
} from '@/servces';
import {
  statusBarHeight,
  navHeight,
  pageHeaderHeight,
  getProcessedUrl,
} from '@/utils';
import {
  DEFAULT_HOME_PAGE,
  DEFAULT_SEARCH_ENGINE,
  DETAULT_USER_AGENT,
  DETAULT_MIXED_CONTENT_MODE,
  DETAULT_THEME_SETTING,
  DETAULT_LANGUAGE,
  DEFAULT_WHETHER_TO_OPEN_APP,
  DEFAULT_WHETHER_TO_DOWNLOAD_FILE,
  DEFAULT_TEXT_ZOOM,
  DEFAULT_INCOGNITO_MODE,
  DEFAULT_ENABLE_BLOCK_ADS,
  DEFAULT_ENABLE_SNIFFING_RESOURCES,
  DEFAULT_ADS_BLOCKER,
} from '@/config/default';
import ReceiveWebSearchIntent, {Intent} from '@/utils/ReceiveWebSearchIntent';
import {ThemeFunctionComponent, withTheme} from '@/theme';
import {setLng} from '@/i18n';

const App: ThemeFunctionComponent<{}> = props => {
  const {changeTheme = () => {}, theme} = props;

  const [isInitCompleted, setIsInitCompleted] = useState<boolean>(false);
  const [isSetupInitCompleted, setIsSetupInitCompleted] =
    useState<boolean>(false);
  const [isDimensionObtained, setIsDimensionObtained] =
    useState<boolean>(false);
  useEffect(() => {
    if (isSetupInitCompleted && isDimensionObtained) {
      setIsInitCompleted(true);
      SplashScreen.hide();
    }
  }, [isSetupInitCompleted, isDimensionObtained]);

  const [navState, setNavState] = useState<NavState>(DEFAULT_WEBVIEW_STATE);
  const [exitTime, setExitTime] = useState<number>();

  const webViewGroupRef = useRef<WebViewGroupRef>(null);

  const [webViewGroup, setWebViewGroup] = useState<WebViewGroupItem[]>([]);
  const [webViewId, setWebViewId] = useState<number>();
  // const [currentWebViewItem, setCurrentWebViewItem] = useState<WebViewGroupItem>();

  const containerRef = useRef<View>();

  const {dimension, language, themeSetting} = useUIState();
  const [webViewGroupStyle, setWebViewGroupStyle] = useState<ViewStyle>({});

  useEffect(() => {
    const {webViewWidth = 0, webViewHeight = 0} = dimension || {};
    setWebViewGroupStyle({
      width: webViewWidth,
      height: webViewHeight,
    });
  }, [dimension]);

  const {t} = useTranslation();

  const goBack = useCallback<GoBack>(() => {
    webViewGroupRef.current?.webViewGroupAct(WebViewGroupActType.GO_BACK);
  }, [webViewGroupRef]);

  const goForward = useCallback<GoForward>(() => {
    webViewGroupRef.current?.webViewGroupAct(WebViewGroupActType.GO_FORWARD);
  }, [webViewGroupRef]);

  const reload = useCallback<Reload>(() => {
    webViewGroupRef.current?.webViewGroupAct(WebViewGroupActType.RELOAD);
  }, [webViewGroupRef]);

  const stopLoading = useCallback<StopLoading>(() => {
    webViewGroupRef.current?.webViewGroupAct(WebViewGroupActType.STOP_LOADING);
  }, [webViewGroupRef]);

  const capture = useCallback<Capture>(() => {
    webViewGroupRef.current?.webViewGroupAct(WebViewGroupActType.CAPTURE);
  }, [webViewGroupRef]);

  const setCurrentWebViewSource = useCallback<SetCurrentWebViewSource>(
    webViewSource => {
      webViewGroupRef.current?.webViewGroupAct(
        WebViewGroupActType.SET_CURRENT_WEBVIEW_SOURCE,
        webViewSource,
      );
    },
    [webViewGroupRef],
  );

  const setCurrentWebView = useCallback<SetCurrentWebViewId>(
    id => {
      // console.log('App.tsx setCurrentWebView', id);
      webViewGroupRef.current?.webViewGroupAct(
        WebViewGroupActType.SET_CURRENT_WEBVIEW_ID,
        id,
      );
    },
    [webViewGroupRef],
  );

  const createWebView = useCallback<CreateWebView>(() => {
    webViewGroupRef.current?.webViewGroupAct(
      WebViewGroupActType.CREATE_WEBVIEW,
    );
  }, [webViewGroupRef]);

  const delWebView = useCallback<DelWebView>(
    id => {
      webViewGroupRef.current?.webViewGroupAct(
        WebViewGroupActType.DEL_WEBVIEW,
        id,
      );
    },
    [webViewGroupRef],
  );

  const clearCache = useCallback<ClearCache>(
    flag => {
      webViewGroupRef.current?.webViewGroupAct(
        WebViewGroupActType.CLEAR_CACHE,
        flag,
      );
    },
    [webViewGroupRef],
  );

  const clearHistory = useCallback<ClearHistory>(() => {
    webViewGroupRef.current?.webViewGroupAct(WebViewGroupActType.CLEAR_HISTORY);
  }, [webViewGroupRef]);

  const clearCookie = useCallback<ClearCookie>(() => {
    webViewGroupRef.current?.webViewGroupAct(WebViewGroupActType.CLEAR_COOKIE);
  }, [webViewGroupRef]);

  const updateSniffResources = useCallback<UpdateSniffResources>(() => {
    webViewGroupRef.current?.webViewGroupAct(
      WebViewGroupActType.UPDATE_SNIFF_RESOURCES,
    );
  }, [webViewGroupRef]);

  const downloadFile = useCallback<DownloadFile>(
    (url, fileName) => {
      webViewGroupRef.current?.webViewGroupAct(
        WebViewGroupActType.DOWNLOAD_FILE,
        url,
        fileName,
      );
    },
    [webViewGroupRef],
  );

  const clearFromData = useCallback<ClearFromData>(() => {
    webViewGroupRef.current?.webViewGroupAct(
      WebViewGroupActType.CLEAR_FROM_DATA,
    );
  }, [webViewGroupRef]);

  const handleWebViewGroupChange = useCallback<OnWebViewGroupChange>(list => {
    setWebViewGroup(list);
  }, []);

  const handleCurrentWebViewChange = useCallback<OnCurrentWebViewChange>(
    item => {
      // console.log('App.tsx handleCurrentWebViewChange', item);
      setNavState(item?.state || DEFAULT_WEBVIEW_STATE);
      setWebViewId(item?.id);
    },
    [],
  );

  /* 后退键 */
  const backAction = useCallback(() => {
    const {canGoBack} = navState;
    const now = Date.now();
    if (canGoBack) {
      goBack();
      return true;
    }
    if (exitTime && exitTime + 2000 >= now) {
      BackHandler.exitApp(); // 直接退出APP
    } else {
      setExitTime(now);
      ToastAndroid.show(t('Press again to exit the application'), 1000);
      return true;
    }
  }, [navState, exitTime, goBack, t]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [backAction]);

  const {
    updateHomePage,
    updateSearchEngine,
    updateUserAgent,
    updateMixedContentMode,
    updateWhetherToOpenApp,
    updateWhetherToDownloadFile,
    updateTextZoom,
    updateThemeSetting,
    updateLanguage,
    updateDimension,
    updateIncognitoMode,
    updateEnableBlockAds,
    updateAdsBlocker,
    updateEnableSniffingResources,
    updateShortcut,
    hidePages,
  } = useUIDispatch();

  /* 初始化设置 */
  useEffect(() => {
    console.log('************ 初始化 **********');
    (async () => {
      // 先是否首次进入app
      await getWhetherIsFirstTimeToEnterApp()
        .then(async res => {
          if (res.code === 200 && res.data) {
            await initAppDatabase();
          }
        })
        .then(async () => {
          // 获取app设置
          const setting: AppSetting = {
            homePage: DEFAULT_HOME_PAGE,
            searchEngine: DEFAULT_SEARCH_ENGINE,
            userAgent: DETAULT_USER_AGENT,
            mixedContentMode: DETAULT_MIXED_CONTENT_MODE,
            themeSetting: DETAULT_THEME_SETTING,
            language: DETAULT_LANGUAGE,
            whetherToOpenApp: DEFAULT_WHETHER_TO_OPEN_APP,
            whetherToDownloadFile: DEFAULT_WHETHER_TO_DOWNLOAD_FILE,
            textZoom: DEFAULT_TEXT_ZOOM,
            incognitoMode: DEFAULT_INCOGNITO_MODE,
            enableBlockAds: DEFAULT_ENABLE_BLOCK_ADS,
            enableSniffingResources: DEFAULT_ENABLE_SNIFFING_RESOURCES,
          };

          await getAppSetting().then(res => {
            if (res.code === 200) {
              setting.homePage = res.data.homePage;
              setting.searchEngine = res.data.searchEngine;
              setting.userAgent = res.data.userAgent;
              setting.mixedContentMode = res.data.mixedContentMode;
              setting.themeSetting = res.data.themeSetting;
              setting.language = res.data.language;
              setting.whetherToOpenApp = res.data.whetherToOpenApp;
              setting.whetherToDownloadFile = res.data.whetherToDownloadFile;
              setting.textZoom = res.data.textZoom;
              setting.incognitoMode = res.data.incognitoMode;
              setting.enableBlockAds = res.data.enableBlockAds;
              setting.enableSniffingResources =
                res.data.enableSniffingResources;
            }
          });

          let adsBlocker = DEFAULT_ADS_BLOCKER;
          await getAdsBlockerEngine().then(res => {
            if (res.code === 200) {
              adsBlocker.engine = res.data.engine;
              adsBlocker.time = res.data.time;
            }
          });

          updateAdsBlocker(adsBlocker);
          updateHomePage(setting.homePage);
          updateSearchEngine(setting.searchEngine);
          updateUserAgent(setting.userAgent);
          updateMixedContentMode(setting.mixedContentMode);
          updateThemeSetting(setting.themeSetting);
          updateLanguage(setting.language);
          updateWhetherToOpenApp(setting.whetherToOpenApp);
          updateWhetherToDownloadFile(setting.whetherToDownloadFile);
          updateTextZoom(setting.textZoom);
          updateIncognitoMode(setting.incognitoMode);
          updateEnableBlockAds(setting.enableBlockAds);
          updateEnableSniffingResources(setting.enableSniffingResources);
          await updateShortcut();
          setIsSetupInitCompleted(true);
        });
    })();
  }, [
    updateHomePage,
    updateSearchEngine,
    updateUserAgent,
    updateMixedContentMode,
    updateThemeSetting,
    updateWhetherToOpenApp,
    updateWhetherToDownloadFile,
    updateTextZoom,
    updateLanguage,
    updateIncognitoMode,
    updateEnableBlockAds,
    updateAdsBlocker,
    updateEnableSniffingResources,
    updateShortcut,
  ]);

  // 监听主题设置
  useEffect(() => {
    changeTheme(themeSetting);
  }, [themeSetting, changeTheme]);

  // 监听语言设置
  useEffect(() => {
    setLng(language);
  }, [language]);

  /* WebSearch Intent */
  const handleWebSearch = useCallback(
    async (event: Intent) => {
      console.log('handleWebSearch', event);
      const {extras} = event || {};
      const {query} = extras || {};
      if (!query) {
        return;
      }
      const url = await getProcessedUrl(query);
      hidePages();
      webViewGroupRef.current?.webViewGroupAct(
        WebViewGroupActType.SET_CURRENT_WEBVIEW_SOURCE,
        {uri: url},
      );
    },
    [hidePages],
  );

  useEffect(() => {
    if (isInitCompleted && webViewGroupRef.current) {
      ReceiveWebSearchIntent.getWebSearchIntent()
        .then((intent: Intent) => {
          handleWebSearch(intent);
        })
        .catch((e: any) => {
          console.log('e', e);
        });
      ReceiveWebSearchIntent.addListener('WebSearch', handleWebSearch);
    }
    return () => {
      ReceiveWebSearchIntent.removeAllListeners('WebSearch');
    };
  }, [isInitCompleted, webViewGroupRef, handleWebSearch]);

  /* url Intent */
  const handleOpenURL = useCallback(
    async (event: {url: string}) => {
      const {url} = event;
      console.log('handleOpenURL url', url);
      const u = await getProcessedUrl(url);
      hidePages();
      webViewGroupRef.current?.webViewGroupAct(
        WebViewGroupActType.SET_CURRENT_WEBVIEW_SOURCE,
        {uri: u},
      );
    },
    [hidePages],
  );

  useEffect(() => {
    if (isInitCompleted && webViewGroupRef.current) {
      Linking.getInitialURL()
        .then(url => {
          if (url) {
            handleOpenURL({url});
          }
        })
        .catch(err => {
          console.warn('An error occurred', err);
        });
      Linking.addEventListener('url', handleOpenURL);
    }
    return () => {
      Linking.removeAllListeners('url');
    };
  }, [isInitCompleted, webViewGroupRef, handleOpenURL]);

  /* 屏幕方向 */
  const handleOrientationChange = async (
    error: Error,
    orientation: 'LANDSCAPE' | 'PORTRAIT' | 'UNKNOWN' | 'PORTRAITUPSIDEDOWN',
  ) => {
    if (error) {
      return;
    }

    await Promise.resolve();

    const {width, height} = await measureContainerLayout();

    let deviceWidth = 0;
    let deviceHeight = 0;
    let containerWidth = 0;
    let containerHeight = 0;

    deviceWidth = width;
    deviceHeight = height + statusBarHeight;

    containerWidth = width;
    containerHeight = height;

    const webViewWidth = containerWidth;
    const webViewHeight = containerHeight - navHeight;

    updateDimension({
      statusBarHeight,
      deviceWidth,
      deviceHeight,
      navHeight,
      containerHeight,
      containerWidth,
      pageHeaderHeight,
      webViewHeight,
      webViewWidth,
      orientation,
    });
    setIsDimensionObtained(true);
  };

  // HACK 监听Orientation.addOrientationListener 不生效的问题
  const handleOnLayout = () => {
    Orientation.getOrientation(handleOrientationChange);
  };

  const measureContainerLayout = () =>
    new Promise<LayoutRectangle>(resolve => {
      if (containerRef.current) {
        containerRef.current.measureInWindow((x, y, width, height) => {
          resolve({x, y, width, height});
        });
      }
    });

  return (
    <View
      ref={r => {
        if (r) {
          containerRef.current = r;
        }
      }}
      style={{...styles.container, backgroundColor: theme?.colors.background}}
      onLayout={handleOnLayout}>
      <ScrollView style={styles.scrollView}>
        <Nav
          navState={navState}
          webViewGroup={webViewGroup}
          currentRouteId={webViewId}
          goBack={goBack}
          goForward={goForward}
          reload={reload}
          stopLoading={stopLoading}
          setCurrentWebView={setCurrentWebView}
          createWebView={createWebView}
          delWebView={delWebView}
          setCurrentWebViewSource={setCurrentWebViewSource}
          capture={capture}
        />
        <WebView.Group
          style={webViewGroupStyle}
          ref={webViewGroupRef}
          onWebViewGroupChange={handleWebViewGroupChange}
          onCurrentWebViewChange={handleCurrentWebViewChange}
        />
      </ScrollView>
      <CustomControl />
      <Bookmark setCurrentWebViewSource={setCurrentWebViewSource} />
      <History setCurrentWebViewSource={setCurrentWebViewSource} />
      <ClearData
        clearCache={clearCache}
        clearHistory={clearHistory}
        clearCookie={clearCookie}
        clearFromData={clearFromData}
      />
      <Tool />
      <ThemeSetting />
      <Language />
      <TextZoom />
      <HomePage setCurrentWebViewSource={setCurrentWebViewSource} />
      <SearchEngine />
      <UserAgent />
      <MixedContentMode />
      <WhetherToOpenApp />
      <WhetherToDownloadFile />
      <ResetApp />
      <About setCurrentWebViewSource={setCurrentWebViewSource} />
      <Setting />
      <Download />
      <Scan setCurrentWebViewSource={setCurrentWebViewSource} />
      <SniffResources
        downloadFile={downloadFile}
        updateSniffResources={updateSniffResources}
      />
      <AdsBlocker />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'red',
  },
});

export default withTheme(App);
