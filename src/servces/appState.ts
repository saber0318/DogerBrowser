import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createTable,
  deleteTable,
  insertOrReplaceListToTable,
  executeSql,
} from '@/utils/SQLite';
import {AppState, AppSetting} from '@/stores';
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
} from '@/config/default';
import {
  ResultCode,
  ResultData,
  initBookmarkTable,
  resetBookmark,
  initHistoryTable,
  resetHistory,
  initHomePageTable,
  resetHomePage,
  insertDefaultHomePage,
  initSearchEngineTable,
  resetSearchEngine,
  insertDefaultSearchEngine,
  initUserAgentTable,
  resetUserAgent,
  insertDefaultUserAgent,
  initShortcutTable,
  resetShortcut,
  insertDefaultShortcut,
  initDownloadTable,
  resetDownload,
  saveLocalDataToEngine,
  // initAdsBlockerRule,
  // resetAdsBlockerRule,
  // insertAdsBlockerRules,
} from './index';

// import arrayTypeEasyListChina from '@/assets/arrayTypeEasyListChina';

export const APP_STATE_TABLE_NAME = 'app_state_table';

// 获取当前是否是第一次进入app
export const getWhetherIsFirstTimeToEnterApp = async () => {
  const result: ResultData<boolean> = {
    code: 200,
    data: true,
    message: '',
  };

  const execute = await AsyncStorage.getItem('@not_first_in').catch(err => {
    console.log('err', err);
    result.code = 500;
    result.data = false;
    result.message = err;
  });

  result.data = execute === '1' ? false : true;

  return result;
};

// 初始化
export const initAppDatabase = async () => {
  const result: ResultCode = {code: 200};
  const initRequest = [];
  initRequest.push(initAppStateTable());
  initRequest.push(initBookmarkTable());
  initRequest.push(initHistoryTable());
  initRequest.push(initHomePageTable());
  initRequest.push(initSearchEngineTable());
  initRequest.push(initUserAgentTable());
  initRequest.push(initShortcutTable());
  initRequest.push(initDownloadTable());

  await Promise.all(initRequest).catch(err => {
    result.code = 500;
    result.message = err;
  });

  if (result.code === 200) {
    const setRequest = [];
    setRequest.push(AsyncStorage.setItem('@not_first_in', '1'));
    setRequest.push(insertDefaultAppState());

    await Promise.all(setRequest).catch(err => {
      result.code = 500;
      result.message = err;
    });
  }

  return result;
};

export const insertDefaultAppState = async () => {
  const result: ResultCode = {code: 200};
  const request = [];
  request.push(insertDefaultHomePage());
  request.push(insertDefaultSearchEngine());
  request.push(insertDefaultUserAgent());
  request.push(insertDefaultShortcut());
  await Promise.all(request).catch(err => {
    result.code = 500;
    result.message = err;
  });

  return result;
};

export const resetAppDatabase = async () => {
  const result: ResultCode = {code: 200};
  const deleteRequest = [];
  deleteRequest.push(resetAppSetting());
  deleteRequest.push(resetBookmark());
  deleteRequest.push(resetHistory());
  deleteRequest.push(resetHomePage());
  deleteRequest.push(resetSearchEngine());
  deleteRequest.push(resetUserAgent());
  deleteRequest.push(resetShortcut());
  deleteRequest.push(resetDownload());
  await Promise.all(deleteRequest).catch(err => {
    result.code = 500;
    result.message = err;
  });

  const resetRequest = [];
  resetRequest.push(insertDefaultAppState());
  resetRequest.push(saveLocalDataToEngine());
  await Promise.all(resetRequest).catch(err => {
    result.code = 500;
    result.message = err;
  });
  return result;
};

export const initAppStateTable = async () => {
  return await createTable({
    tableName: APP_STATE_TABLE_NAME,
    colums: 'key PRIMARY KEY, value',
  });
};

export const setAppState = async (data: {
  [key in keyof AppState]?: AppState[key];
}) => {
  const result: ResultCode = {code: 200};
  await insertOrReplaceListToTable({
    tableName: APP_STATE_TABLE_NAME,
    colums: ['key', 'value'],
    list: Object.keys(data).map(i => [i, data[i as keyof typeof data]]),
  }).catch(err => {
    console.log('err', err);
    result.code = 500;
    result.message = err;
  });
  return result;
};

export const getAppSetting = async () => {
  const result: ResultData<AppSetting> = {
    code: 200,
    data: {
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
    },
    message: '',
  };
  const where = Object.keys(result.data)
    .map(item => `key = "${item}"`)
    .join(' OR ');

  const sql = `SELECT * FROM ${APP_STATE_TABLE_NAME} WHERE ${where}`;
  const execute = await executeSql(sql).catch(err => {
    console.log('err', err);
    result.code = 500;
    result.message = err;
  });
  if (execute && result.code === 200) {
    const row = execute[0]?.rows.raw() || [];
    row.forEach((i: {key: keyof AppSetting; value: string | number}) => {
      if (
        i.key !== 'textZoom' &&
        i.key !== 'incognitoMode' &&
        i.key !== 'enableBlockAds' &&
        i.key !== 'enableSniffingResources' &&
        typeof i.value === 'string'
      ) {
        (result.data[i.key] as string) = i.value;
      }
      if (i.key === 'textZoom' && typeof i.value === 'number') {
        result.data[i.key] = i.value;
      }
      if (i.key === 'incognitoMode' && typeof i.value === 'number') {
        result.data[i.key] = !!i.value;
      }
      if (i.key === 'enableBlockAds' && typeof i.value === 'number') {
        result.data[i.key] = !!i.value;
      }
      if (i.key === 'enableSniffingResources' && typeof i.value === 'number') {
        result.data[i.key] = !!i.value;
      }
    });
  }
  return result;
};

export const resetAppSetting = async () => {
  return await deleteTable(APP_STATE_TABLE_NAME);
};
