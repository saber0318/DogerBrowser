import {
  NativeModules,
  // NativeEventEmitter
} from 'react-native';
import {DownloadItem} from '@/pages/Download';

export interface Intent {
  action: string;
  data: string;
  categories: string[];
  extras: {
    [k: string]: any;
  };
}

export const DownloadConstants = {
  FAILED: NativeModules.CustomDownloadManger.STATUS_FAILED, // 16
  PAUSED: NativeModules.CustomDownloadManger.STATUS_PAUSED, // 4
  PENDING: NativeModules.CustomDownloadManger.STATUS_PENDING, // 1
  RUNNING: NativeModules.CustomDownloadManger.STATUS_RUNNING, // 2
  SUCCESSFUL: NativeModules.CustomDownloadManger.STATUS_SUCCESSFUL, // 8
  CANCELED: NativeModules.CustomDownloadManger.STATUS_CANCELED, // 20
  EXISTS: 1,
};

export type QueryStatusByDownloadIdCallback = (
  status: Partial<DownloadItem>,
) => void;

export type Callback = (result: number) => void;

class CustomDownloadManger {
  public mCustomDownloadManger;
  // private mNativeEventEmitter;
  constructor() {
    this.mCustomDownloadManger = NativeModules.CustomDownloadManger;
    // this.mNativeEventEmitter = new NativeEventEmitter(
    //   NativeModules.CustomDownloadManger,
    // );
  }
  queryStatusByDownloadId(
    id: number,
    callback: QueryStatusByDownloadIdCallback,
  ) {
    this.mCustomDownloadManger.queryStatusByDownloadId(id, callback);
  }
  pause(id: number, callback: Callback) {
    this.mCustomDownloadManger.pause(id, callback);
  }
  resume(id: number, callback: Callback) {
    this.mCustomDownloadManger.resume(id, callback);
  }
  remove(id: number, callback: Callback) {
    this.mCustomDownloadManger.remove(id, callback);
  }
  openFile(path: string) {
    this.mCustomDownloadManger.openFile(path);
  }
}

export default new CustomDownloadManger();
