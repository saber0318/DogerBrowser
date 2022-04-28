import {
  createTable,
  deleteTable,
  // insertOrReplaceDataToTable,
  insertOrReplaceListToTable,
  selectDataFromTable,
  executeSql,
} from '@/utils/SQLite';
import {HistoryItem} from '@/pages/History';
import {ResultCode, ResultData, ResultList} from './index';

export const APP_HISTORY_TABLE_NAME = 'app_history_table';

export const initHistoryTable = async () => {
  return await createTable({
    tableName: APP_HISTORY_TABLE_NAME,
    colums: 'id INTEGER PRIMARY KEY AUTOINCREMENT, title , url, time',
  });
};

export const insertOrReplaceHistory = async (
  data: Omit<HistoryItem, 'id'> | HistoryItem,
) => {
  const result: ResultCode = {code: 200};
  await insertOrReplaceListToTable({
    tableName: APP_HISTORY_TABLE_NAME,
    colums: ['id', 'title', 'url', 'time'],
    list: [
      [
        'id' in data && data.id ? data.id : null,
        data.title,
        data.url,
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

export const getHistory = async ({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) => {
  console.log('getHistory', pageNum, pageSize);
  const result: ResultList<HistoryItem> = {
    code: 200,
    data: {list: [], pageNum, pageSize, total: 0},
    message: '',
  };
  const totalExecute = await executeSql(
    `SELECT COUNT(*) AS total FROM ${APP_HISTORY_TABLE_NAME}`,
  ).catch(err => {
    console.log('err', err);
    result.code = 500;
    result.message = err;
  });
  if (totalExecute && result.code === 200) {
    const row = totalExecute[0]?.rows.raw() || [{}];
    result.data.total = row[0].total || 0;
  }
  const listExecute = await selectDataFromTable({
    tableName: APP_HISTORY_TABLE_NAME,
    pageNum,
    pageSize,
    order: 'DATETIME(time) DESC',
  }).catch(err => {
    console.log('err', err);
    result.code = 500;
    result.message = err;
  });
  if (listExecute && result.code === 200) {
    const row = listExecute[0]?.rows.raw() || [];
    result.data.list = row;
  }
  return result;
};

export const deleteHistory = async ({
  ids = [],
  isSelectAll = false,
  cancelIds = [],
}: {
  ids?: number[];
  isSelectAll?: boolean;
  cancelIds?: number[];
}) => {
  const result: ResultData<{total: number}> = {
    code: 200,
    data: {total: 0},
    message: '',
  };
  if (!isSelectAll && ids.length > 0) {
    await executeSql(
      `DELETE FROM ${APP_HISTORY_TABLE_NAME} WHERE id IN (${ids.join(',')})`,
    ).catch(err => {
      console.log('err', err);
      result.code = 500;
      result.message = err;
    });
  }
  if (isSelectAll) {
    let sql = `DELETE FROM ${APP_HISTORY_TABLE_NAME}`;
    if (cancelIds.length !== 0) {
      sql = `DELETE FROM ${APP_HISTORY_TABLE_NAME} WHERE id NOT IN (${cancelIds.join(
        ',',
      )})`;
    }
    await executeSql(sql).catch(err => {
      console.log('err', err);
      result.code = 500;
      result.message = err;
    });
  }

  const totalExecute = await executeSql(
    `SELECT COUNT(*) AS total FROM ${APP_HISTORY_TABLE_NAME}`,
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

export const resetHistory = async () => {
  return await deleteTable(APP_HISTORY_TABLE_NAME);
};
