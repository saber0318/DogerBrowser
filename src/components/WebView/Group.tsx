import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {StyleSheet, View, Text, ViewStyle} from 'react-native';
import {WebViewSource} from 'react-native-webView/lib/WebViewTypes';
import {useUIState} from '@/stores';
import {ThemeForwardRefRenderFunction, withTheme} from '@/theme';
import WebView, {
  WebViewRef,
  WebViewState,
  DEFAULT_WEBVIEW_STATE,
  CaptureCallBack,
} from './WebView';

export type OnWebViewGroupChange = (list: WebViewGroupItem[]) => void;
export type OnCurrentWebViewChange = (
  item: WebViewGroupItem | undefined,
) => void;
export type WebViewGroupProps = {
  style?: ViewStyle;
  onWebViewGroupChange: OnWebViewGroupChange;
  onCurrentWebViewChange: OnCurrentWebViewChange;
};
export type WebViewGroupItem = {
  id: number;
  webViewSource: WebViewSource;
  state: WebViewState;
};
export type SetCurrentWebViewSource = (webViewSource: WebViewSource) => void;
export type SetCurrentWebViewId = (id: number) => void;
export type CreateWebView = (url?: string) => void;
export type DelWebView = (id: number) => void;
export type ClearCache = (flag: boolean) => void;
export type ClearHistory = () => void;
export type ClearFromData = () => void;
export type ClearCookie = () => void;
export type UpdateSniffResources = () => void;
export type DownloadFile = (url: string, fileName: string) => void;
export type GetCurrentWebView = () => WebViewGroupItem | null;
export type GetCurrentWebViewIndex = () => number;
export type InjectJavaScript = (func: string) => void;
export const enum WebViewGroupActType {
  GO_BACK = 'goBack',
  GO_FORWARD = 'goForward',
  RELOAD = 'reload',
  STOP_LOADING = 'stopLoading',
  SET_CURRENT_WEBVIEW_SOURCE = 'setCurrentWebViewSource',
  SET_CURRENT_WEBVIEW_ID = 'setCurrentWebView',
  CREATE_WEBVIEW = 'createWebView',
  DEL_WEBVIEW = 'delWebView',
  CAPTURE = 'capture',
  CLEAR_FROM_DATA = 'clearFormData',
  CLEAR_CACHE = 'clearCache',
  CLEAR_HISTORY = 'clearHistory',
  CLEAR_COOKIE = 'clearCookie',
  UPDATE_SNIFF_RESOURCES = 'updateSniffResources',
  DOWNLOAD_FILE = 'downloadFile',
  INJECT_JAVA_SCRIPT = 'injectJavaScript',
}
export interface WebViewGroupAct {
  (
    type:
      | WebViewGroupActType.GO_BACK
      | WebViewGroupActType.GO_FORWARD
      | WebViewGroupActType.RELOAD
      | WebViewGroupActType.STOP_LOADING,
  ): void;
  (
    type: WebViewGroupActType.SET_CURRENT_WEBVIEW_SOURCE,
    webViewSource: WebViewSource,
  ): void;
  (type: WebViewGroupActType.CREATE_WEBVIEW, url?: string): void;
  (
    type:
      | WebViewGroupActType.SET_CURRENT_WEBVIEW_ID
      | WebViewGroupActType.DEL_WEBVIEW,
    id: number,
  ): void;
  (type: WebViewGroupActType.CAPTURE, cb?: CaptureCallBack): void;
  (type: WebViewGroupActType.CLEAR_FROM_DATA): void;
  (type: WebViewGroupActType.CLEAR_CACHE, clear: boolean): void;
  (type: WebViewGroupActType.CLEAR_HISTORY): void;
  (type: WebViewGroupActType.CLEAR_COOKIE): void;
  (type: WebViewGroupActType.UPDATE_SNIFF_RESOURCES): void;
  (
    type: WebViewGroupActType.DOWNLOAD_FILE,
    url: string,
    fileName: string,
  ): void;
  (type: WebViewGroupActType.INJECT_JAVA_SCRIPT, func: string): void;
}
export interface WebViewGroupRef {
  webViewGroupAct: WebViewGroupAct;
}

const useCurrentWebViewRef = (
  webViewGroup: WebViewGroupItem[],
  currentWebViewId: number,
  webViewRefs: React.RefObject<WebViewRef[]>,
) => {
  const [webView, setWebView] = useState<WebViewRef>();
  useEffect(() => {
    if (webViewGroup && webViewRefs && webViewRefs.current) {
      const index = webViewGroup.findIndex(
        item => item.id === currentWebViewId,
      );
      const w = webViewRefs.current[index];
      setWebView(w);
    }
  }, [webViewGroup, currentWebViewId, webViewRefs]);
  return webView;
};

const useCurrentWebviewItem = (
  webViewGroup: WebViewGroupItem[],
  currentWebViewId: number,
) => {
  const [currentWebViewItem, setCurrentWebViewItem] =
    useState<WebViewGroupItem>();
  useEffect(() => {
    // console.log('useCurrentWebviewItem', webViewGroup);
    if (webViewGroup && webViewGroup.length) {
      const index = webViewGroup.findIndex(
        item => item.id === currentWebViewId,
      );
      if (index > -1) {
        const w = webViewGroup[index];
        setCurrentWebViewItem(w);
      } else {
        setCurrentWebViewItem(undefined);
      }
    }
  }, [webViewGroup, currentWebViewId]);
  return currentWebViewItem;
};

const DEFAULT_WEBVIEW_ID = 1;
const useDefaultWebView = (url: string) => {
  const [detaultWebView, setDetaultWebView] = useState<WebViewGroupItem>(
    genWebView(url),
  );
  useEffect(() => {
    setDetaultWebView(genWebView(url));
  }, [url]);
  return detaultWebView;
};

const genWebView = (url: string) => {
  return {
    id: DEFAULT_WEBVIEW_ID,
    webViewSource: {uri: url},
    state: {
      ...DEFAULT_WEBVIEW_STATE,
      url: url,
    },
  };
};

const WebViewGroup: ThemeForwardRefRenderFunction<{}, WebViewGroupProps> =
  forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
      webViewGroupAct: webViewGroupAct,
    }));

    const {
      onWebViewGroupChange = () => {},
      onCurrentWebViewChange = () => {},
      style = {},
      theme,
    } = props;

    const {homePage} = useUIState();
    const defaultWebView = useDefaultWebView(homePage);

    const [webViewGroup, setWebViewGroup] = useState<WebViewGroupItem[]>([
      defaultWebView,
    ]);

    useEffect(() => {
      onWebViewGroupChange(webViewGroup);
    }, [webViewGroup, onWebViewGroupChange]);

    const [maxId, setMaxId] = useState<number>(DEFAULT_WEBVIEW_ID);

    const createWebView = useCallback<CreateWebView>(
      url => {
        const webView = url ? genWebView(url) : defaultWebView;
        const id = maxId + 1;
        const list = [
          ...webViewGroup,
          {
            ...webView,
            id,
          },
        ];
        // console.log('WebViewGroup.tsx createWebView', webViewGroup, list);
        setWebViewGroup(list);
        setMaxId(id);
        setCurrentWebViewId(id);
      },
      [maxId, webViewGroup, defaultWebView],
    );

    useEffect(() => {
      // 创建新的窗口
      if (webViewGroup.length === 0) {
        createWebView();
      }
    }, [createWebView, webViewGroup]);

    const [currentWebViewId, setCurrentWebViewId] =
      useState<number>(DEFAULT_WEBVIEW_ID);

    const currentWebViewItem = useCurrentWebviewItem(
      webViewGroup,
      currentWebViewId,
    );
    useEffect(() => {
      // console.log('currentWebViewItem', currentWebViewItem);
      onCurrentWebViewChange(currentWebViewItem);
    }, [currentWebViewItem, onCurrentWebViewChange]);

    const webViewRefs = useRef<WebViewRef[]>(
      Array(webViewGroup.length).fill(React.createRef<WebViewRef>()),
    );

    const currentWebViewRef = useCurrentWebViewRef(
      webViewGroup,
      currentWebViewId,
      webViewRefs,
    );

    const handleWebViewStateChangeChange = (
      state: WebViewState,
      index: number,
    ) => {
      // console.log('handleWebViewStateChangeChange state index: ', state, index);
      const list = [...webViewGroup];
      // 结束加载时 将webViewSource的uri值改为当前state值，解决 因为webViewSource值未改变 引起的 搜索相同值不跳转 的问题
      if (state.progress === 1) {
        list[index] = {
          ...list[index],
          webViewSource: {uri: state.url},
          state: {...state},
        };
      } else {
        list[index] = {...list[index], state: {...state}};
      }
      setWebViewGroup(list);
    };

    const webViewGroupAct: WebViewGroupAct = (
      type: WebViewGroupActType,
      arg1?: WebViewSource | number | CaptureCallBack | boolean | string,
      arg2?: string,
    ) => {
      if (
        type === WebViewGroupActType.SET_CURRENT_WEBVIEW_SOURCE &&
        typeof arg1 === 'object'
      ) {
        setCurrentWebViewSource(arg1);
      } else if (
        type === WebViewGroupActType.SET_CURRENT_WEBVIEW_ID &&
        typeof arg1 === 'number'
      ) {
        setCurrentWebView(arg1);
      } else if (type === WebViewGroupActType.CREATE_WEBVIEW && !arg1) {
        createWebView();
      } else if (
        type === WebViewGroupActType.CREATE_WEBVIEW &&
        typeof arg1 === 'string'
      ) {
        createWebView(arg1);
      } else if (
        type === WebViewGroupActType.DEL_WEBVIEW &&
        typeof arg1 === 'number'
      ) {
        delWebView(arg1);
      } else if (
        type === WebViewGroupActType.GO_BACK ||
        type === WebViewGroupActType.GO_FORWARD ||
        type === WebViewGroupActType.RELOAD ||
        type === WebViewGroupActType.STOP_LOADING
      ) {
        currentWebViewRef?.[type]();
      } else if (
        type === WebViewGroupActType.CAPTURE &&
        typeof arg1 === 'function'
      ) {
        if (currentWebViewRef?.capture) {
          currentWebViewRef?.capture(arg1);
        }
      } else if (type === WebViewGroupActType.CAPTURE && !arg1) {
        if (currentWebViewRef?.capture) {
          currentWebViewRef?.capture();
        }
      } else if (type === WebViewGroupActType.CLEAR_FROM_DATA) {
        if (webViewRefs.current.length) {
          webViewRefs.current.forEach(item => {
            item.clearFormData();
          });
        }
      } else if (type === WebViewGroupActType.CLEAR_COOKIE) {
        if (webViewRefs.current.length) {
          webViewRefs.current.forEach(item => {
            if (item.clearCookie) {
              item.clearCookie();
            }
          });
        }
      } else if (type === WebViewGroupActType.UPDATE_SNIFF_RESOURCES) {
        if (currentWebViewRef?.updateSniffResources) {
          currentWebViewRef?.updateSniffResources();
        }
      } else if (
        type === WebViewGroupActType.DOWNLOAD_FILE &&
        typeof arg1 === 'string' &&
        typeof arg2 === 'string'
      ) {
        if (currentWebViewRef?.downloadFile) {
          currentWebViewRef?.downloadFile(arg1, arg2);
        }
      } else if (
        type === WebViewGroupActType.CLEAR_CACHE &&
        typeof arg1 === 'boolean'
      ) {
        if (webViewRefs.current.length) {
          webViewRefs.current.forEach(item => {
            item.clearCache(arg1);
          });
        }
      } else if (type === WebViewGroupActType.CLEAR_HISTORY) {
        if (webViewRefs.current.length) {
          webViewRefs.current.forEach(item => {
            item.clearHistory();
          });
          const w: WebViewGroupItem[] = [];
          webViewGroup.forEach(i => {
            w.push({
              ...i,
              state: {...i.state, canGoBack: false, canGoForward: false},
            });
          });
          setWebViewGroup(w);
        }
      } else if (
        type === WebViewGroupActType.INJECT_JAVA_SCRIPT &&
        typeof arg1 === 'string'
      ) {
        if (currentWebViewRef?.injectJavaScript) {
          currentWebViewRef?.injectJavaScript(arg1);
        }
      } else {
        throw new Error('未定义的方法');
      }
    };

    const delWebView: DelWebView = id => {
      // console.log('WebViewGroup.tsx delWebView', id);
      // 如果当前只有一个窗口，删除后再创建新的窗口
      if (webViewGroup.length <= 1) {
        setWebViewGroup([]);
      }
      if (webViewGroup.length > 1) {
        const index = webViewGroup.findIndex(item => item.id === id);
        if (index > -1) {
          const list = [...webViewGroup];
          list.splice(index, 1);
          setWebViewGroup(list);
          // 如果删除的是当前的窗口、设置列表最后一位为当前窗口
          if (currentWebViewId === id) {
            setCurrentWebViewId(list[list.length - 1].id);
          }
        }
      }
    };

    const getCurrentWebViewIndex: GetCurrentWebViewIndex = () => {
      return webViewGroup.findIndex(item => item.id === currentWebViewId);
    };

    const setCurrentWebViewSource: SetCurrentWebViewSource = webViewSource => {
      const index = getCurrentWebViewIndex();
      if (index > -1) {
        const list = [...webViewGroup];
        list[index] = {...list[index], ...{webViewSource}};
        setWebViewGroup(list);
      }
    };

    const setCurrentWebView: SetCurrentWebViewId = id => {
      setCurrentWebViewId(id);
    };

    const renderWebViewGroup = () => {
      return webViewGroup.map((item, index) => {
        const zIndex = currentWebViewId === item.id ? 1 : 0;
        return (
          <View
            key={item.id}
            style={[
              styles.webViewContainer,
              {zIndex, backgroundColor: theme?.colors.background},
            ]}>
            <WebView
              id={item.id}
              ref={(webViewRef: WebViewRef) => {
                if (webViewRef) {
                  webViewRefs.current[index] = webViewRef;
                }
              }}
              webViewSource={item.webViewSource}
              setCurrentWebViewSource={setCurrentWebViewSource}
              onWebViewStateChange={(state: WebViewState) => {
                handleWebViewStateChangeChange(state, index);
              }}
            />
          </View>
        );
      });
    };

    return (
      <View
        style={[
          styles.webViewGroup,
          {backgroundColor: theme?.colors.background},
          style,
        ]}>
        {renderWebViewGroup()}
      </View>
    );
  });

const styles = StyleSheet.create({
  webViewGroup: {
    position: 'relative',
    flex: 1,
    zIndex: 1,
  },
  webViewContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});

export default withTheme<WebViewGroupProps>(WebViewGroup, 'WebViewGroup');
