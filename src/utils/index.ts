import ExtraDimensions from 'react-native-extra-dimensions-android';
import {
  parse as parseByTldts,
  getHostname as getHostnameByTldts,
  getDomain as getDomainByTldts,
} from 'tldts';
import {getAppSetting} from '@/servces';
import {DEFAULT_HOME_PAGE, DEFAULT_SEARCH_ENGINE} from '@/config/default';

export const dealUrl = (url: string) => {
  if (!url) {
    return url;
  }

  const v = url.trim();

  if (v === 'about:blank') {
    return v;
  }

  const parse = parseByTldts(v);
  // console.log('parse', parse);
  // 协议
  const protocolPattern = '^((https|http|ftp|rtsp|mms)?://)';
  if (new RegExp(protocolPattern).test(v)) {
    return v;
  }

  // ip4
  if (parse.isIp) {
    return 'https://' + v;
  }

  // 域名
  if (parse.domain) {
    return 'https://' + v;
  }

  return v;
};

export interface ValidateUrlResult {
  error: boolean;
}
/**
 * 判断是否是url
 * @param {string | undefined} val
 * @return {ValidateUrlResult}
 * @description url格式 协议://主机[:端口]/[路径][?查询语句]
 */
export const validateUrl = (val: string | undefined): ValidateUrlResult => {
  const defaultResult = {
    error: false,
  };

  if (!val) {
    return {
      error: true,
    };
  }

  if (val === 'about:blank') {
    return defaultResult;
  }

  const parse = parseByTldts(val);
  // console.log('parse', parse);

  // ip4
  if (parse.isIp) {
    return defaultResult;
  }

  // 域名
  if (parse.domain) {
    return defaultResult;
  }

  return {
    error: true,
  };
};

export const baseWidth = ExtraDimensions.get('REAL_WINDOW_WIDTH');

export const baseHeight = ExtraDimensions.get('REAL_WINDOW_HEIGHT');

export const isSoftMenuBarEnabled = ExtraDimensions.isSoftMenuBarEnabled();

export const statusBarHeight = ExtraDimensions.getStatusBarHeight();

export const softMenuBarHeight = ExtraDimensions.getSoftMenuBarHeight();

export const smartBarHeight = ExtraDimensions.getSmartBarHeight();

// export const statusBarHeight = StatusBar.currentHeight || 0;

export const navHeight = 40;

export const pageHeaderHeight = 28;

export const getProcessedUrl = async (val: string | undefined) => {
  const g = await getAppSetting();
  let searchEngine = DEFAULT_SEARCH_ENGINE;
  let homePage = DEFAULT_HOME_PAGE;

  if (g?.data?.searchEngine) {
    searchEngine = g.data.searchEngine;
  }
  if (g?.data?.homePage) {
    homePage = g.data.homePage;
  }
  if (!val) {
    return dealUrl(homePage);
  }
  const v = val.trim();
  if (v === '') {
    return dealUrl(homePage);
  }
  const result = validateUrl(val);
  if (!result.error) {
    return dealUrl(v);
  }
  if (result.error) {
    return searchEngine.replace('$1', val);
  }
  return dealUrl(homePage);
};

export const getHostname = (url: string) => {
  if (url === 'about:blank') {
    return url;
  }
  return getHostnameByTldts(url.trim());
};

export const getDomain = (url: string) => {
  if (url === 'about:blank') {
    return url;
  }
  return getDomainByTldts(url.trim());
};

export const parseUrl = (url: string) => {
  if (!url) {
    return;
  }
  const v = url.trim();
  const parse = parseByTldts(v);
  return parse;
};

export const safeDecodingURI = (url: string) => {
  let u = url;
  try {
    u = decodeURI(url);
  } catch (error) {
    u = url;
  }
  return u;
};
