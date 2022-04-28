export interface ResultCode {
  code: number;
  message?: string;
}

export interface ResultData<t> extends ResultCode {
  data: t;
}

export type ResultList<t> = ResultData<{
  list: t[];
  pageNum: number;
  pageSize: number;
  total: number;
}>;

import * as appState from '@/servces/appState';
export const getWhetherIsFirstTimeToEnterApp =
  appState.getWhetherIsFirstTimeToEnterApp;
export const getAppSetting = appState.getAppSetting;
export const initAppDatabase = appState.initAppDatabase;
export const resetAppDatabase = appState.resetAppDatabase;
export const initAppStateTable = appState.initAppStateTable;
export const resetAppSetting = appState.resetAppSetting;
export const setAppState = appState.setAppState;

import * as bookmark from '@/servces/bookmark';
export const initBookmarkTable = bookmark.initBookmarkTable;
export const insertOrReplaceBookmark = bookmark.insertOrReplaceBookmark;
export const getBookmark = bookmark.getBookmark;
export const deleteBookmark = bookmark.deleteBookmark;
export const resetBookmark = bookmark.resetBookmark;
export const getBookmarksPresentInUrls = bookmark.getBookmarksPresentInUrls;

import * as history from '@/servces/history';
export const initHistoryTable = history.initHistoryTable;
export const insertOrReplaceHistory = history.insertOrReplaceHistory;
export const getHistory = history.getHistory;
export const deleteHistory = history.deleteHistory;
export const resetHistory = history.resetHistory;

import * as homePage from '@/servces/homePage';
export const initHomePageTable = homePage.initHomePageTable;
export const insertOrReplaceHomePage = homePage.insertOrReplaceHomePage;
export const getHomePage = homePage.getHomePage;
export const deleteHomePage = homePage.deleteHomePage;
export const resetHomePage = homePage.resetHomePage;
export const insertDefaultHomePage = homePage.insertDefaultHomePage;
export const getHomePagesPresentInUrls = homePage.getHomePagesPresentInUrls;

import * as searchEngine from '@/servces/searchEngine';
export const initSearchEngineTable = searchEngine.initSearchEngineTable;
export const insertOrReplaceSearchEngine =
  searchEngine.insertOrReplaceSearchEngine;
export const getSearchEngine = searchEngine.getSearchEngine;
export const deleteSearchEngine = searchEngine.deleteSearchEngine;
export const resetSearchEngine = searchEngine.resetSearchEngine;
export const insertDefaultSearchEngine = searchEngine.insertDefaultSearchEngine;
export const getSearchEnginePresentInUrls =
  searchEngine.getSearchEnginePresentInUrls;

import * as userAgent from '@/servces/userAgent';
export const initUserAgentTable = userAgent.initUserAgentTable;
export const insertOrReplaceUserAgent = userAgent.insertOrReplaceUserAgent;
export const getUserAgent = userAgent.getUserAgent;
export const deleteUserAgent = userAgent.deleteUserAgent;
export const resetUserAgent = userAgent.resetUserAgent;
export const insertDefaultUserAgent = userAgent.insertDefaultUserAgent;
export const getUserAgentPresentInStrings =
  userAgent.getUserAgentPresentInStrings;

import * as shortcut from '@/servces/shortcut';
export const initShortcutTable = shortcut.initShortcutTable;
export const insertOrReplaceShortcut = shortcut.insertOrReplaceShortcut;
export const getShortcut = shortcut.getShortcut;
export const deleteShortcut = shortcut.deleteShortcut;
export const resetShortcut = shortcut.resetShortcut;
export const insertDefaultShortcut = shortcut.insertDefaultShortcut;
export const getShortcutsPresentInUrls = shortcut.getShortcutsPresentInUrls;

import * as download from '@/servces/download';
export const initDownloadTable = download.initDownloadTable;
export const insertOrReplaceDownload = download.insertOrReplaceDownload;
export const getDownload = download.getDownload;
export const deleteDownload = download.deleteDownload;
export const resetDownload = download.resetDownload;

import * as adsBlocker from '@/servces/adsBlocker';
export const saveNetworkDataToEngine = adsBlocker.saveNetworkDataToEngine;
export const saveLocalDataToEngine = adsBlocker.saveLocalDataToEngine;
export const getAdsBlockerEngine = adsBlocker.getAdsBlockerEngine;
export const removeEngine = adsBlocker.removeEngine;

// export const initAdsBlockerRule = adsBlocker.initAdsBlockerRule;
// export const insertAdsBlockerRules = adsBlocker.insertAdsBlockerRules;
// export const getAdsBlockerRules = adsBlocker.getAdsBlockerRules;
// export const resetAdsBlockerRule = adsBlocker.resetAdsBlockerRule;
