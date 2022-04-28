import moment from 'moment';
import {
  createTable,
  deleteTable,
  // insertOrReplaceDataToTable,
  insertOrReplaceListToTable,
  selectDataFromTable,
  executeSql,
} from '@/utils/SQLite';
import {SearchEngineItem} from '@/pages/SearchEngine';
import {DEAULT_SEARCH_ENGINE_LIST} from '@/config/default';
import {ResultCode, ResultData} from './index';

export const APP_SEARCH_ENGINE_TABLE_NAME = 'app_search_engine_table';

export const initSearchEngineTable = async () => {
  return await createTable({
    tableName: APP_SEARCH_ENGINE_TABLE_NAME,
    colums: 'id INTEGER PRIMARY KEY AUTOINCREMENT, title , url, time',
  });
};

export const insertDefaultSearchEngine = async () => {
  const result: ResultCode = {code: 200};
  const request: Promise<ResultCode>[] = [];
  DEAULT_SEARCH_ENGINE_LIST.forEach(item => {
    request.push(
      insertOrReplaceSearchEngine({
        id: null,
        title: item.title,
        url: item.url,
        time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      }),
    );
  });
  await Promise.all(request).catch(err => {
    result.code = 500;
    result.message = err;
  });
  return result;
};

export const insertOrReplaceSearchEngine = async (
  data: Omit<SearchEngineItem, 'id'> | SearchEngineItem,
) => {
  const result: ResultCode = {code: 200};
  // 如果id不存在，查重
  if (!data.id && data.id !== 0) {
    const totalExecute = await executeSql(
      `SELECT COUNT(*) AS total FROM ${APP_SEARCH_ENGINE_TABLE_NAME} WHERE url = '${data.url}'`,
    ).catch(err => {
      console.log('err', err);
      result.code = 500;
      result.message = err;
    });
    if (result.code === 200) {
      const row = totalExecute?.[0]?.rows.raw();
      if (row && row[0].total > 0) {
        result.code = 500;
        result.message = '搜索引擎已存在！';
        return result;
      }
    } else {
      return result;
    }
  }

  await insertOrReplaceListToTable({
    tableName: APP_SEARCH_ENGINE_TABLE_NAME,
    colums: ['id', 'url', 'title', 'time'],
    list: [
      [
        'id' in data && data.id ? data.id : null,
        data.url,
        data.title,
        data.time,
      ],
    ],
  }).catch(err => {
    console.log('err', err);
    result.code = 500;
    result.message = err;
  });
  return result;
};

export const getSearchEngine = async () => {
  const result: ResultData<SearchEngineItem[]> = {
    code: 200,
    data: [],
    message: '',
  };
  const listExecute = await selectDataFromTable({
    tableName: APP_SEARCH_ENGINE_TABLE_NAME,
    order: 'DATETIME(time) DESC',
  }).catch(err => {
    console.log('err', err);
    result.code = 500;
    result.message = err;
  });
  if (listExecute && result.code === 200) {
    const row = listExecute[0]?.rows.raw() || [];
    result.data = row;
  }
  return result;
};

// 返回已经存在
export const getSearchEnginePresentInUrls = async (urls: string[]) => {
  const result: ResultData<SearchEngineItem[]> = {
    code: 200,
    data: [],
    message: '',
  };
  const execute = await executeSql(
    `SELECT * FROM ${APP_SEARCH_ENGINE_TABLE_NAME} WHERE url IN (${urls
      .map(item => `'${item}'`)
      .join(',')})`,
  ).catch(err => {
    console.log('err', err);
    result.code = 500;
    result.message = err;
  });
  if (execute && result.code === 200) {
    const row = execute[0]?.rows.raw() || [];
    result.data = row;
  }
  return result;
};

export const deleteSearchEngine = async ({
  ids = [],
  urls = [],
}: {
  ids?: number[];
  urls?: string[];
}) => {
  const result: ResultData<{total: number}> = {
    code: 200,
    data: {total: 0},
    message: '',
  };
  if (ids.length > 0) {
    await executeSql(
      `DELETE FROM ${APP_SEARCH_ENGINE_TABLE_NAME} WHERE id IN (${ids.join(
        ',',
      )})`,
    ).catch(err => {
      console.log('err', err);
      result.code = 500;
      result.message = err;
    });
  }

  if (urls.length > 0) {
    await executeSql(
      `DELETE FROM ${APP_SEARCH_ENGINE_TABLE_NAME} WHERE url IN (${urls
        .map(item => `'${item}'`)
        .join(',')})`,
    ).catch(err => {
      console.log('err', err);
      result.code = 500;
      result.message = err;
    });
  }

  const totalExecute = await executeSql(
    `SELECT COUNT(*) AS total FROM ${APP_SEARCH_ENGINE_TABLE_NAME}`,
  ).catch(err => {
    console.log('err', err);
    result.code = 500;
    result.message = err;
  });
  if (totalExecute && result.code === 200) {
    const row = totalExecute[0]?.rows.raw() || [{}];
    result.data.total = row[0].total || 0;
  }
  return result;
};

export const resetSearchEngine = async () => {
  await deleteTable(APP_SEARCH_ENGINE_TABLE_NAME);
};
