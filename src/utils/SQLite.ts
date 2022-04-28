import SQLiteManager, {SQLiteDatabase} from 'react-native-sqlite-storage';

SQLiteManager.DEBUG(true);
SQLiteManager.enablePromise(true);

export const DATA_BASE_NAME = 'doger_browser';

let DataBase: SQLiteDatabase;
export const getDBConnection = async () => {
  if (DataBase) {
    return DataBase;
  }
  DataBase = await SQLiteManager.openDatabase({
    name: DATA_BASE_NAME + '.db',
    location: 'default',
  });
  // DataBase.executeSql('PRAGMA foreign_keys = ON');
  return DataBase;
};

export const closeDBConnection = async () => {
  if (DataBase) {
    await DataBase.close();
  }
};

export const createTable = async ({
  tableName,
  colums,
}: {
  tableName: string;
  colums: string;
}) => {
  if (!DataBase) {
    await getDBConnection();
  }
  const sql = `CREATE TABLE IF NOT EXISTS ${tableName}(
      ${colums}
    )`;
  await DataBase.executeSql(sql);
};

export const deleteTable = async (tableName: string) => {
  if (!DataBase) {
    await getDBConnection();
  }
  const sql = `DELETE FROM "${tableName}"`;
  await DataBase.executeSql(sql);
};

export const dropTable = async (tableName: string) => {
  if (!DataBase) {
    await getDBConnection();
  }
  const sql = `DROP TABLE IF EXISTS "${tableName}"`;
  await DataBase.executeSql(sql);
};

export const insertOrReplaceDataToTable = async ({
  tableName,
  data,
}: {
  tableName: string;
  data: object;
}) => {
  if (!DataBase) {
    await getDBConnection();
  }
  const sql = `INSERT OR REPLACE INTO ${tableName} (${Object.keys(data).join(
    ',',
  )}) VALUES (${Object.values(data).join(',')})`;
  await DataBase.executeSql(sql);
};

export const insertOrReplaceListToTable = async ({
  tableName,
  colums,
  list,
}: {
  tableName: string;
  colums: string[];
  list: any[];
}) => {
  if (!DataBase) {
    await getDBConnection();
  }
  const sql = `INSERT OR REPLACE INTO ${tableName} (${colums.join(
    ',',
  )}) VALUES ${Array(list.length)
    .fill(`(${Array(colums.length).fill('?').join(',')})`)
    .join(',')}`;

  // console.log('sql', sql);
  await DataBase.executeSql(sql, list.flat());
};

export const deleteDataFromTable = async ({
  tableName,
  where,
}: {
  tableName: string;
  where: string;
}) => {
  if (!DataBase) {
    await getDBConnection();
  }
  const sql = `DELETE FROM ${tableName} WHERE ${where}`;
  await DataBase.executeSql(sql);
};

export const selectDataFromTable = async ({
  tableName,
  where,
  order,
  pageNum,
  pageSize,
}: {
  tableName: string;
  where?: string;
  order?: string;
  pageNum?: number;
  pageSize?: number;
}) => {
  if (!DataBase) {
    await getDBConnection();
  }
  const sql = `SELECT * FROM ${tableName} ${where ? `WHERE ${where}` : ''} ${
    order ? `ORDER BY ${order}` : ''
  } ${
    typeof pageNum === 'number' && typeof pageSize === 'number'
      ? `LIMIT ${pageSize} OFFSET ${pageNum * pageSize}`
      : ''
  };`;
  return await DataBase.executeSql(sql);
};

export const executeSql = async (sql: string, params?: any[]) => {
  console.log('executeSql', sql);
  if (!DataBase) {
    await getDBConnection();
  }
  return await DataBase.executeSql(sql, params);
};
