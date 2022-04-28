import React, {
  useEffect,
  useState,
  useCallback,
  ReactElement,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  View,
  TouchableHighlight,
  TouchableOpacity,
  Text,
  SectionList,
  StyleSheet,
  ToastAndroid,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useTranslation} from 'react-i18next';
import PopupMenu, {MenuOption, PopupMenuRef} from '@/components/PopupMenu';
import PageView from '@/components/PageView';
import Confirm from '@/components/Modal/Confirm';
import Checkbox from '@/components/Checkbox';
import Icon from '@/components/Icon';
import {DEFAULT_PAGE_NUM, DEFAULT_PAGE_SIZE} from '@/config/default';
import {useUIState} from '@/stores';
import {ThemeForwardRefRenderFunction, withTheme} from '@/theme';

export type ItemT = any;
export interface SectionT<T extends ItemT> {
  title: string;
  data: T[];
}
export interface FetchDataParmas {
  pageNum: number;
  pageSize: number;
}
export interface FetchDataResult<T extends ItemT> {
  pageNum: number;
  pageSize: number;
  total: number;
  list: T[];
}
export interface FetchData<T extends ItemT> {
  (params: FetchDataParmas): Promise<FetchDataResult<T>>;
}
export interface DeleteData {
  (selectList: any[], isSelectAll?: boolean, cancelList?: any[]): Promise<void>;
}
export interface DealData<T extends ItemT> {
  (itemList: T[]): SectionT<T>[];
}
export interface OnItemPress<T extends ItemT> {
  (item: T): void;
}
export interface ListViewProps {
  itemKey: string;
  isVisible: boolean;
  name: string;
  onBack: () => void;
  fetchData: FetchData<any extends ItemT ? any : never>;
  deleteData?: DeleteData;
  addData?: () => void;
  dealData: DealData<any extends ItemT ? any : never>;
  hideAdd?: boolean;
  hideDelete?: boolean;
  onItemPress: OnItemPress<any extends ItemT ? any : never>;
  renderItem: ({
    item,
    clearing,
  }: {
    item: any extends ItemT ? any : never;
    clearing: boolean;
  }) => ReactElement;
  renderSectionHeader?: ({
    section,
  }: {
    section: SectionT<any extends ItemT ? any : never>;
  }) => ReactElement | null;
  menuOption?: MenuOption[] | {(i: ItemT): MenuOption[]};
  disabledList?: any[];
  initialNumToRender?: number;
}
export interface ListViewRef {
  onReSearch: () => void;
  hidePopupMenu: () => void;
}

const ListView: ThemeForwardRefRenderFunction<ListViewRef, ListViewProps> =
  forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
      onReSearch,
      hidePopupMenu,
    }));

    const {
      itemKey = 'id',
      isVisible,
      name,
      onBack = () => {},
      fetchData = () => ({
        total: 0,
        pageNum: 0,
        pageSize: 0,
        list: [],
      }),
      addData = () => {},
      deleteData,
      dealData = () => [],
      onItemPress = () => {},
      hideAdd = false,
      hideDelete = false,
      renderItem,
      renderSectionHeader,
      menuOption,
      disabledList = [],
      initialNumToRender = 50,
      theme,
    } = props;

    const [refreshing, setRefreshing] = useState<boolean>(false); // 正在下拉刷新
    const [loading, setLoading] = useState<boolean>(false); // 正在上拉加载更多数据
    const [clearing, setClearing] = useState<boolean>(false); // 正在选择需要清除的数据

    // const [selectState, dispatch] = useReducer(initialSelectState);

    const [selectList, setSelectList] = useState<any[]>([]); // 当前选中的itemKey列表
    const [isSelectChecked, setIsSelectChecked] = useState<boolean>(false); // 是否选择
    const [isSelectAll, setIsSelectAll] = useState<boolean>(false); // 是否全部选择
    const [isIndeterminate, setIsindeterminate] = useState<boolean>(false); // 选择是否是部分选择

    const [cancelList, setCancelList] = useState<any[]>([]); // 全选时取消选择的itemKey列表

    const [pageNum, setPageNum] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [data, setData] = useState<any extends ItemT ? any[] : never>([]);

    const [confirmLoading, setConfirmLoading] = useState<boolean>(false); // 正在上拉加载更多数据
    const [confirmVisible, setConfirmVisible] = useState<boolean>(false);

    // 长按选中的item
    const [longPressItem, setLongPressItem] =
      useState<any extends ItemT ? any : never>();

    const [sections, setSections] = useState<
      SectionT<any extends ItemT ? any : never>[]
    >([]);

    const {dimension} = useUIState();
    const [heightStyle, setHeightStyle] = useState<ViewStyle>({});
    const [lineHeightStyle, setLineHeightStyle] = useState<TextStyle>({});

    useEffect(() => {
      const {pageHeaderHeight = 0} = dimension || {};
      setHeightStyle({
        height: pageHeaderHeight,
      });
      setLineHeightStyle({
        lineHeight: pageHeaderHeight,
      });
    }, [dimension]);

    useEffect(() => {
      if (clearing) {
        if (!isSelectAll && selectList.length === 0) {
          setIsSelectChecked(false);
        }
        if (!isSelectAll && selectList.length !== 0) {
          setIsSelectChecked(true);
        }
        if (isSelectAll) {
          setIsSelectChecked(true);
        }

        if (!isSelectAll && selectList.length === 0) {
          setIsindeterminate(false);
        }
        if (!isSelectAll && selectList.length + disabledList.length >= total) {
          setIsindeterminate(false);
        }
        if (!isSelectAll && selectList.length + disabledList.length < total) {
          setIsindeterminate(true);
        }
        if (isSelectAll && cancelList.length !== 0) {
          setIsindeterminate(true);
        }
        if (isSelectAll && cancelList.length === 0) {
          setIsindeterminate(false);
        }

        if (isSelectAll && cancelList.length + disabledList.length >= total) {
          setIsSelectAll(false);
        }
      }
      if (!clearing) {
        setIsSelectChecked(false);
        setIsSelectAll(false);
        setIsindeterminate(false);
      }
    }, [clearing, isSelectAll, cancelList, selectList, disabledList, total]);

    const popupMenu = useRef<PopupMenuRef>();

    const {t} = useTranslation();

    const handlePress = () => {
      onBack();
    };

    const reset = () => {
      setIsSelectChecked(false);
      setIsSelectAll(false);
      setIsindeterminate(false);
      setSelectList([]);
      setCancelList([]);
      setClearing(false);
      setConfirmLoading(false);
      setConfirmVisible(false);
      setLongPressItem(null);
    };

    const handleOnRefresh = useCallback(async () => {
      console.log('handleOnRefresh');
      setRefreshing(true);
      const h = await fetchData({
        pageNum: DEFAULT_PAGE_NUM,
        pageSize: DEFAULT_PAGE_SIZE,
      });

      setTotal(h.total);
      setPageNum(h.pageNum);
      setPageSize(h.pageSize);
      setData(h.list);
      const s = await dealData(h.list);
      setSections(s);

      setRefreshing(false);
    }, [dealData, fetchData]);

    useEffect(() => {
      if (isVisible) {
        handleOnRefresh();
      } else {
        reset();
      }
    }, [isVisible, handleOnRefresh]);

    const loadingMore = async () => {
      if (
        loading ||
        refreshing ||
        data.length >= total ||
        pageNum * pageSize >= total
      ) {
        return;
      }
      setLoading(true);
      const l = await fetchData({pageNum: pageNum + 1, pageSize});

      setTotal(l.total);
      setPageNum(l.pageNum);
      setPageSize(l.pageSize);
      const allData = [...data, ...l.list];
      setData(allData);
      const s = await dealData(allData);
      setSections(s);

      setLoading(false);
    };

    const toggleCancelCheck = (key: any) => {
      const index = cancelList.indexOf(key);
      let list = [];
      if (index < 0) {
        list = [...cancelList, key];
      } else {
        list = [...cancelList];
        list.splice(index, 1);
      }
      setCancelList(list);
    };

    const toggleClearingCheck = (key: any) => {
      const index = selectList.indexOf(key);
      let list = [];
      if (index < 0) {
        list = [...selectList, key];
      } else {
        list = [...selectList];
        list.splice(index, 1);
      }
      setSelectList(list);
    };

    const handleItemPress = (item: ItemT) => {
      console.log('item', item);
      if (isSelectAll) {
        toggleCancelCheck(item[itemKey]);
      }

      if (!isSelectAll && clearing) {
        toggleClearingCheck(item[itemKey]);
      }

      if (!isSelectAll && !clearing) {
        onItemPress(item);
      }
    };

    const handleItemLongPress = (event: GestureResponderEvent, item: ItemT) => {
      console.log('handleItemLongPress');
      if (!clearing) {
        const {nativeEvent} = event;
        const {pageX, pageY} = nativeEvent;
        setLongPressItem(item);
        popupMenu.current?.show({
          x: pageX,
          y: pageY,
        });
      }
    };

    const hidePopupMenu = () => {
      popupMenu.current?.hide();
    };

    const handleMenuDismiss = () => {
      setLongPressItem(null);
    };

    const handleOnEndReached = async () => {
      console.log('handleOnEndReached');
      await loadingMore();
    };

    const handleSelectAll = () => {
      // 全选
      if (isIndeterminate || !isSelectChecked) {
        setIsSelectAll(true);
      }
      // 取消选择
      if (!isIndeterminate && isSelectChecked) {
        setIsSelectAll(false);
      }
      setSelectList([]);
      setCancelList([]);
    };

    const keyExtractor = (item: ItemT) => {
      return String(item[itemKey]);
    };

    const handleDeleting = async () => {
      if (!isSelectAll && selectList.length === 0) {
        ToastAndroid.show(t('Please select the data to delete!'), 1000);
        return;
      }
      setConfirmVisible(true);
    };

    const handleCancelClear = () => {
      setClearing(false);
    };

    const handleClearing = () => {
      console.log('handleClearing');
      setSelectList([]);
      setCancelList([]);
      setClearing(true);
    };

    const handleUndelete = () => {
      setConfirmLoading(false);
      setConfirmVisible(false);
    };

    const handleConfirmDeletion = async () => {
      if (deleteData) {
        setConfirmLoading(true);
        await deleteData(selectList, isSelectAll, cancelList);

        await onReSearch();
        setSelectList([]);
        setCancelList([]);
        setConfirmVisible(false);
        setConfirmLoading(false);
      }
    };

    // 重新查询已经查询个数的数据
    const onReSearch = async () => {
      const l = await fetchData({pageNum: 0, pageSize: data.length + pageSize}); // 多查一个分页，防止有新增的
      setTotal(l.total);
      setPageNum(Math.ceil(data.length / pageSize) - 1);
      setData(l.list);
      const s = await dealData(l.list);
      setSections(s);
      if (l.total === 0) {
        setClearing(false);
      }
    };

    const renderHeader = () => {
      return (
        <View style={[heightStyle, styles.header]}>
          <Text
            style={[
              lineHeightStyle,
              styles.headerText,
              {color: theme?.colors.text},
            ]}>
            {t('{{text}} selected', {
              text: isSelectAll
                ? total - cancelList.length - disabledList.length
                : selectList.length,
            })}
          </Text>
          <TouchableOpacity activeOpacity={0.3} onPress={handleSelectAll}>
            <View style={styles.handerSelectContainer}>
              <Checkbox
                style={styles.checkBox}
                checked={isSelectChecked}
                indeterminate={isIndeterminate}
              />
              <Text
                style={[
                  lineHeightStyle,
                  styles.headerSelectText,
                  {color: theme?.colors.text},
                ]}>
                {isIndeterminate || !isSelectChecked
                  ? t('Select all')
                  : t('Deselect')}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.3} onPress={handleCancelClear}>
            <Text
              style={[
                lineHeightStyle,
                styles.headerCancelText,
                {color: theme?.colors.primary},
              ]}>
              {t('Cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    };

    const renderCheckbox = (item: ItemT) => {
      if (!clearing) {
        return null;
      }
      const key = item[itemKey];
      let checked = false;
      if (isSelectAll) {
        checked = !cancelList.includes(key);
      }
      if (!isSelectAll) {
        checked = selectList.includes(key);
      }

      const disabled = disabledList.includes(key);

      return (
        <View style={styles.itemCheckbox}>
          <Checkbox
            style={styles.checkBox}
            checked={!disabled && checked}
            disabled={disabled}
          />
        </View>
      );
    };

    const renderSectionListItem = ({item}: {item: ItemT}) => {
      const itemStyle =
        longPressItem?.[itemKey] === item[itemKey]
          ? {
              backgroundColor: theme?.colors.underlayColor,
            }
          : {};
      const disabled = disabledList.includes(item[itemKey]);
      return clearing && disabled ? (
        <View style={[styles.item, itemStyle]}>
          {renderCheckbox(item)}
          {renderItem({item, clearing})}
        </View>
      ) : (
        <TouchableHighlight
          underlayColor={theme?.colors.underlayColor}
          onPress={() => handleItemPress(item)}
          delayLongPress={500}
          onLongPress={event => handleItemLongPress(event, item)}>
          <View style={[styles.item, itemStyle]}>
            {renderCheckbox(item)}
            {renderItem({item, clearing})}
          </View>
        </TouchableHighlight>
      );
    };

    const ListFooterComponent = () => {
      if (data.length < total && loading) {
        return (
          <View style={[styles.listFooter]}>
            <Icon.Loading size={10} color={theme?.colors.descript} />
            <Text style={[styles.loadingText, {color: theme?.colors.descript}]}>
              {t('Loading')}
            </Text>
          </View>
        );
      }
      if (data.length !== 0 && data.length >= total) {
        return (
          <Text style={[styles.listFooter, {color: theme?.colors.descript}]}>
            {t('I have a bottom line.')}
          </Text>
        );
      }
      return null;
    };

    const ListEmptyComponent = () => {
      return refreshing ? null : (
        <Text style={[styles.listEmpty, {color: theme?.colors.descript}]}>
          {t('No data')}
        </Text>
      );
    };

    return (
      <PageView
        name={name}
        renderHeader={clearing ? renderHeader : undefined}
        isVisible={isVisible}
        onBack={handlePress}>
        <View style={styles.container}>
          <SectionList
            sections={sections}
            keyExtractor={keyExtractor}
            renderItem={renderSectionListItem}
            renderSectionHeader={renderSectionHeader}
            refreshing={refreshing}
            onRefresh={handleOnRefresh}
            onEndReachedThreshold={0}
            onEndReached={handleOnEndReached}
            ListFooterComponent={ListFooterComponent}
            ListEmptyComponent={ListEmptyComponent}
            initialNumToRender={initialNumToRender}
          />
          {!hideAdd || (!hideDelete && sections.length > 0) ? (
            <View
              style={[
                styles.footer,
                {borderTopColor: theme?.colors.underlayColor},
              ]}>
              {!hideAdd && !clearing ? (
                <TouchableOpacity
                  activeOpacity={0.3}
                  style={styles.footerBooton}
                  onPress={addData}>
                  <AntDesign
                    style={[styles.footerIcon, {color: theme?.colors.grey2}]}
                    name="plus"
                  />
                  <Text
                    style={[styles.footerText, {color: theme?.colors.grey2}]}>
                    {t('Add')}
                  </Text>
                </TouchableOpacity>
              ) : null}
              {sections.length > 0 && !hideDelete && !clearing ? (
                <TouchableOpacity
                  activeOpacity={0.3}
                  style={styles.footerBooton}
                  onPress={handleClearing}>
                  <AntDesign
                    style={[styles.footerIcon, {color: theme?.colors.grey2}]}
                    name="delete"
                  />
                  <Text
                    style={[styles.footerText, {color: theme?.colors.grey2}]}>
                    {t('Empty')}
                  </Text>
                </TouchableOpacity>
              ) : null}
              {sections.length > 0 && !hideDelete && clearing ? (
                <TouchableOpacity
                  activeOpacity={0.3}
                  style={styles.footerBooton}
                  onPress={handleDeleting}>
                  <AntDesign
                    style={[styles.footerIcon, {color: theme?.colors.grey2}]}
                    name="close"
                  />
                  <Text
                    style={[styles.footerText, {color: theme?.colors.grey2}]}>
                    {t('Delete')}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>
        <Confirm
          isVisible={confirmVisible}
          title={t('Attention')}
          content={t('Are you sure to delete?')}
          loading={confirmLoading}
          confirmTextStyle={{color: theme?.colors.error}}
          onCancel={handleUndelete}
          onOk={handleConfirmDeletion}
        />

        {menuOption ? (
          <PopupMenu
            ref={(r: PopupMenuRef) => {
              if (r) {
                popupMenu.current = r;
              }
            }}
            extraData={longPressItem}
            onDismiss={handleMenuDismiss}
            options={
              typeof menuOption === 'function'
                ? menuOption(longPressItem)
                : menuOption
            }
          />
        ) : null}
      </PageView>
    );
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    padding: 10,
  },
  header: {
    // height: pageHeaderHeight,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  handerSelectContainer: {
    flexDirection: 'row',
    // flexWrap: 'nowrap',
    alignItems: 'center',
    // justifyContent: 'center',
  },
  headerText: {
    position: 'absolute',
    left: 0,
    right: 0,
    // lineHeight: pageHeaderHeight,
    textAlign: 'center',
  },
  headerSelectText: {
    // lineHeight: pageHeaderHeight,
    paddingHorizontal: 6,
  },
  headerCancelText: {
    // lineHeight: pageHeaderHeight,
    paddingHorizontal: 10,
  },
  checkBox: {
    marginLeft: 20,
  },
  item: {
    flexDirection: 'row',
    alignContent: 'center',
  },
  itemCheckbox: {
    justifyContent: 'center',
  },
  listFooter: {
    margin: 10,
    fontSize: 10,
    textAlign: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 10,
    marginLeft: 4,
  },
  listEmpty: {
    marginVertical: 50,
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  footerBooton: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  footerIcon: {
    fontSize: 22,
  },
  footerText: {
    fontSize: 10,
  },
});

export default withTheme(ListView, 'ListView');
