import React, {useRef, useMemo} from 'react';
import {View, Text, StyleSheet, ToastAndroid} from 'react-native';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import ListView, {
  ItemT,
  SectionT,
  FetchData,
  DeleteData,
  DealData,
  OnItemPress,
  ListViewRef,
} from '@/components/ListView';
import {SetCurrentWebViewSource} from '@/components/WebView';
import {useUIState, useUIDispatch} from '@/stores';
import {getHistory, deleteHistory} from '@/servces';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface HistoryProps {
  setCurrentWebViewSource?: SetCurrentWebViewSource;
}

export interface HistoryItem extends ItemT {
  id: number;
  title: string;
  url: string;
  time: string;
}
export interface HistorySection extends SectionT<HistoryItem> {
  data: HistoryItem[];
}

const History: ThemeFunctionComponent<HistoryProps> = props => {
  const {setCurrentWebViewSource = () => {}, theme} = props;

  const {pagesVisible} = useUIState();
  const {historyVisible} = pagesVisible;

  const {t} = useTranslation();

  const {updatePagesVisible, hidePages} = useUIDispatch();

  const listView = useRef<ListViewRef>(null);

  const today = useMemo(() => moment(), []);
  const yesterday = useMemo(() => moment().subtract(1, 'day'), []);

  const onBack = () => {
    updatePagesVisible({historyVisible: false});
  };

  const dealData: DealData<HistoryItem> = (data: HistoryItem[]) => {
    if (data.length === 0) {
      return [];
    }
    let resultSection: HistorySection[] = [];
    let curSection: HistorySection = {
      title: '',
      data: [],
    };

    data.forEach(e => {
      if (curSection.data.length === 0) {
        curSection.title = e.time.slice(0, 10);
        curSection.data = [e];
        resultSection.push(curSection);
      } else if (
        curSection.data.length > 0 &&
        curSection.data[0].time.slice(0, 10) === e.time.slice(0, 10)
      ) {
        curSection.data.push(e);
      } else if (
        curSection.data.length > 0 &&
        curSection.data[0].time.slice(0, 10) !== e.time.slice(0, 10)
      ) {
        curSection = {
          title: e.time.slice(0, 10),
          data: [e],
        };
        resultSection.push(curSection);
      }
    });
    return resultSection;
  };

  const handleOnItemPress: OnItemPress<HistoryItem> = item => {
    setCurrentWebViewSource({uri: item.url});
    hidePages();
  };

  const renderItem = ({item}: {item: HistoryItem}) => {
    return (
      <View style={styles.itemContainer}>
        <Text
          style={[styles.itemTime, {color: theme?.colors.descript}]}
          numberOfLines={1}>
          {item.time?.slice(11, 19)}
        </Text>
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

  const getFormat = (date: string) => {
    if (moment(date).isSame(today, 'day')) {
      return `${t('Today')} ${date}`;
    } else if (moment(date).isSame(yesterday, 'day')) {
      return `${t('Yesterday')} ${date}`;
    }
    return date;
  };

  const renderSectionHeader = ({section}: {section: HistorySection}) => {
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

  const fetchData: FetchData<HistoryItem> = async ({pageSize, pageNum}) => {
    const h = await getHistory({
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
  };

  const deleteData: DeleteData = async (
    ids: number[],
    isSelectAll?: boolean,
    cancelIds?: number[],
  ) => {
    await deleteHistory({ids, isSelectAll, cancelIds});
  };

  return (
    <ListView
      itemKey={'id'}
      ref={listView}
      name={t('History')}
      isVisible={historyVisible}
      hideAdd={true}
      fetchData={fetchData}
      deleteData={deleteData}
      dealData={dealData}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      onItemPress={handleOnItemPress}
      onBack={onBack}
      menuOption={[
        {
          name: t('Open {{text}}', {text: t('Link')}),
          value: 'open',
          onPress: (option: any, extraData: HistoryItem) => {
            console.log('open');
            listView.current?.hidePopupMenu();
            handleOnItemPress(extraData);
          },
        },
        {
          name: t('Copy {{text}}', {text: t('Link')}),
          value: 'copy',
          onPress: (item: any, extraData: HistoryItem) => {
            console.log('copy', listView);
            listView.current?.hidePopupMenu();
            Clipboard.setString(extraData.url);
            ToastAndroid.show(
              t('{{text}} copied to clipboard', {text: t('History')}),
              1000,
            );
          },
        },
        {
          name: t('Delete {{text}}', {text: t('History')}),
          value: 'delete',
          onPress: async (item: any, extraData: HistoryItem) => {
            console.log('delete');
            listView.current?.hidePopupMenu();
            await deleteData([extraData.id]);
            ToastAndroid.show(
              t('{{text}} deleted', {text: t('History')}),
              1000,
            );
            listView.current?.onReSearch();
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
  itemContainer: {
    flex: 1,
    paddingHorizontal: 14,
    marginVertical: 10,
  },
  itemTime: {
    fontSize: 12,
  },
  itemTitle: {
    fontSize: 14,
  },
  itemUrl: {
    fontSize: 12,
    overflow: 'hidden',
  },
});

export default withTheme<HistoryProps>(History, 'History');
