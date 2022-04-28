import React, {useState, useCallback, useRef, useEffect} from 'react';
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
import {SetCurrentWebViewSource} from '@/components/WebView';
import From, {useForm} from '@/components/Form';
import DescText from '@/components/DescText';
import {
  insertOrReplaceHomePage,
  getHomePage,
  deleteHomePage,
  getHomePagesPresentInUrls,
} from '@/servces';
import {useUIState, useUIDispatch} from '@/stores';
import {dealUrl, getDomain} from '@/utils/index';

interface HomePageProps {
  setCurrentWebViewSource?: SetCurrentWebViewSource;
}

export interface HomePageItem extends ItemT {
  id: number;
  url: string;
  title: string;
  time: string;
}

interface HomePageSection extends SectionT<HomePageItem> {
  data: HomePageItem[];
}

const HomePage = (props: HomePageProps) => {
  const {setCurrentWebViewSource = () => {}} = props;

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [disabledList, setDisabledList] = useState<number[]>([]);

  const {t} = useTranslation();

  const {homePage, pagesVisible} = useUIState();
  const {homePageVisible} = pagesVisible;

  const {updateHomePage, updatePagesVisible, hidePages} = useUIDispatch();

  useEffect(() => {
    (async () => {
      const g = await getHomePagesPresentInUrls([homePage]);
      if (g.code === 200 && g.data.length > 0) {
        setDisabledList([g.data[0].id]);
      }
    })();
  }, [homePage]);

  const handleUpdateHomePage = async (url: string) => {
    updateHomePage(url);
  };

  const [form] = useForm();
  const listView = useRef<ListViewRef>(null);

  const onBack = () => {
    updatePagesVisible({homePageVisible: false});
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

  const dealData = useCallback((data: HomePageItem[]) => {
    if (data.length === 0) {
      return [];
    }
    let resultSection: HomePageSection[] = [];
    let curSection: HomePageSection = {
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

  const handleOnItemPress: OnItemPress<HomePageItem> = item => {
    handleUpdateHomePage(item.url);
  };

  const renderItem = ({item}: {item: HomePageItem}) => {
    return (
      <View style={styles.item} pointerEvents={'none'}>
        <FieldRadio
          label={item.title}
          subLabel={getDomain(item.url)}
          checked={homePage === item.url}
        />
      </View>
    );
  };

  const fetchData: FetchData<HomePageItem> = useCallback(async () => {
    const h = await getHomePage();
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

  const deleteData: DeleteData = useCallback(
    async (ids: number[], isSelectAll?: boolean, cancelIds?: number[]) => {
      await deleteHomePage({ids, isSelectAll, cancelIds});
    },
    [],
  );

  return (
    <View>
      <ListView
        ref={listView}
        itemKey="id"
        name={t('Home page')}
        isVisible={homePageVisible}
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
            name: t('Open {{text}}', {text: t('Link')}),
            value: 'open',
            onPress: (option: any, extraData: HomePageItem) => {
              console.log('open');
              listView.current?.hidePopupMenu();
              setCurrentWebViewSource({uri: extraData.url});
              hidePages();
            },
          },
          {
            name: t('Edit {{text}}', {text: t('Home page')}),
            value: 'edit',
            onPress: (option: any, extraData: HomePageItem) => {
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
            onPress: (item: any, extraData: HomePageItem) => {
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
            name: t('Delete {{text}}', {text: t('Home page')}),
            value: 'delete',
            onPress: async (item: any, extraData: HomePageItem) => {
              console.log('delete', extraData.url, homePage);
              if (extraData.url === homePage) {
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
                  t('{{text}} deleted', {text: t('Home page')}),
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
              const u = dealUrl(url);
              const r = await insertOrReplaceHomePage({
                id,
                url: u,
                title,
                time: time || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
              });
              if (r.code === 500) {
                ToastAndroid.show(r.message || t('Error'), 1000);
                return;
              }
              handleUpdateHomePage(u);
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
  item: {
    flex: 1,
  },
  form: {
    flex: 1,
  },
});

export default HomePage;
