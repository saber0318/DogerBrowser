import {
  createTable,
  deleteTable,
  // insertOrReplaceDataToTable,
  insertOrReplaceListToTable,
  selectDataFromTable,
  executeSql,
} from '@/utils/SQLite';
import {BookmarkItem} from '@/pages/Bookmark';
import {ResultCode, ResultData, ResultList} from './index';

export const APP_Bookmark_TABLE_NAME = 'app_bookmark_table';

export const initBookmarkTable = async () => {
  return await createTable({
    tableName: APP_Bookmark_TABLE_NAME,
    colums: 'id INTEGER PRIMARY KEY AUTOINCREMENT, title , url, time',
  });
};

export const insertOrReplaceBookmark = async (
  data: Omit<BookmarkItem, 'id'> | BookmarkItem,
) => {
  const result: ResultCode = {code: 200};
  // 查重
  const totalExecute = await executeSql(
    `SELECT COUNT(*) AS total FROM ${APP_Bookmark_TABLE_NAME} WHERE url = '${data.url}'`,
  ).catch(err => {
    console.log('err', err);
    result.code = 500;
    result.message = err;
  });
  if (result.code === 200) {
    const row = totalExecute?.[0]?.rows.raw();
    if (row && row[0].total > 0) {
      result.code = 500;
      result.message = '书签已存在！';
      return result;
    }
  } else {
    return result;
  }

  await insertOrReplaceListToTable({
    tableName: APP_Bookmark_TABLE_NAME,
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

export const getBookmark = async ({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) => {
  console.log('getBookmark', pageNum, pageSize);
  const result: ResultList<BookmarkItem> = {
    code: 200,
    data: {list: [], pageNum, pageSize, total: 0},
    message: '',
  };
  const totalExecute = await executeSql(
    `SELECT COUNT(*) AS total FROM ${APP_Bookmark_TABLE_NAME}`,
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
    tableName: APP_Bookmark_TABLE_NAME,
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

// 返回urls中已经存在的书签列表
export const getBookmarksPresentInUrls = async (urls: string[]) => {
  const result: ResultData<BookmarkItem[]> = {
    code: 200,
    data: [],
    message: '',
  };
  const execute = await executeSql(
    `SELECT * FROM ${APP_Bookmark_TABLE_NAME} WHERE url IN (${urls
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

export const deleteBookmark = async ({
  ids = [],
  urls = [],
  isSelectAll = false,
  cancelIds = [],
}: {
  ids?: number[];
  urls?: string[];
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
      `DELETE FROM ${APP_Bookmark_TABLE_NAME} WHERE id IN (${ids.join(',')})`,
    ).catch(err => {
      console.log('err', err);
      result.code = 500;
      result.message = err;
    });
  }

  if (!isSelectAll && urls.length > 0) {
    await executeSql(
      `DELETE FROM ${APP_Bookmark_TABLE_NAME} WHERE url IN (${urls
        .map(item => `'${item}'`)
        .join(',')})`,
    ).catch(err => {
      console.log('err', err);
      result.code = 500;
      result.message = err;
    });
  }

  if (isSelectAll) {
    let sql = `DELETE FROM ${APP_Bookmark_TABLE_NAME}`;
    if (cancelIds.length !== 0) {
      sql = `DELETE FROM ${APP_Bookmark_TABLE_NAME} WHERE id NOT IN (${cancelIds.join(
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
    `SELECT COUNT(*) AS total FROM ${APP_Bookmark_TABLE_NAME}`,
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

export const resetBookmark = async () => {
  return await deleteTable(APP_Bookmark_TABLE_NAME);
};
