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
import {
  insertOrReplaceUserAgent,
  getUserAgent,
  deleteUserAgent,
  getUserAgentPresentInStrings,
} from '@/servces';
import {useUIState, useUIDispatch} from '@/stores';

export interface UserAgentItem extends ItemT {
  id: number;
  title: string;
  string: string;
  time: string;
}

interface UserAgentSection extends SectionT<UserAgentItem> {
  data: UserAgentItem[];
}

const UserAgent = () => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [disabledList, setIsabledList] = useState<number[]>([]);

  const {t} = useTranslation();

  const {userAgent, pagesVisible} = useUIState();
  const {userAgentVisible} = pagesVisible;

  const {updateUserAgent, updatePagesVisible} = useUIDispatch();

  useEffect(() => {
    (async () => {
      await getUserAgentPresentInStrings([userAgent, '']).then(res => {
        if (res.code === 200) {
          setIsabledList(res.data.map(item => item.id));
        }
      });
    })();
  }, [userAgent]);

  const handleUpdateUserAgent = async (string: string) => {
    updateUserAgent(string);
  };

  const [form] = useForm();
  const listView = useRef<ListViewRef>(null);

  const onBack = () => {
    updatePagesVisible({userAgentVisible: false});
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

  const dealData = useCallback((data: UserAgentItem[]) => {
    if (data.length === 0) {
      return [];
    }
    let resultSection: UserAgentSection[] = [];
    let curSection: UserAgentSection = {
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

  const handleOnItemPress: OnItemPress<UserAgentItem> = item => {
    handleUpdateUserAgent(item.string);
  };

  const renderItem = ({item}: {item: UserAgentItem}) => {
    return (
      <View style={styles.item} pointerEvents={'none'}>
        <FieldRadio
          label={item.title || t('Default')}
          subLabel={item.string || t('No agent')}
          checked={userAgent === item.string}
        />
      </View>
    );
  };

  const fetchData: FetchData<UserAgentItem> = useCallback(async () => {
    const h = await getUserAgent();
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
    await deleteUserAgent({ids});
  }, []);
  return (
    <>
      <ListView
        ref={listView}
        itemKey="id"
        name={t('User agent')}
        isVisible={userAgentVisible}
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
            name: t('Edit {{text}}', {text: t('User agent')}),
            value: 'edit',
            onPress: (option: any, extraData: UserAgentItem) => {
              console.log('edit');
              listView.current?.hidePopupMenu();
              showModal();
              form.setFieldsValue({
                id: extraData.id,
                string: extraData.string,
                title: extraData.title,
                time: extraData.time,
              });
            },
          },
          {
            name: t('Copy {{text}}', {text: t('Text')}),
            value: 'copy',
            onPress: (item: any, extraData: UserAgentItem) => {
              console.log('copy');
              listView.current?.hidePopupMenu();
              Clipboard.setString(extraData.string);
              ToastAndroid.show(
                t('{{text}} copied to clipboard', {text: t('User agent')}),
                1000,
              );
            },
          },
          {
            name: t('Delete {{text}}', {text: t('User agent')}),
            value: 'delete',
            onPress: async (item: any, extraData: UserAgentItem) => {
              console.log('delete', extraData, userAgent);
              if (extraData.string === '') {
                listView.current?.hidePopupMenu();
                ToastAndroid.show(
                  t('The default {{text}} cannot be deleted!', {
                    text: t('User agent'),
                  }),
                  1000,
                );
                return;
              }
              if (extraData.string === userAgent) {
                listView.current?.hidePopupMenu();
                ToastAndroid.show(
                  t('The {{text}} in use cannot be deleted!', {
                    text: t('User agent'),
                  }),
                  1000,
                );
                return;
              }
              listView.current?.hidePopupMenu();
              await deleteData([extraData.id]);
              ToastAndroid.show(
                t('{{text}} deleted', {text: t('User agent')}),
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
              const {id, string, title, time} = stores;
              const r = await insertOrReplaceUserAgent({
                id,
                string,
                title,
                time: time || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
              });
              if (r.code === 500) {
                ToastAndroid.show(r.message || t('Error'), 1000);
                return;
              }
              handleUpdateUserAgent(string);
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
              label={t('Content')}
              name="string"
              multiline={true}
              numberOfLines={4}
              rules={[{required: true}]}
            />
          </From>
          <DescText desc={[t('What is user agent')]} />
        </ScrollView>
      </PopConfirm>
    </>
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

export default UserAgent;
