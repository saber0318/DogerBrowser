import {FiltersEngine} from '@cliqz/adblocker';
import textTypeEasyListChina from '@/assets/textTypeEasyListChina';

export const DEFAULT_HOME_PAGE = 'about:blank';
export const DEFAULT_SEARCH_ENGINE = 'https://www.baidu.com/s?wd=$1';
export const DETAULT_USER_AGENT = '';
export const DETAULT_MIXED_CONTENT_MODE = 'compatibility';
export const DETAULT_THEME_SETTING = 'followSystem';
export const DETAULT_LANGUAGE = 'none';
export const DEFAULT_WHETHER_TO_OPEN_APP = 'askEachTime'; // alwaysOpen askEachTime neverAllow
export const DEFAULT_WHETHER_TO_DOWNLOAD_FILE = 'askEachTime'; // alwaysDownload askEachTime neverAllow
export const DEFAULT_TEXT_ZOOM = 100;
export const DEFAULT_INCOGNITO_MODE = false;
export const DEFAULT_ENABLE_BLOCK_ADS = false;
export const DEFAULT_ADS_BLOCKER_DATA = textTypeEasyListChina;
export const DEFAULT_ADS_BLOCKER_TIME = '2022-03-25 00:02:06';
export const DEFAULT_ADS_BLOCKER = {
  engine: FiltersEngine.parse(DEFAULT_ADS_BLOCKER_DATA),
  time: DEFAULT_ADS_BLOCKER_TIME,
};
export const DEFAULT_ENABLE_SNIFFING_RESOURCES = false;
export const DEFAULT_PAGE_NUM = 0;
export const DEFAULT_PAGE_SIZE = 15;
export const DEAULT_HOME_PAGE_LIST = [
  {
    title: 'about:blank',
    url: 'about:blank',
  },
  {
    title: '百度',
    url: 'https://www.baidu.com',
  },
  {
    title: 'Google',
    url: 'https://www.google.com',
  },
];
export const DEAULT_SEARCH_ENGINE_LIST = [
  {
    title: '百度',
    url: 'https://www.baidu.com/s?wd=$1',
  },
  {
    title: 'Google',
    url: 'https://www.google.com/search?q=$1',
  },
];
export const DEAULT_USER_AGENT_LIST = [
  {
    title: '',
    string: '',
  },
  {
    title: 'Mac OS X _ Chrome',
    string:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
  },
  {
    title: 'IPhone X _ Safari',
    string:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
  },
];
export const DEAULT_SHORTCUT_LIST = [
  {
    title: '百度',
    url: 'https://www.baidu.com',
  },
];
