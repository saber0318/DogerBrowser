/**
 * base on
 * https://www.yuebaixu.com/replace-redux/
 */

import React, {ReactNode} from 'react';
import {MixedContentModeType} from '@/pages/MixedContentMode';
import {ThemeSetting} from '@/pages/ThemeSetting';
import {Language} from '@/pages/Language';
import {WhetherToOpenAppType} from '@/pages/WhetherToOpenApp';
import {WhetherToDownloadFileType} from '@/pages/WhetherToDownloadFile';
import {ShortcutItem} from '@/components/WebView/WelcomeView/Shortcut';
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
  DEFAULT_ADS_BLOCKER,
  DEFAULT_ENABLE_SNIFFING_RESOURCES,
} from '@/config/default';
import {setAppState, getShortcut} from '@/servces';
import {AdsBlocker} from '@/pages/AdsBlocker';
export interface DimensionType {
  deviceWidth: number; // 屏幕宽度
  deviceHeight: number; // 屏幕高度
  statusBarHeight: number; // 状态栏高度
  containerHeight: number; // 屏幕高度 减去 状态栏高度
  containerWidth: number;
  navHeight: number; // 导航栏高度
  webViewHeight: number; // 屏幕高度 减去 状态栏高度 减去 导航栏高度
  webViewWidth: number;
  pageHeaderHeight: number; // 页面头部高度
  orientation: 'LANDSCAPE' | 'PORTRAIT' | 'UNKNOWN' | 'PORTRAITUPSIDEDOWN'; // 旋转方向
}
export interface PagesVisible {
  customControlVisible: boolean;
  bookmarkVisible: boolean;
  historyVisible: boolean;
  clearDataVisible: boolean;
  homePageVisible: boolean;
  searchEngineVisible: boolean;
  userAgentVisible: boolean;
  mixedContentModeVisible: boolean;
  themeSettingVisible: boolean;
  languageVisible: boolean;
  whetherToOpenAppVisible: boolean;
  whetherToDownloadFileVisible: boolean;
  textZoomVisible: boolean;
  resetAppVisible: boolean;
  aboutVisible: boolean;
  toolVisible: boolean;
  settingVisible: boolean;
  downloadVisible: boolean;
  sniffResourcesVisible: boolean;
  adsBlockerVisible: boolean;
  scanVisible: boolean;
}

type PagesVisiblePayload = {
  [key in keyof PagesVisible]?: PagesVisible[key];
};

export interface AppSetting {
  homePage: string;
  searchEngine: string;
  userAgent: string;
  mixedContentMode: MixedContentModeType;
  themeSetting: ThemeSetting;
  language: Language;
  whetherToOpenApp: WhetherToOpenAppType;
  whetherToDownloadFile: WhetherToDownloadFileType;
  textZoom: number;
  incognitoMode: boolean;
  enableBlockAds: boolean;
  enableSniffingResources: boolean;
}
export interface AppState extends AppSetting {
  dimension: DimensionType;
  pagesVisible: PagesVisible;
  resources: string[];
  shortcut: ShortcutItem[];
  adsBlocker: AdsBlocker;
}

const initialContext: AppState = {
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
  enableSniffingResources: DEFAULT_ENABLE_SNIFFING_RESOURCES,
  resources: [],
  dimension: {
    deviceWidth: 0,
    deviceHeight: 0,
    statusBarHeight: 0,
    containerHeight: 0,
    containerWidth: 0,
    navHeight: 0,
    webViewHeight: 0,
    webViewWidth: 0,
    pageHeaderHeight: 0,
    orientation: 'UNKNOWN',
  },
  pagesVisible: {
    customControlVisible: false,
    bookmarkVisible: false,
    historyVisible: false,
    clearDataVisible: false,
    homePageVisible: false,
    searchEngineVisible: false,
    userAgentVisible: false,
    mixedContentModeVisible: false,
    themeSettingVisible: false,
    languageVisible: false,
    whetherToOpenAppVisible: false,
    whetherToDownloadFileVisible: false,
    textZoomVisible: false,
    resetAppVisible: false,
    aboutVisible: false,
    toolVisible: false,
    settingVisible: false,
    downloadVisible: false,
    sniffResourcesVisible: false,
    adsBlockerVisible: false,
    scanVisible: false,
  },
  shortcut: [],
  enableBlockAds: DEFAULT_ENABLE_BLOCK_ADS,
  adsBlocker: DEFAULT_ADS_BLOCKER,
};

export const enum ActionTypes {
  RESET = 'RESET',
  UPDATE = 'UPDATE',
  UPDATE_HOME_PAGE = 'UPDATE_HOME_PAGE',
  UPDATE_SEARCH_ENGINE = 'UPDATE_SEARCH_ENGINE',
  UPDATE_MIXED_CONTENT_MODE = 'UPDATE_MIXED_CONTENT_MODE',
  UPDATE_THEME_SETTING = 'UPDATE_THEME_SETTING',
  UPDATE_LANGUAGE = 'UPDATE_LANGUAGE',
  UPDATE_WHETHER_TO_OPEN_APP = 'UPDATE_WHETHER_TO_OPEN_APP',
  UPDATE_WHETHER_TO_DOWNLOAD_FILE = 'UPDATE_WHETHER_TO_DOWNLOAD_FILE',
  UPDATE_TEXT_ZOOM = 'UPDATE_TEXT_ZOOM',
  UPDATE_USER_AGENT = 'UPDATE_USER_AGENT',
  UPDATE_DIMENSION = 'UPDATE_DIMENSION',
  UPDATE_PAGES_VISIBLE = 'UPDATE_PAGES_VISIBLE',
  HIDE_PAGES = 'HIDE_PAGES',
  UPDATE_INCOGNITO_MODE = 'UPDATE_INCOGNITO_MODE',
  UPDATE_ENABLE_BLOCK_ADS = 'UPDATE_ENABLE_BLOCK_ADS',
  UPDATE_ADS_BLOCKER = 'UPDATE_ADS_BLOCKER',
  UPDATE_ENABLE_SNIFFING_RESOURCES = 'UPDATE_ENABLE_SNIFFING_RESOURCES',
  UPDATE_RESOURCES = 'UPDATE_RESOURCES',
  UPDATE_SHORTCUT = 'UPDATE_SHORTCUT',
}

export type UpdatePayload = {
  [key in keyof AppState]?: AppState[key];
};

type Action =
  | {type: ActionTypes.UPDATE; payload: UpdatePayload}
  | {type: ActionTypes.UPDATE_HOME_PAGE; payload: string}
  | {type: ActionTypes.UPDATE_SEARCH_ENGINE; payload: string}
  | {type: ActionTypes.UPDATE_USER_AGENT; payload: string}
  | {
      type: ActionTypes.UPDATE_MIXED_CONTENT_MODE;
      payload: MixedContentModeType;
    }
  | {type: ActionTypes.UPDATE_THEME_SETTING; payload: ThemeSetting}
  | {type: ActionTypes.UPDATE_LANGUAGE; payload: Language}
  | {
      type: ActionTypes.UPDATE_WHETHER_TO_OPEN_APP;
      payload: WhetherToOpenAppType;
    }
  | {
      type: ActionTypes.UPDATE_WHETHER_TO_DOWNLOAD_FILE;
      payload: WhetherToDownloadFileType;
    }
  | {
      type: ActionTypes.UPDATE_TEXT_ZOOM;
      payload: number;
    }
  | {type: ActionTypes.UPDATE_DIMENSION; payload: DimensionType}
  | {
      type: ActionTypes.UPDATE_PAGES_VISIBLE;
      payload: PagesVisiblePayload;
    }
  | {
      type: ActionTypes.HIDE_PAGES;
    }
  | {
      type: ActionTypes.UPDATE_INCOGNITO_MODE;
      payload: boolean;
    }
  | {
      type: ActionTypes.UPDATE_ENABLE_BLOCK_ADS;
      payload: boolean;
    }
  | {
      type: ActionTypes.UPDATE_ADS_BLOCKER;
      payload: AdsBlocker;
    }
  | {
      type: ActionTypes.UPDATE_ENABLE_SNIFFING_RESOURCES;
      payload: boolean;
    }
  | {
      type: ActionTypes.UPDATE_RESOURCES;
      payload: string[];
    }
  | {
      type: ActionTypes.UPDATE_SHORTCUT;
      payload: ShortcutItem[];
    };

const StateContext = React.createContext(initialContext);
const DispatchContext = React.createContext({} as React.Dispatch<Action>);

export const reducer = (state: AppState, action: Action) => {
  switch (action.type) {
    case ActionTypes.UPDATE:
      return {...state, ...action.payload};
    case ActionTypes.UPDATE_HOME_PAGE:
      return {...state, homePage: action.payload};
    case ActionTypes.UPDATE_SEARCH_ENGINE:
      return {...state, searchEngine: action.payload};
    case ActionTypes.UPDATE_USER_AGENT:
      return {...state, userAgent: action.payload};
    case ActionTypes.UPDATE_MIXED_CONTENT_MODE:
      return {...state, mixedContentMode: action.payload};
    case ActionTypes.UPDATE_THEME_SETTING:
      return {...state, themeSetting: action.payload};
    case ActionTypes.UPDATE_LANGUAGE:
      return {...state, language: action.payload};
    case ActionTypes.UPDATE_WHETHER_TO_OPEN_APP:
      return {...state, whetherToOpenApp: action.payload};
    case ActionTypes.UPDATE_WHETHER_TO_DOWNLOAD_FILE:
      return {...state, whetherToDownloadFile: action.payload};
    case ActionTypes.UPDATE_TEXT_ZOOM:
      return {...state, textZoom: action.payload};
    case ActionTypes.UPDATE_DIMENSION:
      return {...state, dimension: {...state.dimension, ...action.payload}};
    case ActionTypes.UPDATE_PAGES_VISIBLE:
      return {
        ...state,
        pagesVisible: {...state.pagesVisible, ...action.payload},
      };
    case ActionTypes.HIDE_PAGES:
      return {
        ...state,
        pagesVisible: {
          customControlVisible: false,
          bookmarkVisible: false,
          historyVisible: false,
          clearDataVisible: false,
          homePageVisible: false,
          searchEngineVisible: false,
          userAgentVisible: false,
          mixedContentModeVisible: false,
          themeSettingVisible: false,
          languageVisible: false,
          whetherToOpenAppVisible: false,
          whetherToDownloadFileVisible: false,
          textZoomVisible: false,
          resetAppVisible: false,
          aboutVisible: false,
          toolVisible: false,
          settingVisible: false,
          downloadVisible: false,
          sniffResourcesVisible: false,
          adsBlockerVisible: false,
          scanVisible: false,
        },
      };
    case ActionTypes.UPDATE_INCOGNITO_MODE:
      return {...state, incognitoMode: action.payload};
    case ActionTypes.UPDATE_ENABLE_BLOCK_ADS:
      return {...state, enableBlockAds: action.payload};
    case ActionTypes.UPDATE_ADS_BLOCKER:
      return {...state, adsBlocker: {...state.adsBlocker, ...action.payload}};
    case ActionTypes.UPDATE_ENABLE_SNIFFING_RESOURCES:
      return {...state, enableSniffingResources: action.payload};
    case ActionTypes.UPDATE_RESOURCES:
      return {...state, resources: action.payload};
    case ActionTypes.UPDATE_SHORTCUT:
      return {...state, shortcut: action.payload};
    default:
      return state;
  }
};

export const ContextProvider = ({children}: {children: ReactNode}) => {
  const [state, dispatch] = React.useReducer(reducer, initialContext);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

export const useUIState = () => {
  return React.useContext(StateContext);
};

export const useUIDispatch = () => {
  const dispatch = React.useContext(DispatchContext);
  if (dispatch === undefined) {
    throw new Error('useDispatch must be used within a Provider');
  }

  const update = React.useCallback(
    payload => {
      dispatch({type: ActionTypes.UPDATE, payload});
    },
    [dispatch],
  );

  const updateHomePage = React.useCallback(
    async payload => {
      await setAppState({homePage: payload});
      dispatch({type: ActionTypes.UPDATE_HOME_PAGE, payload});
    },
    [dispatch],
  );

  const updateSearchEngine = React.useCallback(
    async payload => {
      await setAppState({searchEngine: payload});
      dispatch({type: ActionTypes.UPDATE_SEARCH_ENGINE, payload});
    },
    [dispatch],
  );

  const updateUserAgent = React.useCallback(
    async payload => {
      await setAppState({userAgent: payload});
      dispatch({type: ActionTypes.UPDATE_USER_AGENT, payload});
    },
    [dispatch],
  );

  const updateMixedContentMode = React.useCallback(
    async payload => {
      await setAppState({
        mixedContentMode: payload,
      });
      dispatch({type: ActionTypes.UPDATE_MIXED_CONTENT_MODE, payload});
    },
    [dispatch],
  );

  const updateThemeSetting = React.useCallback(
    async payload => {
      await setAppState({
        themeSetting: payload,
      });
      dispatch({type: ActionTypes.UPDATE_THEME_SETTING, payload});
    },
    [dispatch],
  );

  const updateLanguage = React.useCallback(
    async payload => {
      await setAppState({
        language: payload,
      });
      dispatch({type: ActionTypes.UPDATE_LANGUAGE, payload});
    },
    [dispatch],
  );

  const updateWhetherToOpenApp = React.useCallback(
    async payload => {
      await setAppState({
        whetherToOpenApp: payload,
      });
      dispatch({type: ActionTypes.UPDATE_WHETHER_TO_OPEN_APP, payload});
    },
    [dispatch],
  );

  const updateWhetherToDownloadFile = React.useCallback(
    async payload => {
      await setAppState({
        whetherToDownloadFile: payload,
      });
      dispatch({type: ActionTypes.UPDATE_WHETHER_TO_DOWNLOAD_FILE, payload});
    },
    [dispatch],
  );

  const updateTextZoom = React.useCallback(
    async payload => {
      await setAppState({
        textZoom: payload,
      });
      dispatch({type: ActionTypes.UPDATE_TEXT_ZOOM, payload});
    },
    [dispatch],
  );

  const updateDimension = React.useCallback(
    payload => {
      dispatch({type: ActionTypes.UPDATE_DIMENSION, payload});
    },
    [dispatch],
  );

  const updatePagesVisible = React.useCallback(
    (payload: PagesVisiblePayload) => {
      dispatch({type: ActionTypes.UPDATE_PAGES_VISIBLE, payload});
    },
    [dispatch],
  );

  const hidePages = React.useCallback(() => {
    dispatch({
      type: ActionTypes.HIDE_PAGES,
    });
  }, [dispatch]);

  const updateIncognitoMode = React.useCallback(
    async payload => {
      await setAppState({
        incognitoMode: payload,
      });
      dispatch({type: ActionTypes.UPDATE_INCOGNITO_MODE, payload});
    },
    [dispatch],
  );

  const updateEnableBlockAds = React.useCallback(
    async payload => {
      await setAppState({
        enableBlockAds: payload,
      });
      dispatch({type: ActionTypes.UPDATE_ENABLE_BLOCK_ADS, payload});
    },
    [dispatch],
  );

  const updateAdsBlocker = React.useCallback(
    async payload => {
      dispatch({type: ActionTypes.UPDATE_ADS_BLOCKER, payload});
    },
    [dispatch],
  );

  const updateEnableSniffingResources = React.useCallback(
    async payload => {
      await setAppState({
        enableSniffingResources: payload,
      });
      dispatch({type: ActionTypes.UPDATE_ENABLE_SNIFFING_RESOURCES, payload});
    },
    [dispatch],
  );

  const updateResources = React.useCallback(
    payload => {
      dispatch({type: ActionTypes.UPDATE_RESOURCES, payload});
    },
    [dispatch],
  );

  const updateShortcut = React.useCallback(async () => {
    await getShortcut().then(res => {
      if (res.code === 200) {
        dispatch({type: ActionTypes.UPDATE_SHORTCUT, payload: res.data});
      }
    });
  }, [dispatch]);

  return React.useMemo(
    () => ({
      update,
      updateHomePage,
      updateSearchEngine,
      updateUserAgent,
      updateMixedContentMode,
      updateThemeSetting,
      updateLanguage,
      updateWhetherToOpenApp,
      updateWhetherToDownloadFile,
      updateTextZoom,
      updateDimension,
      updatePagesVisible,
      hidePages,
      updateIncognitoMode,
      updateEnableBlockAds,
      updateAdsBlocker,
      updateEnableSniffingResources,
      updateResources,
      updateShortcut,
    }),
    [
      update,
      updateHomePage,
      updateSearchEngine,
      updateUserAgent,
      updateMixedContentMode,
      updateThemeSetting,
      updateLanguage,
      updateWhetherToOpenApp,
      updateWhetherToDownloadFile,
      updateTextZoom,
      updateDimension,
      updatePagesVisible,
      hidePages,
      updateIncognitoMode,
      updateEnableBlockAds,
      updateAdsBlocker,
      updateEnableSniffingResources,
      updateResources,
      updateShortcut,
    ],
  );
};
