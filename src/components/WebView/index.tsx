import WebView from './WebView';
import Group from './Group';

export type {
  WebViewState,
  SetWebViewSource,
  SetWebViewState,
  OnWebViewStateChange,
  GoBack,
  GoForward,
  Reload,
  StopLoading,
  CaptureCallBack,
  Capture,
  WebViewRef,
  WebViewProps,
} from './WebView';
export {DEFAULT_WEBVIEW_STATE} from './WebView';
export type {
  OnWebViewGroupChange,
  OnCurrentWebViewChange,
  WebViewGroupProps,
  WebViewGroupItem,
  WebViewGroupAct,
  WebViewGroupRef,
  SetCurrentWebViewSource,
  SetCurrentWebViewId,
  CreateWebView,
  DelWebView,
  ClearCache,
  ClearHistory,
  ClearCookie,
  ClearFromData,
  GetCurrentWebView,
  GetCurrentWebViewIndex,
  UpdateSniffResources,
  DownloadFile,
  InjectJavaScript,
} from './Group';
export {WebViewGroupActType} from './Group';

type InternalWebView = typeof WebView;
type RefWebView = InternalWebView & {
  Group: typeof Group;
};

const RefWebView = WebView as RefWebView;
RefWebView.Group = Group;

export default RefWebView;
