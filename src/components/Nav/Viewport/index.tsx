import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  FlatList,
  Image,
  ToastAndroid,
} from 'react-native';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import {Capture} from '@/components/WebView';
import {
  WebViewGroupItem,
  CreateWebView,
  SetCurrentWebViewId,
  DelWebView,
} from '@/components/WebView';
import Icon from '@/components/Icon';
import PopConfirm from '@/components/Modal/PopConfirm';
import {
  getBookmarksPresentInUrls,
  insertOrReplaceBookmark,
  deleteBookmark,
} from '@/servces';
import {dealUrl} from '@/utils/index';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface ViewportProps {
  webViewGroup: WebViewGroupItem[];
  createWebView: CreateWebView;
  setCurrentWebView: SetCurrentWebViewId;
  delWebView: DelWebView;
  capture: Capture;
  currentRouteId: number | undefined;
}
interface Item extends WebViewGroupItem {
  hasCollect: boolean;
}
interface RenderItem {
  item: Item;
  index: number;
}

const useLen = (webViewGroup: WebViewGroupItem[], maxLen: number = 9) => {
  const [len, setlen] = useState<number | string>(0);
  useEffect(() => {
    if (webViewGroup.length > maxLen) {
      setlen(`${maxLen}+`);
    } else {
      setlen(webViewGroup.length);
    }
  }, [webViewGroup, maxLen]);
  return len;
};

const screenShotWidth = 80;
const screenShotHeight = 60;
const screenShotPadding = 4;
const screenShotStyle = {
  width: screenShotWidth,
  height: screenShotHeight,
  padding: screenShotPadding,
  lineHeight: screenShotHeight - screenShotPadding * 2,
};

const Viewport: ThemeFunctionComponent<ViewportProps> = props => {
  const {
    webViewGroup,
    currentRouteId,
    createWebView = () => {},
    setCurrentWebView = () => {},
    delWebView = () => {},
    capture = () => {},
    theme,
  } = props;
  const [isVisible, setIsVisible] = useState(false);
  const len = useLen(webViewGroup);

  const {t} = useTranslation();

  const [data, setData] = useState<Item[]>([]);

  const featchData = async (items: WebViewGroupItem[]) => {
    const urls = items.map(item => item.state.url);
    const h = await getBookmarksPresentInUrls(urls);
    // console.log('featchData', h);
    if (h.code === 200) {
      const u = h.data.map(i => i.url);
      const d = (items as Item[]).map(item => {
        if (u.includes(item.state.url)) {
          item.hasCollect = true;
        } else {
          item.hasCollect = false;
        }
        return item;
      });
      setData(d);
    }
  };

  useEffect(() => {
    (async () => {
      if (isVisible) {
        await featchData(webViewGroup);
      }
    })();
  }, [webViewGroup, isVisible]);

  const handleShowModal = async () => {
    setIsVisible(true);
    capture();
  };
  const handleHideModal = () => {
    setIsVisible(false);
  };
  const handleCreateWebView = () => {
    setIsVisible(false);
    createWebView();
  };
  const handleDelWebView = (id: number) => {
    delWebView(id);
  };

  const renderItem = (info: RenderItem) => {
    const {item} = info;
    const currentRouteItemStyle =
      currentRouteId === item.id
        ? {backgroundColor: theme?.colors.underlayColor}
        : {};
    const {hasCollect} = item;

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          setIsVisible(false);
          setCurrentWebView(item.id);
        }}>
        <View style={[styles.routeItem, currentRouteItemStyle]}>
          {item.state.preview ? (
            <Image
              style={{width: screenShotWidth, height: screenShotHeight}}
              source={{uri: item.state.preview}}
            />
          ) : (
            <Text
              style={[
                styles.routeItemScreenShot,
                screenShotStyle,
                {
                  borderColor: theme?.colors.underlayColor,
                  color: theme?.colors.descript,
                },
              ]}
              numberOfLines={1}>
              {item.state.title}
            </Text>
          )}

          <View style={styles.routeItemIntro}>
            <Text
              style={[styles.routeItemTitle, {color: theme?.colors.text}]}
              numberOfLines={1}>
              {item.state.title}
            </Text>
            <Text
              style={[
                styles.routeItemSubTitle,
                {color: theme?.colors.descript},
              ]}
              numberOfLines={1}>
              {item.state.url}
            </Text>
          </View>

          {hasCollect ? (
            <Icon
              style={[
                styles.routeItemIcon,
                {backgroundColor: theme?.colors.underlayColor},
              ]}
              type="AntDesign"
              color={theme?.colors.primary}
              name="heart"
              fontSize={20}
              onPress={async () => {
                await deleteBookmark({urls: [item.state.url]});
                await featchData(webViewGroup);
              }}
            />
          ) : (
            <Icon
              style={[
                styles.routeItemIcon,
                {backgroundColor: theme?.colors.underlayColor},
              ]}
              type="AntDesign"
              color={theme?.colors.grey2}
              name="hearto"
              fontSize={20}
              onPress={async () => {
                const r = await insertOrReplaceBookmark({
                  url: dealUrl(item.state.url),
                  title: item.state.title,
                  time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                });
                if (r.code === 500) {
                  ToastAndroid.show(
                    r.message || t('Failed to save bookmark'),
                    1000,
                  );
                  return;
                }
                await featchData(webViewGroup);
              }}
            />
          )}

          <Icon
            style={[
              styles.routeItemIcon,
              {backgroundColor: theme?.colors.underlayColor},
            ]}
            type="EvilIcons"
            color={theme?.colors.grey2}
            name="trash"
            fontSize={34}
            onPress={() => {
              handleDelWebView(item.id);
            }}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  };
  const keyExtractor = (item: WebViewGroupItem) => {
    return String(item.id);
  };

  const renderPopConfirmHeader = () => {
    return (
      <View
        style={[
          styles.modalHeader,
          {borderColor: theme?.colors.underlayColor},
        ]}>
        <Icon
          style={styles.modalHeaderIcon}
          type="EvilIcons"
          color={theme?.colors.grey2}
          name="chevron-left"
          fontSize={34}
          onPress={handleHideModal}
        />
      </View>
    );
  };

  return (
    <View>
      <TouchableOpacity activeOpacity={0.3} onPress={handleShowModal}>
        <View
          style={[styles.viewportIcon, {borderColor: theme?.colors.primary}]}>
          <Text style={[{color: theme?.colors.text}]}>{len}</Text>
        </View>
      </TouchableOpacity>
      <PopConfirm
        isVisible={isVisible}
        onCancel={handleHideModal}
        renderHeader={renderPopConfirmHeader}
        onOk={handleHideModal}>
        <View style={styles.modalContainer}>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
          />
        </View>
        <View style={styles.modalFooter}>
          <TouchableOpacity activeOpacity={0.3} onPress={handleCreateWebView}>
            <Text
              style={[
                styles.modalFooterPlus,
                {
                  color: theme?.colors.primary,
                  borderColor: theme?.colors.primary,
                  borderRadius: theme?.roundness,
                },
              ]}>
              +
            </Text>
          </TouchableOpacity>
        </View>
      </PopConfirm>
    </View>
  );
};

const styles = StyleSheet.create({
  viewportIcon: {
    marginLeft: 2,
    width: 30,
    height: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeader: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalHeaderIcon: {
    transform: [{rotate: '270deg'}],
  },
  modalContainer: {
    flex: 1,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  routeItemScreenShot: {
    borderWidth: 1,
    alignContent: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
  routeItemIntro: {
    flex: 1,
    alignContent: 'center',
    marginHorizontal: 8,
    marginTop: -6,
  },
  routeItemTitle: {
    fontSize: 18,
  },
  routeItemSubTitle: {
    fontSize: 12,
  },
  routeItemIcon: {
    margin: 4,
    width: 40,
    height: 40,
    borderRadius: 40,
    alignContent: 'center',
    justifyContent: 'center',
  },
  modalFooter: {
    padding: 10,
  },
  modalFooterPlus: {
    textAlign: 'center',
    borderWidth: 1,
    fontSize: 20,
    padding: 6,
    borderStyle: 'dashed',
  },
});

export default withTheme<ViewportProps>(Viewport, 'Viewport');
