import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  GestureResponderEvent,
  ToastAndroid,
} from 'react-native';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import {ItemT} from '@/components/ListView';
import PopupMenu, {MenuOption, PopupMenuRef} from '@/components/PopupMenu';
import {SetCurrentWebViewSource} from '@/components/WebView';
import From, {useForm} from '@/components/Form';
import PopConfirm from '@/components/Modal/PopConfirm';
import DescText from '@/components/DescText';
import {insertOrReplaceShortcut, deleteShortcut} from '@/servces';
import {useUIState, useUIDispatch} from '@/stores';
import {dealUrl} from '@/utils/index';
import {ThemeFunctionComponent, withTheme} from '@/theme';

export type ShortcutProps = {
  setCurrentWebViewSource?: SetCurrentWebViewSource;
};

const iconLen = 50;
const iconPadding = 10;
const shortcutPadding = 40;
const iconMarginVertical = 10;
// const iconMarginHorizontal = 10;

const iconWidth = iconLen + iconPadding * 2;
const iconHeight = iconLen + iconPadding * 2 + 4 + 16;

export interface ShortcutItem extends ItemT {
  id: number;
  url: string;
  title: string;
  time: string;
  icon?: string;
}

const Shortcut: ThemeFunctionComponent<ShortcutProps> = props => {
  const {setCurrentWebViewSource = () => {}, theme} = props;

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // 长按选中的item
  const [longPressItem, setLongPressItem] = useState<ShortcutItem | null>();

  const [list, setList] = useState<(ShortcutItem | null)[]>([]);

  const shortcutRef = useRef<View>();

  const {shortcut = [], dimension} = useUIState();
  const {updateShortcut} = useUIDispatch();

  const {t} = useTranslation();

  const popupMenu = useRef<PopupMenuRef>();
  const [form] = useForm();

  useEffect(() => {
    measureShortcutLayout(({width = 0, height = 0}) => {
      const column = Math.floor((width - shortcutPadding * 2) / iconWidth);
      const row = Math.floor((height - shortcutPadding * 2) / iconHeight);
      const len = row * column;
      let l = new Array(len).fill(null);
      shortcut
        .concat()
        .splice(0, len)
        .map((item, index) => {
          l[index] = item;
        });
      setList(l);
    });
  }, [shortcut, dimension]);

  const handleItemLongPress = (
    event: GestureResponderEvent,
    item: ShortcutItem,
  ) => {
    console.log('handleItemLongPress');
    const {nativeEvent} = event;
    const {pageX, pageY} = nativeEvent;
    setLongPressItem(item);
    showMenu({
      x: pageX,
      y: pageY,
    });
  };

  const renderShortcutItem = (item: ShortcutItem, index: number) => {
    return (
      <TouchableOpacity
        key={index}
        activeOpacity={0.3}
        onPress={() => {
          setCurrentWebViewSource({uri: item.url});
        }}
        delayLongPress={500}
        onLongPress={event => handleItemLongPress(event, item)}>
        <View style={styles.shortcutItem}>
          {item.icon ? (
            <Image
              style={[
                styles.shortcutItemImage,
                {backgroundColor: theme?.colors.descript},
              ]}
              source={{uri: item.icon}}
            />
          ) : (
            <View style={styles.shortcutItemTextContainer}>
              <Text
                style={[
                  styles.shortcutItemText,
                  {
                    color: theme?.colors.white,
                    backgroundColor: theme?.colors.primary,
                  },
                ]}>
                {item.title[0].toLocaleUpperCase()}
              </Text>
            </View>
          )}
          <Text
            style={[styles.shortcutItemName, {color: theme?.colors.text}]}
            numberOfLines={1}>
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAddItem = (index: number) => {
    return (
      <TouchableOpacity key={index} activeOpacity={0.3} onPress={addShortcut}>
        <View style={styles.shortcutItem}>
          <View style={styles.shortcutItemTextContainer}>
            <Text
              style={[
                styles.shortcutPlus,
                {
                  color: theme?.colors.primary,
                  borderColor: theme?.colors.primary,
                },
              ]}>
              +
            </Text>
          </View>
          <Text
            style={[styles.shortcutItemName, {color: theme?.colors.text}]}
            numberOfLines={1}>
            {t('Add')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const rednerPlaceholderItem = (index: number) => {
    return <View key={index} style={styles.placeholder} />;
  };

  const menuOptions: MenuOption[] = [
    {
      name: t('Open {{text}}', {text: t('Link')}),
      value: 'open',
      onPress: (option, extraData: ShortcutItem) => {
        console.log('open');
        hideMenu();
        setCurrentWebViewSource({uri: extraData.url});
      },
    },
    {
      name: t('Edit {{text}}', {text: t('Link')}),
      value: 'edit',
      onPress: (option, extraData: ShortcutItem) => {
        console.log('edit');
        hideMenu();
        modifyShortcut(extraData);
      },
    },
    {
      name: t('Copy {{text}}', {text: t('Link')}),
      value: 'copy',
      onPress: (item, extraData: ShortcutItem) => {
        console.log('copy');
        hideMenu();
        Clipboard.setString(extraData.url);
        ToastAndroid.show(
          t('{{text}} copied to clipboard', {text: t('Link')}),
          1000,
        );
      },
    },
    {
      name: t('Delete {{text}}', {text: t('Link')}),
      value: 'delete',
      onPress: async (item, extraData: ShortcutItem) => {
        console.log('delete');
        hideMenu();
        await deleteShortcut({ids: [extraData.id]});
        updateShortcut();
        ToastAndroid.show(t('{{text}} deleted', {text: t('Link')}), 1000);
      },
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const showMenu = (position: {x: number; y: number}) => {
    popupMenu.current?.show(position);
  };

  const hideMenu = () => {
    popupMenu.current?.hide();
  };

  const addShortcut = () => {
    showModal();
    form.resetField();
  };

  const modifyShortcut = (item: ShortcutItem) => {
    showModal();
    form.setFieldsValue({
      id: item.id,
      title: item.title,
      url: item.url,
      icon: item.icon,
      time: item.time,
    });
  };

  const handleMenuDismiss = () => {
    setLongPressItem(null);
  };

  const measureShortcutLayout = (
    cb: ({width, height}: {width: number; height: number}) => void,
  ) => {
    setTimeout(() => {
      if (shortcutRef.current) {
        shortcutRef.current.measureInWindow((x, y, width, height) => {
          cb({width, height});
        });
      }
    }, 0);
  };

  return (
    <>
      <View
        style={styles.shortcut}
        onLayout={() => {}}
        ref={r => {
          if (r) {
            shortcutRef.current = r;
          }
        }}>
        {(list || []).map((item, index) => {
          if (item) {
            return renderShortcutItem(item, index);
          }
          if (!item && index === 0) {
            return renderAddItem(index);
          }
          if (list[index - 1]) {
            return renderAddItem(index);
          }
          if (!list[index - 1]) {
            return rednerPlaceholderItem(index);
          }
        })}
      </View>

      <PopupMenu
        ref={(r: PopupMenuRef) => {
          if (r) {
            popupMenu.current = r;
          }
        }}
        extraData={longPressItem}
        onDismiss={handleMenuDismiss}
        options={menuOptions}
      />
      <PopConfirm
        isVisible={isModalVisible}
        onCancel={hideModal}
        onOk={async () => {
          await form
            .validator()
            .then(async stores => {
              console.log(stores);
              const {id, url, title, time, icon} = stores;
              const r = await insertOrReplaceShortcut({
                id,
                url: dealUrl(url),
                title,
                time: time || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                icon,
              });
              if (r.code === 500) {
                ToastAndroid.show(r.message || t('Error'), 1000);
                return;
              }
              updateShortcut();
              hideModal();
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
    </>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    marginVertical: iconMarginVertical,
    width: iconWidth,
    height: iconHeight,
  },
  shortcut: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    alignContent: 'center',
    padding: shortcutPadding,
  },
  shortcutItem: {
    marginVertical: iconMarginVertical,
    // marginHorizontal: iconMarginHorizontal,
    padding: iconPadding,
  },
  shortcutItemImage: {
    width: iconLen,
    height: iconLen,
    borderRadius: iconLen,
    textAlign: 'center',
  },
  shortcutItemTextContainer: {
    alignItems: 'center',
  },
  shortcutPlus: {
    width: iconLen,
    height: iconLen,
    fontSize: 18,
    lineHeight: iconLen,
    borderRadius: iconLen,
    textAlign: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  shortcutItemText: {
    width: iconLen,
    height: iconLen,
    fontSize: 18,
    lineHeight: iconLen,
    borderRadius: iconLen,
    textAlign: 'center',
  },
  shortcutItemName: {
    marginTop: 4,
    width: iconLen,
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'center',
  },
  icon: {
    width: 30,
    height: 30,
  },
  item: {
    flex: 1,
  },
  form: {
    flex: 1,
  },
});

export default withTheme<ShortcutProps>(Shortcut, 'Shortcut');
