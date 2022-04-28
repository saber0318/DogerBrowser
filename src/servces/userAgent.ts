import moment from 'moment';
import {
  createTable,
  deleteTable,
  // insertOrReplaceDataToTable,
  insertOrReplaceListToTable,
  selectDataFromTable,
  executeSql,
} from '@/utils/SQLite';
import {UserAgentItem} from '@/pages/UserAgent';
import {DEAULT_USER_AGENT_LIST} from '@/config/default';
import {ResultCode, ResultData} from './index';

export const APP_USER_AGENT_TABLE_NAME = 'app_user_agent_table';

export const initUserAgentTable = async () => {
  return await createTable({
    tableName: APP_USER_AGENT_TABLE_NAME,
    colums: 'id INTEGER PRIMARY KEY AUTOINCREMENT, title , string, time',
  });
};

export const insertDefaultUserAgent = async () => {
  const result: ResultCode = {code: 200};
  const request: Promise<ResultCode>[] = [];
  DEAULT_USER_AGENT_LIST.forEach(item => {
    request.push(
      insertOrReplaceUserAgent({
        id: null,
        title: item.title,
        string: item.string,
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

export const insertOrReplaceUserAgent = async (
  data: Omit<UserAgentItem, 'id'> | UserAgentItem,
) => {
  const result: ResultCode = {code: 200};
  // 如果id不存在，查重
  if (!data.id && data.id !== 0) {
    const totalExecute = await executeSql(
      `SELECT COUNT(*) AS total FROM ${APP_USER_AGENT_TABLE_NAME} WHERE string = '${data.string}'`,
    ).catch(err => {
      console.log('err', err);
      result.code = 500;
      result.message = err;
    });
    if (result.code === 200) {
      const row = totalExecute?.[0]?.rows.raw();
      if (row && row[0].total > 0) {
        result.code = 500;
        result.message = '用户代理已存在！';
        return result;
      }
    } else {
      return result;
    }
  }

  await insertOrReplaceListToTable({
    tableName: APP_USER_AGENT_TABLE_NAME,
    colums: ['id', 'string', 'title', 'time'],
    list: [
      [
        'id' in data && data.id ? data.id : null,
        data.string,
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

export const getUserAgent = async () => {
  const result: ResultData<UserAgentItem[]> = {
    code: 200,
    data: [],
    message: '',
  };
  const listExecute = await selectDataFromTable({
    tableName: APP_USER_AGENT_TABLE_NAME,
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
export const getUserAgentPresentInStrings = async (
  strings: (string | undefined)[],
) => {
  const result: ResultData<UserAgentItem[]> = {
    code: 200,
    data: [],
    message: '',
  };
  const execute = await executeSql(
    `SELECT * FROM ${APP_USER_AGENT_TABLE_NAME} WHERE string IN (${strings
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

export const deleteUserAgent = async ({
  ids = [],
  strings = [],
}: {
  ids?: number[];
  strings?: string[];
}) => {
  const result: ResultData<{total: number}> = {
    code: 200,
    data: {total: 0},
    message: '',
  };
  if (ids.length > 0) {
    await executeSql(
      `DELETE FROM ${APP_USER_AGENT_TABLE_NAME} WHERE id IN (${ids.join(',')})`,
    ).catch(err => {
      console.log('err', err);
      result.code = 500;
      result.message = err;
    });
  }

  if (strings.length > 0) {
    await executeSql(
      `DELETE FROM ${APP_USER_AGENT_TABLE_NAME} WHERE string IN (${strings
        .map(item => `'${item}'`)
        .join(',')})`,
    ).catch(err => {
      console.log('err', err);
      result.code = 500;
      result.message = err;
    });
  }

  const totalExecute = await executeSql(
    `SELECT COUNT(*) AS total FROM ${APP_USER_AGENT_TABLE_NAME}`,
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

export const resetUserAgent = async () => {
  await deleteTable(APP_USER_AGENT_TABLE_NAME);
};
