import {requireNativeComponent} from 'react-native';

export const CustomWebViewName = 'RCTCustomWebView';

export const RCTCustomWebView: any = requireNativeComponent(CustomWebViewName);

export const nativeConfig = {component: RCTCustomWebView};
