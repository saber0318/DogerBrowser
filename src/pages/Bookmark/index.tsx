import React, {useState, useCallback, useRef} from 'react';
import {View, ScrollView, Text, StyleSheet, ToastAndroid} from 'react-native';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import ListView, {
  ItemT,
  SectionT,
  FetchData,
  DeleteData,
  OnItemPress,
  ListViewRef,
} from '@/components/ListView';
import PopConfirm from '@/components/Modal/PopConfirm';
import {SetCurrentWebViewSource} from '@/components/WebView';
import From, {useForm} from '@/components/Form';
import DescText from '@/components/DescText';
import {useUIState, useUIDispatch} from '@/stores';
import {insertOrReplaceBookmark, getBookmark, deleteBookmark} from '@/servces';
import {dealUrl} from '@/utils/index';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface BookmarkProps {
  setCurrentWebViewSource?: SetCurrentWebViewSource;
}

export interface BookmarkItem extends ItemT {
  id: number;
  title: string;
  url: string;
  time: string;
}

export interface BookmarkSection extends SectionT<BookmarkItem> {
  data: BookmarkItem[];
}

const Bookmark: ThemeFunctionComponent<BookmarkProps> = props => {
  const {setCurrentWebViewSource = () => {}, theme} = props;

  const {pagesVisible} = useUIState();
  const {bookmarkVisible} = pagesVisible;

  const {updatePagesVisible, hidePages} = useUIDispatch();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const {t} = useTranslation();

  const [form] = useForm();
  const listView = useRef<ListViewRef>(null);

  const onBack = () => {
    updatePagesVisible({bookmarkVisible: false});
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const addData = () => {
    showModal();
    form.resetField();
  };

  const dealData = useCallback((data: BookmarkItem[]) => {
    if (data.length === 0) {
      return [];
    }
    let resultSection: BookmarkSection[] = [];
    let curSection: BookmarkSection = {
      title: '',
      data: [],
    };

    data.forEach(e => {
      curSection = {
        title: e.title,
        data: [e],
      };
      resultSection.push(curSection);
    });
    return resultSection;
  }, []);

  const handleOnItemPress: OnItemPress<BookmarkItem> = item => {
    setCurrentWebViewSource({uri: item.url});
    hidePages();
  };

  const renderItem = ({item}: {item: BookmarkItem}) => {
    return (
      <View style={styles.itemContainer}>
        <Text
          style={[styles.itemTitle, {color: theme?.colors.text}]}
          numberOfLines={1}>
          {item.title || item.url}
        </Text>
        <Text
          style={[styles.itemUrl, {color: theme?.colors.descript}]}
          numberOfLines={1}>
          {item.url}
        </Text>
      </View>
    );
  };

  const fetchData: FetchData<BookmarkItem> = useCallback(
    async ({pageSize, pageNum}) => {
      const h = await getBookmark({
        pageNum,
        pageSize,
      });
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

  const deleteData: DeleteData = useCallback(
    async (ids: number[], isSelectAll?: boolean, cancelIds?: number[]) => {
      await deleteBookmark({ids, isSelectAll, cancelIds});
    },
    [],
  );

  return (
    <View>
      <ListView
        ref={listView}
        itemKey="id"
        name={t('Favorites')}
        isVisible={bookmarkVisible}
        fetchData={fetchData}
        deleteData={deleteData}
        addData={addData}
        dealData={dealData}
        renderItem={renderItem}
        onItemPress={handleOnItemPress}
        onBack={onBack}
        menuOption={[
          {
            name: t('Open {{text}}', {text: t('Link')}),
            value: 'open',
            onPress: (option: any, extraData: BookmarkItem) => {
              console.log('open');
              listView.current?.hidePopupMenu();
              handleOnItemPress(extraData);
            },
          },
          {
            name: t('Edit {{text}}', {text: t('Bookmark')}),
            value: 'edit',
            onPress: (option: any, extraData: BookmarkItem) => {
              console.log('edit');
              listView.current?.hidePopupMenu();
              showModal();
              form.setFieldsValue({
                id: extraData.id,
                title: extraData.title,
                url: extraData.url,
                time: extraData.time,
              });
            },
          },
          {
            name: t('Copy {{text}}', {text: t('Link')}),
            value: 'copy',
            onPress: (item: any, extraData: BookmarkItem) => {
              console.log('copy');
              listView.current?.hidePopupMenu();
              Clipboard.setString(extraData.url);
              ToastAndroid.show(
                t('{{text}} copied to clipboard', {text: t('Link')}),
                1000,
              );
            },
          },
          {
            name: t('Delete {{text}}', {text: t('Bookmark')}),
            value: 'delete',
            onPress: async (item: any, extraData: BookmarkItem) => {
              console.log('delete');
              listView.current?.hidePopupMenu();
              await deleteData([extraData.id]);
              ToastAndroid.show(
                t('{{text}} deleted', {text: t('Bookmark')}),
                1000,
              );
              listView.current?.onReSearch();
            },
          },
        ]}
      />
      <PopConfirm
        isVisible={isModalVisible}
        onCancel={hideModal}
        onOk={async () => {
          await form
            .validator()
            .then(async stores => {
              console.log(stores);
              const {id, url, title, time} = stores;
              const r = await insertOrReplaceBookmark({
                id,
                url: dealUrl(url),
                title,
                time: time || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
              });
              if (r.code === 500) {
                ToastAndroid.show(r.message || t('Error'), 1000);
                return;
              }
              listView.current?.onReSearch();
              setIsModalVisible(false);
            })
            .catch(err => {
              console.log(err);
            });
        }}>
        <ScrollView style={styles.form}>
          <From form={form}>
            <From.ItemInput
              label={t('Title')}
              name="title"
              rules={[{required: true}]}
            />
            <From.ItemInput
              label={t('Website')}
              name="url"
              rules={[{type: 'url'}]}
            />
          </From>
          <DescText
            desc={[
              t('Format: Protocol://Host[:Port]/[Path][?Query]'),
              t('eg {{text}}', {text: 'https://www.baidu.com'}),
            ]}
          />
        </ScrollView>
      </PopConfirm>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    paddingHorizontal: 14,
    marginVertical: 10,
  },
  itemTitle: {
    fontSize: 14,
  },
  itemUrl: {
    fontSize: 12,
    overflow: 'hidden',
  },
  form: {
    flex: 1,
  },
  explain: {
    paddingLeft: 20,
    paddingTop: 16,
    paddingRight: 4,
    paddingBottom: 16,
  },
  desc: {
    fontSize: 12,
    marginRight: 20,
    marginBottom: 6,
  },
});

export default withTheme<BookmarkProps>(Bookmark, 'Bookmark');
