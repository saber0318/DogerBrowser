import moment from 'moment';
import {
  createTable,
  deleteTable,
  // insertOrReplaceDataToTable,
  insertOrReplaceListToTable,
  selectDataFromTable,
  executeSql,
} from '@/utils/SQLite';
import {ShortcutItem} from '@/components/WebView/WelcomeView/Shortcut';
import {DEAULT_SHORTCUT_LIST} from '@/config/default';
import {ResultCode, ResultData} from './index';

export const APP_SHORTCUT_TABLE_NAME = 'app_shortcut_table';

export const initShortcutTable = async () => {
  return await createTable({
    tableName: APP_SHORTCUT_TABLE_NAME,
    colums: 'id INTEGER PRIMARY KEY AUTOINCREMENT, title , url, time, icon',
  });
};

export const insertDefaultShortcut = async () => {
  const result: ResultCode = {code: 200};
  const request: Promise<ResultCode>[] = [];
  DEAULT_SHORTCUT_LIST.forEach(item => {
    request.push(
      insertOrReplaceShortcut({
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

export const insertOrReplaceShortcut = async (
  data: Omit<ShortcutItem, 'id'> | ShortcutItem,
) => {
  const result: ResultCode = {code: 200};
  // 如果id不存在，查重
  if (!data.id && data.id !== 0) {
    const totalExecute = await executeSql(
      `SELECT COUNT(*) AS total FROM ${APP_SHORTCUT_TABLE_NAME} WHERE url = '${data.url}'`,
    ).catch(err => {
      console.log('err', err);
      result.code = 500;
      result.message = err;
    });
    if (result.code === 200) {
      const row = totalExecute?.[0]?.rows.raw();
      if (row && row[0].total > 0) {
        result.code = 500;
        result.message = '链接已存在！';
        return result;
      }
    } else {
      return result;
    }
  }

  await insertOrReplaceListToTable({
    tableName: APP_SHORTCUT_TABLE_NAME,
    colums: ['id', 'url', 'title', 'time', 'icon'],
    list: [
      [
        'id' in data && data.id ? data.id : null,
        data.url,
        data.title,
        data.time,
        data.icon,
      ],
    ],
  }).catch(err => {
    console.log('err', err);
    result.code = 500;
    result.message = err;
  });
  return result;
};

export const getShortcut = async () => {
  const result: ResultData<ShortcutItem[]> = {
    code: 200,
    data: [],
    message: '',
  };
  const listExecute = await selectDataFromTable({
    tableName: APP_SHORTCUT_TABLE_NAME,
    order: 'id ASC',
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
export const getShortcutsPresentInUrls = async (urls: string[]) => {
  const result: ResultData<ShortcutItem[]> = {
    code: 200,
    data: [],
    message: '',
  };
  await executeSql(
    `SELECT * FROM ${APP_SHORTCUT_TABLE_NAME} WHERE url IN (${urls
      .map(item => `'${item}'`)
      .join(',')})`,
  )
    .then(execute => {
      if (execute) {
        const row = execute[0]?.rows.raw() || [];
        result.data = row;
      }
    })
    .catch(err => {
      console.log('err', err);
      result.code = 500;
      result.message = err;
    });
  // if (execute && result.code === 200) {
  //   const row = execute[0]?.rows.raw() || [];
  //   result.data = row;
  // }
  return result;
};

export const deleteShortcut = async ({
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
      `DELETE FROM ${APP_SHORTCUT_TABLE_NAME} WHERE id IN (${ids.join(',')})`,
    ).catch(err => {
      console.log('err', err);
      result.code = 500;
      result.message = err;
    });
  }

  if (!isSelectAll && urls.length > 0) {
    await executeSql(
      `DELETE FROM ${APP_SHORTCUT_TABLE_NAME} WHERE url IN (${urls
        .map(item => `'${item}'`)
        .join(',')})`,
    ).catch(err => {
      console.log('err', err);
      result.code = 500;
      result.message = err;
    });
  }

  if (isSelectAll) {
    let sql = `DELETE FROM ${APP_SHORTCUT_TABLE_NAME}`;
    if (cancelIds.length !== 0) {
      sql = `DELETE FROM ${APP_SHORTCUT_TABLE_NAME} WHERE id NOT IN (${cancelIds.join(
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
    `SELECT COUNT(*) AS total FROM ${APP_SHORTCUT_TABLE_NAME}`,
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

// export const deleteShortcut = async (urls: string[]) => {
//   const result: ResultCode = {
//     code: 200,
//     message: '',
//   };

//   await executeSql(
//     `DELETE FROM ${APP_SHORTCUT_TABLE_NAME} WHERE url IN (${urls
//       .map(item => `'${item}'`)
//       .join(',')})`,
//   ).catch(err => {
//     console.log('err', err);
//     result.code = 500;
//     result.message = err;
//   });

//   return result;
// };

export const resetShortcut = async () => {
  await deleteTable(APP_SHORTCUT_TABLE_NAME);
};
