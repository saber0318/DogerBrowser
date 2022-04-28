import {
  createTable,
  deleteTable,
  // dropTable,
  // insertOrReplaceDataToTable,
  insertOrReplaceListToTable,
  selectDataFromTable,
  executeSql,
} from '@/utils/SQLite';
import {DownloadItem} from '@/pages/Download';
import {ResultCode, ResultData, ResultList} from './index';

export const APP_DOWNLOAD_TABLE_NAME = 'app_download_table';

export const initDownloadTable = async () => {
  return await createTable({
    tableName: APP_DOWNLOAD_TABLE_NAME,
    colums:
      'id INTEGER PRIMARY KEY AUTOINCREMENT, downloadId, time, url, fileName, downloadPath, downloadBytes, totalBytes, status, fileExists',
  });
};

export const insertOrReplaceDownload = async (
  data: Omit<DownloadItem, 'id'> | DownloadItem,
) => {
  const result: ResultCode = {code: 200};
  await insertOrReplaceListToTable({
    tableName: APP_DOWNLOAD_TABLE_NAME,
    colums: [
      'id',
      'downloadId',
      'time',
      'url',
      'fileName',
      'downloadPath',
      'downloadBytes',
      'totalBytes',
      'status',
      'fileExists',
    ],
    list: [
      [
        'id' in data && data.id ? data.id : null,
        data.downloadId,
        data.time,
        data.url,
        data.fileName,
        data.downloadPath,
        data.downloadBytes,
        data.totalBytes,
        data.status,
        data.fileExists,
      ],
    ],
  }).catch(err => {
    console.log('err', err);
    result.code = 500;
    result.message = err;
  });
  return result;
};

export const getDownload = async ({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}) => {
  console.log('getDownload', pageNum, pageSize);
  const result: ResultList<DownloadItem> = {
    code: 200,
    data: {list: [], pageNum, pageSize, total: 0},
    message: '',
  };
  const totalExecute = await executeSql(
    `SELECT COUNT(*) AS total FROM ${APP_DOWNLOAD_TABLE_NAME}`,
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
    tableName: APP_DOWNLOAD_TABLE_NAME,
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

export const deleteDownload = async ({
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
      `DELETE FROM ${APP_DOWNLOAD_TABLE_NAME} WHERE id IN (${ids.join(',')})`,
    ).catch(err => {
      console.log('err', err);
      result.code = 500;
      result.message = err;
    });
  }
  if (isSelectAll) {
    let sql = `DELETE FROM ${APP_DOWNLOAD_TABLE_NAME}`;
    if (cancelIds.length !== 0) {
      sql = `DELETE FROM ${APP_DOWNLOAD_TABLE_NAME} WHERE id NOT IN (${cancelIds.join(
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
    `SELECT COUNT(*) AS total FROM ${APP_DOWNLOAD_TABLE_NAME}`,
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

export const resetDownload = async () => {
  return await deleteTable(APP_DOWNLOAD_TABLE_NAME);
};
