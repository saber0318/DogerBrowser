import React, {useRef, useMemo, useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  // Linking,
} from 'react-native';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import FileViewer from 'react-native-file-viewer';
import {request, PERMISSIONS} from 'react-native-permissions';
import Clipboard from '@react-native-clipboard/clipboard';
import ListView, {
  ItemT,
  SectionT,
  FetchData,
  // DeleteData,
  // DealData,
  OnItemPress,
  ListViewRef,
} from '@/components/ListView';
import Icon from '@/components/Icon';
import {SetCurrentWebViewSource} from '@/components/WebView';
import {createAlert} from '@/components/Modal';
import {safeDecodingURI} from '@/utils';
import CustomDownloadManger, {
  DownloadConstants,
} from '@/utils/CustomDownloadManger';
import {useUIState, useUIDispatch} from '@/stores';
import {getDownload, deleteDownload, insertOrReplaceDownload} from '@/servces';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface DownloadProps {
  setCurrentWebViewSource?: SetCurrentWebViewSource;
}

export interface DownloadItem extends ItemT {
  id: number;
  downloadId: number;
  time: string;
  url?: string;
  fileName?: string;
  downloadPath?: string;
  downloadBytes?: number;
  totalBytes?: number;
  status?: number;
  fileExists?: number;
}

export interface DownloadSection extends SectionT<DownloadItem> {
  data: DownloadItem[];
}

// 查询并修改数据库下载数据
const queryAndModifyDownloadStatusByItem = (item: DownloadItem) => {
  console.log('queryAndModifyDownloadStatusByItem start');
  // 如果没有id，直接返回，新增数据应该在webview的onStartDownload事件
  // 已失败和已取消直接返回
  // 文件不存在直接返回
  if (
    !item.id ||
    item.status === DownloadConstants.FAILED ||
    item.status === DownloadConstants.CANCELED ||
    (item.status === DownloadConstants.SUCCESSFUL && !item.fileExists)
  ) {
    return item;
  }
  return new Promise<Partial<DownloadItem>>(resolve => {
    try {
      CustomDownloadManger.queryStatusByDownloadId(item.downloadId, result => {
        result.downloadPath = result.downloadPath
          ? result.downloadPath.replace(/^file:\/\//, '')
          : undefined;
        resolve(result);
      });
    } catch (error) {
      console.log('error', error);
      resolve(item);
    }
  }).then(async result => {
    console.log('queryAndModifyDownloadStatusByItem result', result);
    if (result.status === DownloadConstants.PENDING) {
      return item;
    }
    if (
      result.status === DownloadConstants.SUCCESSFUL &&
      item.status === DownloadConstants.SUCCESSFUL
    ) {
      return item;
    }
    let r = {
      ...result,
      fileExists: result.fileExists ? 1 : 0,
      downloadId: item.downloadId,
      time: item.time,
      id: item.id,
    };
    if (item.status === DownloadConstants.PAUSED) {
      r.status = DownloadConstants.PAUSED;
    }
    if (item.status === DownloadConstants.RUNNING) {
      r.status = DownloadConstants.RUNNING;
    }
    if (item.status === DownloadConstants.CANCELED) {
      r.status = DownloadConstants.CANCELED;
    }
    if (!result.status) {
      r = {
        ...item,
        fileExists: item.fileExists ? 1 : 0,
        status: DownloadConstants.CANCELED,
      };
    }
    if (result.status === DownloadConstants.SUCCESSFUL) {
      r.status = DownloadConstants.SUCCESSFUL;
    }
    if (result.status === DownloadConstants.FAILED) {
      r.status = DownloadConstants.FAILED;
    }
    if (result.status === DownloadConstants.CANCELED) {
      r.status = DownloadConstants.CANCELED;
    }
    return await insertOrReplaceDownload(r)
      .then(() => {
        return r;
      })
      .catch(err => {
        console.log('err', err);
        return item;
      });
  });
};

const Download: ThemeFunctionComponent<DownloadProps> = props => {
  const {pagesVisible} = useUIState();
  const {downloadVisible} = pagesVisible;

  const {t} = useTranslation();

  const {updatePagesVisible} = useUIDispatch();

  const listView = useRef<ListViewRef>(null);

  const today = useMemo(() => moment(), []);
  const yesterday = useMemo(() => moment().subtract(1, 'day'), []);

  // useEffect(() => {
  //   insertOrReplaceDownload({
  //     downloadId: 1,
  //     url: '1',
  //     status: 20,
  //   });
  // }, []);

  const {theme} = props;

  const onBack = () => {
    updatePagesVisible({downloadVisible: false});
  };

  const fetchData: FetchData<DownloadItem> = useCallback(
    async ({pageSize, pageNum}) => {
      const h = await getDownload({
        pageNum,
        pageSize,
      });
      console.log('fetchData', h);
      if (h.code === 200) {
        return h.data;
      }
      return {
        total: 0,
        list: [],
        pageNum,
        pageSize,
      };
    },
    [],
  );

  const dealData = useCallback(async (data: DownloadItem[]) => {
    if (data.length === 0) {
      return [];
    }
    let resultSection: DownloadSection[] = [];
    let curSection: DownloadSection = {
      title: '',
      data: [],
    };

    for (let i in data) {
      console.log('dealData data[i]', data[i]);

      const e = await queryAndModifyDownloadStatusByItem(data[i]);

      console.log('dealData e', e);

      if (curSection.data.length === 0) {
        curSection.title = e.time?.slice(0, 10);
        curSection.data = [e];
        resultSection.push(curSection);
      } else if (
        curSection.data.length > 0 &&
        curSection.data[0].time?.slice(0, 10) === e.time?.slice(0, 10)
      ) {
        curSection.data.push(e);
      } else if (
        curSection.data.length > 0 &&
        curSection.data[0].time?.slice(0, 10) !== e.time?.slice(0, 10)
      ) {
        curSection = {
          title: e.time?.slice(0, 10),
          data: [e],
        };
        resultSection.push(curSection);
      }
    }
    return resultSection;
  }, []);

  const deleteData = async (
    ids: number[],
    isSelectAll?: boolean,
    cancelIds?: number[],
  ) => {
    await deleteDownload({ids, isSelectAll, cancelIds});
  };

  const handleOnItemPress: OnItemPress<DownloadItem> = item => {
    // console.log('item', item);
    // if (item.status === DownloadConstants.RUNNING) {
    //   handlePause(item.id);
    // }
    // if (item.status === DownloadConstants.PAUSED) {
    //   handleResume(item.id);
    // }
    if (
      item.status === DownloadConstants.SUCCESSFUL &&
      item.fileExists &&
      item.downloadPath
    ) {
      handleOpenFile(item.downloadPath);
    }
  };

  const getFileSize = (size: number | undefined) => {
    if (!size) {
      return '0B';
    }
    if (size < 0) {
      return t('Unknow');
    }
    if (size * 1 < 1024) {
      return (size / 1).toFixed(2) + 'B';
    }
    if (size * 1 < 1048576) {
      return (size / 1024).toFixed(2) + 'kB';
    }
    if (size * 1 < 1073741824) {
      return (size / 1048576).toFixed(2) + 'MB';
    }
    return (size / 1073741824).toFixed(2) + 'GB';
  };

  const getDownloadPercent = (item: DownloadItem) => {
    const downloadBytes = item.downloadBytes || 0;
    const totalBytes = item.totalBytes || 0;
    if (!totalBytes || totalBytes < 0) {
      return t('Unknow');
    }
    if (!downloadBytes || downloadBytes <= 0) {
      return '0%';
    }
    return ((downloadBytes / totalBytes) * 100).toFixed(2) + '%';
  };

  const getDownloadSize = (item: DownloadItem) => {
    const downloadBytes = item.downloadBytes || 0;
    const totalBytes = item.totalBytes;
    const status = item.status;
    if (
      item.totalBytes === undefined ||
      item.totalBytes === null ||
      item.totalBytes < 0
    ) {
      return t('File size:') + t('Unknow');
    }
    if (
      status === DownloadConstants.PAUSED ||
      status === DownloadConstants.RUNNING
    ) {
      return getFileSize(downloadBytes) + ' / ' + getFileSize(totalBytes);
    }
    return getFileSize(totalBytes);
  };

  const requestReadPermission = useCallback(
    async errorCallback => {
      await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE).then(result => {
        if (result !== 'granted') {
          ToastAndroid.show(
            t(
              'Unaffected read permissions, please allow permission in the system settings!',
            ),
            3000,
          );
        } else {
          if (typeof errorCallback === 'function') {
            errorCallback();
          }
        }
      });
    },
    [t],
  );

  const handleOpenFile = (downloadPath: string) => {
    requestReadPermission(() => {
      FileViewer.open(safeDecodingURI(downloadPath), {
        showOpenWithDialog: true,
        showAppsSuggestions: true,
      })
        .then(() => {
          console.log('open');
        })
        .catch(error => {
          console.log('error', error);
        });
    });
  };
  const handlePause = (downloadId: number) => {
    return new Promise<void>((resolve, reject) => {
      try {
        CustomDownloadManger.pause(downloadId, result => {
          if (result > 0) {
            resolve();
          } else {
            reject();
          }
        });
      } catch (error) {
        reject();
      }
    });
  };
  const handleResume = (downloadId: number) => {
    return new Promise<void>((resolve, reject) => {
      try {
        CustomDownloadManger.resume(downloadId, result => {
          if (result > 0) {
            resolve();
          } else {
            reject();
          }
        });
      } catch (error) {
        reject();
      }
    });
  };
  const handleCancel = (downloadId: number) => {
    return new Promise<void>((resolve, reject) => {
      try {
        CustomDownloadManger.remove(downloadId, result => {
          if (result > 0) {
            resolve();
          } else {
            reject();
          }
        });
      } catch (error) {
        reject();
      }
    });
  };

  const RenderDownloadItem = (itemProps: {downloadItem: DownloadItem}) => {
    const [item, setItem] = useState<DownloadItem>(itemProps.downloadItem);
    const timer = useRef<NodeJS.Timeout>();

    useEffect(() => {
      (async () => {
        const r = await queryAndModifyDownloadStatusByItem(
          itemProps.downloadItem,
        );
        setItem(r);
      })();
    }, [itemProps.downloadItem]);

    useEffect(() => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      if (
        item.status === DownloadConstants.PENDING ||
        // item.status === DownloadConstants.PAUSED ||
        item.status === DownloadConstants.RUNNING
      ) {
        timer.current = setTimeout(async () => {
          const r = await queryAndModifyDownloadStatusByItem(item);
          setItem(r);
        }, 500);
      }
      return () => {
        if (timer.current) {
          clearTimeout(timer.current);
        }
      };
    }, [item]);

    return (
      <View style={styles.itemContainer}>
        <Icon
          style={styles.itemIcon}
          type="AntDesign"
          name="file1"
          fontSize={24}
          pointerEvents={'none'}
        />
        <View style={styles.itemContent}>
          <Text style={{color: theme?.colors.text}} numberOfLines={1}>
            {safeDecodingURI(item.fileName || t('File name:') + t('Unknow'))}
          </Text>
          <Text style={{color: theme?.colors.text}} numberOfLines={1}>
            {safeDecodingURI(item.url || t('Download url:') + t('Unknow'))}
          </Text>
          <Text style={{color: theme?.colors.text}} numberOfLines={1}>
            {getDownloadSize(item)}
          </Text>
        </View>
        <View style={styles.itemStatus}>
          {/* 百分比 */}
          {item.status === DownloadConstants.PAUSED ||
          item.status === DownloadConstants.RUNNING ? (
            <Text
              style={[
                styles.itemButton,
                {
                  color: theme?.colors.text,
                  backgroundColor: theme?.colors.underlayColor,
                },
              ]}>
              {getDownloadPercent(item)}
            </Text>
          ) : null}
          {/* 准备中 */}
          {item.status === DownloadConstants.PENDING ? (
            <Text
              style={[
                styles.itemButton,
                {
                  color: theme?.colors.text,
                  backgroundColor: theme?.colors.underlayColor,
                },
              ]}>
              {t('Preparing')}
            </Text>
          ) : null}
          {/* 已取消 */}
          {item.status === DownloadConstants.CANCELED ? (
            <Text
              style={[
                styles.itemButton,
                {
                  color: theme?.colors.text,
                  backgroundColor: theme?.colors.underlayColor,
                },
              ]}>
              {t('Canceled')}
            </Text>
          ) : null}
          {/* 已失败 */}
          {item.status === DownloadConstants.FAILED ? (
            <Text
              style={[
                styles.itemButton,
                {
                  color: theme?.colors.text,
                  backgroundColor: theme?.colors.underlayColor,
                },
              ]}>
              {t('Failed')}
            </Text>
          ) : null}
          {/* 文件不存在 */}
          {item.status === DownloadConstants.SUCCESSFUL && !item.fileExists ? (
            <Text
              style={[
                styles.itemButton,
                {
                  color: theme?.colors.text,
                  backgroundColor: theme?.colors.underlayColor,
                },
              ]}>
              {t('File does not exist')}
            </Text>
          ) : null}
          {/* 继续 */}
          {item.status === DownloadConstants.PAUSED ? (
            <TouchableOpacity
              activeOpacity={0.3}
              onPress={async () => {
                if (item.downloadId) {
                  try {
                    await handleResume(item.downloadId);
                    const r = await queryAndModifyDownloadStatusByItem({
                      ...item,
                      status: DownloadConstants.RUNNING,
                    });
                    setItem(r);
                  } catch (error) {
                    ToastAndroid.show(
                      t('{{text}} failed', {text: t('Resume')}),
                      1000,
                    );
                  }
                }
              }}>
              <Text
                style={[
                  styles.itemButton,
                  {
                    color: theme?.colors.primary,
                    backgroundColor: theme?.colors.grey5,
                  },
                ]}>
                {t('Resume')}
              </Text>
            </TouchableOpacity>
          ) : null}
          {/* 暂停 */}
          {item.status === DownloadConstants.RUNNING ? (
            <TouchableOpacity
              activeOpacity={0.3}
              onPress={async () => {
                if (item.downloadId) {
                  try {
                    await handlePause(item.downloadId);
                    const r = await queryAndModifyDownloadStatusByItem({
                      ...item,
                      status: DownloadConstants.PAUSED,
                    });
                    setItem(r);
                  } catch (error) {
                    ToastAndroid.show(
                      t('{{text}} failed', {text: t('Pause')}),
                      1000,
                    );
                  }
                }
              }}>
              <Text
                style={[
                  styles.itemButton,
                  {
                    color: theme?.colors.primary,
                    backgroundColor: theme?.colors.grey5,
                  },
                ]}>
                {t('Pause')}
              </Text>
            </TouchableOpacity>
          ) : null}
          {/* 取消 */}
          {item.status === DownloadConstants.PAUSED ||
          item.status === DownloadConstants.RUNNING ? (
            <TouchableOpacity
              activeOpacity={0.3}
              onPress={async () => {
                if (item.downloadId) {
                  try {
                    await handleCancel(item.downloadId);
                    await insertOrReplaceDownload({
                      ...item,
                      status: DownloadConstants.CANCELED,
                    });
                    setItem({
                      ...item,
                      status: DownloadConstants.CANCELED,
                    });
                  } catch (error) {
                    ToastAndroid.show(
                      t('{{text}} failed', {text: t('Cancel')}),
                      1000,
                    );
                  }
                }
              }}>
              <Text
                style={[
                  styles.itemButton,
                  {
                    color: theme?.colors.primary,
                    backgroundColor: theme?.colors.grey5,
                  },
                ]}>
                {t('Cancel')}
              </Text>
            </TouchableOpacity>
          ) : null}
          {/* 打开 */}
          {item.status === DownloadConstants.SUCCESSFUL && item.fileExists ? (
            <TouchableOpacity
              activeOpacity={0.3}
              onPress={() => {
                if (item.downloadPath) {
                  handleOpenFile(item.downloadPath);
                }
              }}>
              <Text
                style={[
                  styles.itemButton,
                  {
                    color: theme?.colors.primary,
                    backgroundColor: theme?.colors.grey5,
                  },
                ]}>
                {t('Open')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  const renderItem = useCallback(({item}: {item: DownloadItem}) => {
    return <RenderDownloadItem downloadItem={item} />;
  }, []);

  const getFormat = (date: string) => {
    if (moment(date).isSame(today, 'day')) {
      return `${t('Today')} ${date}`;
    } else if (moment(date).isSame(yesterday, 'day')) {
      return `${t('Yesterday')} ${date}`;
    }
    return date;
  };

  const renderSectionHeader = ({section}: {section: DownloadSection}) => {
    return (
      <View
        style={[
          styles.section,
          {backgroundColor: theme?.colors.underlayColor},
        ]}>
        <Text style={[styles.sectionTitle, {color: theme?.colors.text}]}>
          {getFormat(section.title)}
        </Text>
      </View>
    );
  };

  return (
    <ListView
      itemKey={'id'}
      ref={listView}
      name={t('Download record')}
      isVisible={downloadVisible}
      hideAdd={true}
      fetchData={fetchData}
      deleteData={deleteData}
      dealData={dealData}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      onItemPress={handleOnItemPress}
      onBack={onBack}
      initialNumToRender={0} // 防止查询数据
      menuOption={[
        // {
        //   name: t('Open {{text}}', {text: t('File')}),
        //   value: 'open',
        //   onPress: (option: any, extraData: DownloadItem) => {
        //     console.log('open');
        //     listView.current?.hidePopupMenu();
        //     handleOnItemPress(extraData);
        //   },
        // },
        {
          name: t('Copy {{text}}', {text: t('Link')}),
          value: 'copy',
          onPress: (item: any, extraData: DownloadItem) => {
            console.log('copy', listView);
            listView.current?.hidePopupMenu();
            if (extraData.url) {
              Clipboard.setString(extraData.url);
              ToastAndroid.show(
                t('{{text}} copied to clipboard', {text: t('Download record')}),
                1000,
              );
            }
          },
        },
        {
          name: t('Delete {{text}}', {text: t('Record')}),
          value: 'delete',
          onPress: async (item: any, extraData: DownloadItem) => {
            console.log('delete');
            listView.current?.hidePopupMenu();
            await deleteData([extraData.id]);
            ToastAndroid.show(
              t('{{text}} deleted', {text: t('Download record')}),
              1000,
            );
            listView.current?.onReSearch();
          },
        },
        {
          name: t('View details'),
          value: 'detail',
          onPress: async (item: any, extraData: DownloadItem) => {
            listView.current?.hidePopupMenu();
            createAlert({
              title: t('View details'),
              renderContent: () => {
                return (
                  <View style={styles.detailContainer}>
                    {/* <Text>{`https://123123/123//21/3/12/12/312/3/213123/asd/as/d/asd//213/12/eaw/d/ad/as//d/2//asd/qaw/f/eg/df/hsdfg/hj/dfsgh/sdf/h/sdfg/sdf/12312sxdcvdgsdfgsdfgg/sdfg/sdfg/`}</Text> */}
                    <Text style={styles.detailText}>
                      {t('File name:') +
                        safeDecodingURI(extraData.fileName || t('Unknow'))}
                    </Text>
                    <Text style={styles.detailText}>
                      {t('File size:') + getFileSize(extraData.totalBytes)}
                    </Text>
                    <Text style={styles.detailText}>
                      {t('Download url:') +
                        safeDecodingURI(extraData.url || t('Unknow'))}
                    </Text>
                    <Text style={styles.detailText}>
                      {t('Local path:') +
                        safeDecodingURI(extraData.downloadPath || t('Unknow'))}
                    </Text>
                    <Text style={styles.detailText}>
                      {t('Download time:') + (extraData.time || t('Unknow'))}
                    </Text>
                  </View>
                );
              },
            });
          },
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: 12,
  },
  itemLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 20,
  },
  itemLoadingText: {
    marginLeft: 10,
  },
  itemContainer: {
    position: 'relative',
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 40,
    height: 40,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'green',
  },
  itemContent: {
    flex: 1,
    marginHorizontal: 10,
  },
  itemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemButton: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  detailContainer: {
    padding: 10,
  },
  detailText: {
    marginVertical: 4,
  },
});

export default withTheme<DownloadProps>(Download, 'Download');
