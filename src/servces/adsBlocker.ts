import RNFetchBlob from 'react-native-fetch-blob';
import moment from 'moment';
import {FiltersEngine} from '@cliqz/adblocker';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {
//   createTable,
//   deleteTable,
//   selectDataFromTable,
//   getDBConnection,
// } from '@/utils/SQLite';
import {AdsBlocker} from '@/pages/AdsBlocker';
import {
  DEFAULT_ADS_BLOCKER_DATA,
  DEFAULT_ADS_BLOCKER_TIME,
  DEFAULT_ADS_BLOCKER,
} from '@/config/default';

export const APP_ADS_BLOCKER_TABLE_NAME = 'app_ads_blocker_table';
import {ResultCode, ResultData} from './index';

export const saveNetworkDataToEngine = async () => {
  const result: ResultCode = {code: 200};
  await RNFetchBlob.fetch(
    'GET',
    'https://easylist-downloads.adblockplus.org/easylistchina.txt',
    {},
  )
    .then(async (res: any) => {
      await Promise.all([
        await AsyncStorage.setItem('@engine_data', res.data),
        await AsyncStorage.setItem(
          '@engine_time',
          moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        ),
      ]);
    })
    .catch((err: string | undefined) => {
      result.code = 500;
      result.message = err;
    });
  return result;
};

export const saveLocalDataToEngine = async () => {
  const result: ResultCode = {code: 200};
  await Promise.all([
    AsyncStorage.setItem('@engine_data', DEFAULT_ADS_BLOCKER_DATA),
    AsyncStorage.setItem('@engine_time', DEFAULT_ADS_BLOCKER_TIME),
  ]).catch(err => {
    console.log('err', err);
    result.code = 500;
    result.message = err;
  });
  return result;
};

export const getAdsBlockerEngine = async () => {
  const result: ResultData<AdsBlocker> = {
    code: 200,
    data: DEFAULT_ADS_BLOCKER,
    message: '',
  };
  await Promise.all([
    AsyncStorage.getItem('@engine_data'),
    AsyncStorage.getItem('@engine_time'),
  ])
    .then(res => {
      result.data.engine = FiltersEngine.parse(
        res[0] || DEFAULT_ADS_BLOCKER_DATA,
      );
      result.data.time = res[1] || DEFAULT_ADS_BLOCKER_TIME;
    })
    .catch(err => {
      console.log('err', err);
      result.data.engine = FiltersEngine.parse(DEFAULT_ADS_BLOCKER_DATA);
      result.data.time = DEFAULT_ADS_BLOCKER_TIME;
    });
  return result;
};

export const removeEngine = async () => {
  const result: ResultCode = {code: 200};
  await Promise.all([
    AsyncStorage.removeItem('@engine_data'),
    AsyncStorage.removeItem('@engine_time'),
  ]).catch(err => {
    console.log('err', err);
    result.code = 500;
    result.message = err;
  });
  return result;
};

// export const initAdsBlockerRule = async () => {
//   return await createTable({
//     tableName: APP_ADS_BLOCKER_TABLE_NAME,
//     colums: 'id INTEGER PRIMARY KEY AUTOINCREMENT, domain , rule',
//   });
// };

// export const insertAdsBlockerRules = async (list: string[]) => {
//   const result: ResultCode = {code: 200};
//   const db = await getDBConnection().catch(err => {
//     console.log('err', err);
//     result.code = 500;
//     result.message = err;
//   });
//   if (result.code === 200 && db) {
//     await new Promise<void>((resolve, reject) => {
//       db.transaction(
//         tx => {
//           for (let i = 0; i < list.length; i++) {
//             const line = list[i];
//             if (!line) {
//               continue;
//             }

//             let domainList: string[] = [];
//             let rule = '';
//             const indexOfStandard = line.indexOf('##');
//             const indexOfExtended = line.indexOf('#?#');

//             if (indexOfStandard > -1) {
//               domainList =
//                 line
//                   .slice(0, indexOfStandard)
//                   .split(',')
//                   .map(d => d.replace(/^~/, '')) || [];
//               rule = line.slice(indexOfStandard, line.length);
//             }

//             if (indexOfExtended > -1) {
//               domainList =
//                 line
//                   .slice(0, indexOfExtended)
//                   .split(',')
//                   .map(d => d.replace(/^~/, '')) || [];
//               rule = line.slice(indexOfExtended, line.length);
//             }

//             if (!rule || domainList.length === 0) {
//               continue;
//             }

//             domainList.forEach(d => {
//               // 当前版本通用规则用本地文件
//               if (d) {
//                 tx.executeSql(
//                   `INSERT INTO ${APP_ADS_BLOCKER_TABLE_NAME} (domain, rule) VALUES (?, ?)`,
//                   [d || '*', rule],
//                   () => {
//                     console.log('插入数据成功');
//                   },
//                   err => {
//                     console.log('插入数据失败', err);
//                   },
//                 );
//               }
//             });
//           }
//         },
//         err => {
//           console.log('出错', err);
//           result.code = 500;
//           reject();
//         },
//         () => {
//           console.log('成功');
//           resolve();
//         },
//       );
//     });
//   }
//   return result;
// };

// export const getAdsBlockerRules = async (domain?: string[] | string) => {
//   const result: ResultData<string[]> = {
//     code: 200,
//     data: [],
//     message: '',
//   };
//   let where;
//   if (typeof domain === 'string') {
//     where = `domain = '${domain}'`;
//   }

//   if (Array.isArray(domain)) {
//     where = domain.map(i => `domain = '${i}'`).join(' OR ');
//   }
//   const listExecute = await selectDataFromTable({
//     tableName: APP_ADS_BLOCKER_TABLE_NAME,
//     where: where,
//   }).catch(err => {
//     console.log('err', err);
//     result.code = 500;
//     result.message = err;
//   });
//   if (listExecute && result.code === 200) {
//     const row = listExecute[0]?.rows.raw() || [];
//     result.data = row;
//   }
//   return result;
// };

// export const resetAdsBlockerRule = async () => {
//   await deleteTable(APP_ADS_BLOCKER_TABLE_NAME);
// };
