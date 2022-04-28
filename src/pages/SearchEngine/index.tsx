import React, {useState, useEffect, useCallback, useRef} from 'react';
import {StyleSheet, View, ScrollView, ToastAndroid} from 'react-native';
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
import {FieldRadio} from '@/components/Field';
import From, {useForm} from '@/components/Form';
import DescText from '@/components/DescText';
import {dealUrl} from '@/utils/index';
import {
  insertOrReplaceSearchEngine,
  getSearchEngine,
  deleteSearchEngine,
  getSearchEnginePresentInUrls,
} from '@/servces';
import {useUIState, useUIDispatch} from '@/stores';

export interface SearchEngineItem extends ItemT {
  id: number;
  url: string;
  title: string;
  time: string;
}

interface SearchEngineSection extends SectionT<SearchEngineItem> {
  data: SearchEngineItem[];
}

const SearchEngine = () => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [disabledList, setIsabledList] = useState<number[]>([]);

  const {t} = useTranslation();

  const {searchEngine, pagesVisible} = useUIState();
  const {searchEngineVisible} = pagesVisible;

  const {updateSearchEngine, updatePagesVisible} = useUIDispatch();

  useEffect(() => {
    (async () => {
      const g = await getSearchEnginePresentInUrls([searchEngine]);
      if (g.code === 200 && g.data.length > 0) {
        setIsabledList([g.data[0].id]);
      }
    })();
  }, [searchEngine]);

  const handleUpdateSearchEngine = async (url: string) => {
    updateSearchEngine(url);
  };

  const [form] = useForm();
  const listView = useRef<ListViewRef>(null);

  const onBack = () => {
    updatePagesVisible({searchEngineVisible: false});
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

  const dealData = useCallback((data: SearchEngineItem[]) => {
    if (data.length === 0) {
      return [];
    }
    let resultSection: SearchEngineSection[] = [];
    let curSection: SearchEngineSection = {
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

  const handleOnItemPress: OnItemPress<SearchEngineItem> = item => {
    handleUpdateSearchEngine(item.url);
  };

  const renderItem = ({item}: {item: SearchEngineItem}) => {
    return (
      <View style={styles.item} pointerEvents={'none'}>
        <FieldRadio
          label={item.title}
          subLabel={item.url}
          checked={searchEngine === item.url}
        />
      </View>
    );
  };

  const fetchData: FetchData<SearchEngineItem> = useCallback(async () => {
    const h = await getSearchEngine();
    if (h.code === 200) {
      return {
        total: h.data.length,
        list: h.data,
        pageNum: 0,
        pageSize: h.data.length,
      };
    }
    return {
      total: 0,
      list: [],
      pageNum: 0,
      pageSize: 0,
    };
  }, []);

  const deleteData: DeleteData = useCallback(async (ids: number[]) => {
    await deleteSearchEngine({ids});
  }, []);
  return (
    <View>
      <ListView
        ref={listView}
        itemKey="id"
        name={t('Search engine')}
        isVisible={searchEngineVisible}
        fetchData={fetchData}
        deleteData={deleteData}
        addData={addData}
        dealData={dealData}
        disabledList={disabledList}
        renderItem={renderItem}
        onItemPress={handleOnItemPress}
        onBack={onBack}
        menuOption={[
          {
            name: t('Edit {{text}}', {text: t('Search engine')}),
            value: 'edit',
            onPress: (option: any, extraData: SearchEngineItem) => {
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
            onPress: (item: any, extraData: SearchEngineItem) => {
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
            name: t('Delete {{text}}', {text: t('Search engine')}),
            value: 'delete',
            onPress: async (item: any, extraData: SearchEngineItem) => {
              console.log('delete');
              if (extraData.url === searchEngine) {
                listView.current?.hidePopupMenu();
                ToastAndroid.show(
                  t('The {{text}} in use cannot be deleted!', {
                    text: t('Home page'),
                  }),
                  1000,
                );
              } else {
                listView.current?.hidePopupMenu();
                await deleteData([extraData.id]);
                ToastAndroid.show(
                  t('{{text}} deleted', {text: t('Search engine')}),
                  1000,
                );
                listView.current?.onReSearch();
              }
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
              const r = await insertOrReplaceSearchEngine({
                id,
                url: dealUrl(url),
                title,
                time: time || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
              });
              if (r.code === 500) {
                ToastAndroid.show(r.message || t('Error'), 1000);
                return;
              }
              handleUpdateSearchEngine(dealUrl(url));
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
              label={t('Url')}
              name="url"
              rules={[
                {type: 'url'},
                {
                  type: 'regexp',
                  pattern: new RegExp('\\$1'),
                  message: t('Search keywords are not replaced with $1!'),
                },
              ]}
            />
          </From>
          <DescText
            desc={[
              t('Explain: Replace search keywords with $1'),
              t('eg {{text}}', {text: 'https://www.baidu.com/s?wd=$1'}),
            ]}
          />
        </ScrollView>
      </PopConfirm>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flex: 1,
  },
  form: {
    flex: 1,
  },
});

export default SearchEngine;
