import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useCallback,
} from 'react';
import {
  StyleSheet,
  View,
  Linking,
  UIManager,
  Text,
  ToastAndroid,
} from 'react-native';
import BatchedBridge from 'react-native/Libraries/BatchedBridge/BatchedBridge';
import {useTranslation} from 'react-i18next';
import ViewShot from 'react-native-view-shot';
import {
  WebViewSource,
  WebViewErrorEvent,
  WebViewProgressEvent,
  WebViewNavigationEvent,
  // WebViewMessageEvent,
  ShouldStartLoadRequest,
} from 'react-native-webview/lib/WebViewTypes';
import {WebView as RNWebView} from 'react-native-webview';
import moment from 'moment';
import {NavState} from '@/components/Nav';
import Progress, {ProgressBarState} from '@/components/Progress';
import {SetCurrentWebViewSource} from '@/components/WebView';
import ErrorView, {ErrorViewState} from '@/components/WebView/ErrorView';
import WelcomeView from '@/components/WebView/WelcomeView';
import {createConfirm} from '@/components/Modal';
import {DownloadConstants} from '@/utils/CustomDownloadManger';
import {CustomWebViewName, RCTCustomWebView} from '@/utils/RCTCustomWebView';
import {insertOrReplaceHistory, insertOrReplaceDownload} from '@/servces';
import {useUIState, useUIDispatch} from '@/stores';
import {ThemeForwardRefRenderFunction, withTheme} from '@/theme';
import {parseUrl} from '@/utils';
// import {Request} from '@cliqz/adblocker';

export type WebViewState = NavState &
  ProgressBarState & {
    progress: number;
    error: boolean;
    preview: string | undefined;
  };
export type SetWebViewSource = (value: WebViewSource) => void;
export type SetWebViewState = (value: WebViewState) => void;
export type OnWebViewStateChange = SetWebViewState;
export type GoBack = () => void;
export type GoForward = () => void;
export type Reload = () => void;
export type StopLoading = () => void;
export type UpdateSniffResources = () => void;
export type DownloadFile = (url: string, fileName: string) => void;
// 非常尴尬的发现 android webView 提供了capture方法。。。
export type Capture = (cb?: CaptureCallBack) => void;
export type CaptureCallBack = (uri: string) => void;
export interface WebViewRef {
  // https://github.com/facebook/react-native/issues/10385
  // There's an undocumented method on the WebView component called getWebViewHandle that returns the correct handle.
  getWebViewHandle?: () => number | null;
  goBack: GoBack;
  goForward: GoForward;
  reload: Reload;
  stopLoading: StopLoading;
  capture?: Capture;
  clearFormData: () => void;
  clearCache: (clear: boolean) => void;
  clearHistory: () => void;
  clearCookie?: () => void;
  updateSniffResources?: UpdateSniffResources;
  downloadFile?: DownloadFile;
  injectJavaScript?: (func: string) => void;
  theme?: any;
}
export interface WebViewProps {
  id: number;
  webViewSource: WebViewSource;
  onWebViewStateChange?: OnWebViewStateChange;
  setCurrentWebViewSource?: SetCurrentWebViewSource;
}
export const DEFAULT_WEBVIEW_STATE: WebViewState = {
  url: '',
  loading: false,
  title: '',
  canGoBack: false,
  canGoForward: false,
  canReload: true,
  error: false,
  progress: 0,
  preview: undefined,
};

const WebView: ThemeForwardRefRenderFunction<WebViewRef, WebViewProps> =
  forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
      getWebViewHandle,
      goBack,
      goForward,
      reload,
      stopLoading,
      capture,
      clearFormData,
      clearCache,
      clearHistory,
      clearCookie,
      updateSniffResources,
      downloadFile,
    }));

    const {
      webViewSource,
      onWebViewStateChange = () => {},
      setCurrentWebViewSource = () => {},
      theme,
    } = props;

    const [webViewState, setWebViewState] = useState<WebViewState>(
      DEFAULT_WEBVIEW_STATE,
    );

    const [tempProgress, setTempProgress] = useState<number>(0);

    const {
      dimension,
      userAgent,
      mixedContentMode,
      whetherToOpenApp,
      whetherToDownloadFile,
      textZoom,
      incognitoMode,
      enableSniffingResources,
      enableBlockAds,
      adsBlocker,
    } = useUIState();

    const {updateResources} = useUIDispatch();

    const CustomWebView = useMemo(() => {
      return RCTCustomWebView;
    }, []);

    const viewShotWidth = 128;
    const [viewShotHeight, setViewShotHeight] = useState<number>(0);

    useEffect(() => {
      const {deviceWidth = 0, deviceHeight = 0} = dimension || {};
      setViewShotHeight(
        Math.floor((viewShotWidth / deviceWidth) * deviceHeight),
      );
    }, [dimension]);

    const [errorValue, setErrorValue] = useState<ErrorViewState | null>();

    const {t} = useTranslation();

    const webviewRef = useRef<WebViewRef>();
    const viewShotRef = useRef<ViewShot>();

    const handleError = (event: WebViewErrorEvent) => {
      console.log('handleError event:', event);
      const {nativeEvent} = event;
      const {code, description} = nativeEvent;
      setErrorValue({code, description});
    };

    const dealDeepLink = async (url: string) => {
      const supported = await Linking.canOpenURL(url);
      console.log('dealDeepLink url:', url);
      if (supported) {
        if (whetherToOpenApp === 'askEachTime') {
          createConfirm({
            title: t('Open the third-party app?'),
            content: url,
            onOk: () => {
              Linking.openURL(url);
            },
          });
        }
        if (whetherToOpenApp === 'alwaysOpen') {
          await Linking.openURL(url);
        }
      }
    };

    const handleShouldStartLoadWithRequest = (
      request: ShouldStartLoadRequest,
    ) => {
      console.log(
        '%chandleShouldStartLoadWithRequest request:%o',
        'color: green',
        request,
      );
      const {url} = request;

      if (
        !url ||
        url.startsWith('http') ||
        url.startsWith('/') ||
        url.startsWith('#') ||
        url.startsWith('javascript') ||
        url.startsWith('about:blank')
      ) {
        return true;
      }

      // 处理deeplink
      if (/\*?:\/\//i.test(url)) {
        dealDeepLink(url);
        return false;
      }
      return true;
    };

    const handleLoadProgress = (event: WebViewProgressEvent) => {
      const {nativeEvent} = event;
      const {canGoBack, canGoForward, progress, title, url} = nativeEvent;
      console.log('%chandleLoadProgress: ', 'color: red', nativeEvent);
      const progressValue = progress > tempProgress ? progress : tempProgress;
      const state = {
        canGoBack,
        canGoForward,
        canReload: url !== 'about:blank',
        title,
        url,
        progress: progressValue,
        loading: url !== 'about:blank' ? progress !== 1 : false,
        error: false,
        preview: undefined,
      };
      setTempProgress(progressValue);
      setWebViewState(state);
      onWebViewStateChange(state);
    };

    const inserAdsBlockerCss = (url: string) => {
      const parse = parseUrl(url);
      console.log('parse', parse);
      if (parse && parse.domain && parse.hostname) {
        const result =
          adsBlocker.engine.getCosmeticsFilters({
            url: url,
            domain: parse.domain,
            hostname: parse.hostname,
          }) || {};
        console.log('result', result);
        const {styles} = result;

        if (styles) {
          let cssText = '';
          let prev = '';
          for (let i of styles) {
            if (i === '"' && prev !== '\\') {
              cssText = cssText + '\\"';
            }
            if (i === '"' && prev === '\\') {
              cssText = cssText + '"';
            }
            if (i !== '"' && i !== '\r' && i !== '\n' && i !== '\r\n') {
              cssText = cssText + i;
            }
            prev = i;
          }
          const funcText = `
              (function() {
                var style = document.createElement("style");
                style.type = "text/css";
                style.appendChild(document.createTextNode("${cssText}"));
                var head = document.getElementsByTagName("head")[0];
                head.appendChild(style);
              })();
              true;
            `;
          console.log('funcText', funcText);
          webviewRef.current?.injectJavaScript?.(funcText);
        }
      }
    };

    // TODO 过滤和阻止弹窗
    // const handleMessage = (event: WebViewMessageEvent) => {
    //   console.log('handleMessage event', event);
    //   const {match} = adsBlocker.engine.match(
    //     Request.fromRawDetails({
    //       type: 'script',
    //       url: 'https://pos.baidu.com',
    //     }),
    //   );
    //   console.log('match', match);
    // };

    const handleLoadStart = (event: WebViewNavigationEvent) => {
      const {nativeEvent} = event;
      console.log('handleLoadStart', nativeEvent);

      if (enableBlockAds && adsBlocker.engine) {
        inserAdsBlockerCss(nativeEvent.url);
      }
      setErrorValue(null);
    };

    const shouldInsertOrReplaceHistory = (url: string) => {
      if (incognitoMode) {
        return false;
      }
      if (url !== 'about:blank' && progress === 1) {
        return true;
      }
      return false;
    };

    const handleLoadEnd = (
      event: WebViewNavigationEvent | WebViewErrorEvent,
    ) => {
      const {nativeEvent} = event;
      console.log('handleLoadEnd', nativeEvent);
      const {title, url} = nativeEvent;
      setTempProgress(0);
      if (shouldInsertOrReplaceHistory(url)) {
        console.log(
          'insertOrReplaceHistory',
          url,
          title,
          moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        );
        insertOrReplaceHistory({
          url,
          title,
          time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        });
      }
    };

    const goBack: GoBack = () => {
      webviewRef.current?.goBack();
    };

    const goForward: GoForward = () => {
      webviewRef.current?.goForward();
    };

    const reload: Reload = () => {
      // setErrorValue(null);
      webviewRef.current?.reload();
    };

    const stopLoading: StopLoading = () => {
      webviewRef.current?.stopLoading();
    };

    const capture: Capture = cb => {
      // console.log('viewShotRef', viewShotRef);
      if (viewShotRef.current?.capture) {
        viewShotRef.current?.capture().then(uri => {
          const state = {...webViewState, preview: uri};
          setWebViewState(state);
          onWebViewStateChange(state);
          cb && cb(uri);
        });
      }
    };

    const clearFormData = () => {
      webviewRef.current?.clearFormData();
    };
    const clearCache = (clear: boolean) => {
      webviewRef.current?.clearCache(clear);
    };
    const clearHistory = () => {
      webviewRef.current?.clearHistory();
    };
    const clearCookie = () => {
      UIManager.dispatchViewManagerCommand(
        getWebViewHandle(),
        getCommands().clearCookie,
        undefined,
      );
    };
    const updateSniffResources = () => {
      UIManager.dispatchViewManagerCommand(
        getWebViewHandle(),
        getCommands().updateSniffResources,
        undefined,
      );
    };
    const downloadFile = (url: string, fileName: string) => {
      UIManager.dispatchViewManagerCommand(
        getWebViewHandle(),
        getCommands().downloadFile,
        [url, fileName],
      );
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {progress, url, preview} = webViewState;

    const getCommands = () => {
      return UIManager.getViewManagerConfig(CustomWebViewName).Commands;
    };

    const getWebViewHandle = () => {
      if (webviewRef.current?.getWebViewHandle) {
        return webviewRef.current.getWebViewHandle();
      }
      return null;
    };

    const onShouldStartDownloadWithRequestCallback = useCallback(
      (shouldDownload: boolean, lockIdentifier: number) => {
        UIManager.dispatchViewManagerCommand(
          getWebViewHandle(),
          getCommands().onShouldStartDownloadWithRequestCallback,
          [shouldDownload, lockIdentifier],
        );
      },
      [],
    );

    useEffect(() => {
      // 简单点 🚀
      // https://stackoverflow.com/questions/46032563/how-to-call-javascript-method-in-react-native-on-android-platform/46035341
      BatchedBridge.registerCallableModule('JavaScriptVisibleToJava', {
        onShouldStartDownloadWithRequest: async (
          identifier: number,
          downloadUrl: string,
          fileName: string,
          fileSize: string,
          mimetype: string,
          size: number,
          contentDisposition: string,
        ) => {
          console.log(
            'onShouldStartDownloadWithRequest',
            identifier,
            downloadUrl,
            fileName,
            fileSize,
            mimetype,
            size,
            contentDisposition,
          );
          if (whetherToDownloadFile === 'alwaysDownload') {
            onShouldStartDownloadWithRequestCallback(true, identifier);
          }
          if (whetherToDownloadFile === 'neverAllow') {
            onShouldStartDownloadWithRequestCallback(false, identifier);
          }
          if (whetherToDownloadFile === 'askEachTime') {
            createConfirm({
              title: t('Whether to download file?'),
              renderContent: () => {
                return (
                  <View style={styles.confirmContent}>
                    <Text>{t('File name:') + fileName}</Text>
                    <Text>{t('File size:') + (fileSize || t('Unknow'))}</Text>
                  </View>
                );
              },
              onCancel: () => {
                onShouldStartDownloadWithRequestCallback(false, identifier);
              },
              onOk: () => {
                onShouldStartDownloadWithRequestCallback(true, identifier);
              },
            });
          }
        },
        onShouldStartDownloadWithRequestError: (type: 'timeout' | 'error') => {
          // 选择超时不提示
          // if (type === 'timeout') {
          //   ToastAndroid.show(t('Waiting for selection exceeded time!'), 3000);
          // }
          if (type === 'error') {
            ToastAndroid.show(t('Download error!'), 1000);
          }
        },
        onStartDownload: (
          downloadId: number,
          downloadUrl: string,
          fileName: string,
          totalBytes: number,
        ) => {
          console.log(
            'onStartDownload',
            downloadId,
            downloadUrl,
            fileName,
            totalBytes,
          );
          ToastAndroid.show(
            t('Start downloading {{text}}!', {text: fileName}),
            1000,
          );
          insertOrReplaceDownload({
            downloadId,
            time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            url: downloadUrl,
            fileName,
            totalBytes,
            status: DownloadConstants.RUNNING,
          });
        },
        updateResources: (...list: string[]) => {
          console.log('updateResources', list);
          updateResources(list || []);
        },
      });
    }, [
      whetherToDownloadFile,
      onShouldStartDownloadWithRequestCallback,
      updateResources,
      t,
    ]);

    return (
      <View style={styles.webViewContainer}>
        {url !== 'about:blank' && progress !== 1 ? (
          <Progress progress={progress} width={dimension.deviceWidth} />
        ) : null}
        <ViewShot
          style={styles.viewShot}
          ref={r => {
            if (r) {
              viewShotRef.current = r;
            }
          }}
          options={{
            format: 'png',
            result: 'data-uri',
            width: viewShotWidth,
            height: viewShotHeight,
            quality: 0.1,
          }}>
          {errorValue ? (
            <ErrorView
              style={[
                styles.error,
                {backgroundColor: theme?.colors.background},
              ]}
              code={errorValue.code}
              description={errorValue.description}
              reload={reload}
            />
          ) : null}
          {!errorValue && url === 'about:blank' ? (
            <WelcomeView
              style={[
                styles.welcome,
                {backgroundColor: theme?.colors.background},
              ]}
              setCurrentWebViewSource={setCurrentWebViewSource}
            />
          ) : null}
          <RNWebView
            ref={r => {
              if (r) {
                webviewRef.current = r;
                if (ref && typeof ref === 'object') {
                  ref.current = r;
                }
                if (ref && typeof ref === 'function') {
                  ref(r);
                }
              }
            }}
            forceDarkOn={theme?.dark || false}
            style={styles.webView}
            originWhitelist={['*']}
            source={webViewSource}
            userAgent={userAgent}
            mixedContentMode={mixedContentMode}
            textZoom={textZoom}
            // onMessage={handleMessage}
            setBuiltInZoomControls={true}
            setDisplayZoomControls={false}
            javaScriptCanOpenWindowsAutomatically={false}
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onLoadProgress={handleLoadProgress}
            onError={handleError}
            nativeConfig={{
              component: CustomWebView,
              props: {
                enableSniffingResources: !!enableSniffingResources,
              },
            }}
            geolocationEnabled={true}
            allowsFullscreenVideo={true}
            incognito={incognitoMode}
          />
        </ViewShot>
      </View>
    );
  });

const styles = StyleSheet.create({
  webViewContainer: {
    position: 'relative',
    flex: 1,
  },
  viewShot: {
    flex: 1,
  },
  error: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  welcome: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  webView: {
    flex: 1,
  },
  confirmContent: {
    padding: 10,
  },
});

export default withTheme<WebViewProps>(WebView, 'WebView');
