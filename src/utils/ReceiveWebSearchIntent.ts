import {NativeModules, NativeEventEmitter} from 'react-native';

export interface Intent {
  action: string;
  data: string;
  categories: string[];
  extras: {
    [k: string]: any;
  };
}

class ReceiveWebSearchIntent {
  private mReceiveWebSearchIntent;
  private mNativeEventEmitter;
  constructor() {
    this.mReceiveWebSearchIntent = NativeModules.ReceiveWebSearchIntent;
    this.mNativeEventEmitter = new NativeEventEmitter(
      NativeModules.ReceiveWebSearchIntent,
    );
  }
  addListener(eventType: 'WebSearch' | string, listener: (event: any) => void) {
    this.mNativeEventEmitter.addListener(eventType, listener);
  }
  removeAllListeners(eventType: 'WebSearch' | string) {
    this.mNativeEventEmitter.removeAllListeners(eventType);
  }
  getWebSearchIntent() {
    return this.mReceiveWebSearchIntent.getWebSearchIntent();
  }
}

export default new ReceiveWebSearchIntent();
