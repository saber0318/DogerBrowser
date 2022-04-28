/**
 * base on
 * https://github.com/instea/react-native-popup-menu
 * https://github.com/callstack/react-native-paper/tree/main/src/components/Menu
 */
import React from 'react';
import {
  View,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Text,
  StyleProp,
  ViewStyle,
  StyleSheet,
  LayoutRectangle,
  Animated,
  Easing,
} from 'react-native';
import Modal from '@/components/Modal';
import {Theme} from '@/theme/types';
import withTheme from '@/theme/withTheme';

export interface MenuOption {
  name: string;
  value: string;
  onPress?: (item: MenuOption, extraData: any) => void;
}
export interface PopupMenuProps {
  extraData?: any;
  onDismiss?: () => void;
  options?: MenuOption[];
}
export interface PopupMenuState {
  isModalVisible: boolean;
  x: number; // 触发事件相对于container元素的x轴位置
  y: number; // 触发事件相对于container元素的y轴位置
  containerWidth: number;
  containerHeight: number;
  menuWidth: number;
  menuHeight: number;
  opacityAnimation: Animated.Value;
}
export interface Show {
  // 相对于modal窗口的xy值
  ({x, y}: {x: number; y: number}): Promise<void>;
}
export type PopupMenuRef = PopupMenu;

const SCREEN_INDENT = 8;
const ANIMATION_DURATION = 50;
const EASING = Easing.bezier(0.4, 0, 0.2, 1);

class PopupMenu extends React.Component<
  PopupMenuProps & {theme?: Theme},
  PopupMenuState
> {
  private container: View | null = null;
  private menuWrapper: View | null = null;
  constructor(props: PopupMenuProps) {
    super(props);
    this.state = {
      isModalVisible: false,
      x: 0,
      y: 0,
      containerWidth: 0,
      containerHeight: 0,
      menuWidth: 0,
      menuHeight: 0,
      opacityAnimation: new Animated.Value(0.01),
    };
  }

  componentDidMount() {}

  componentWillUnmount() {}

  private measureContainerLayout = () =>
    new Promise<LayoutRectangle>(resolve => {
      if (this.container) {
        this.container.measureInWindow((x, y, width, height) => {
          resolve({x, y, width, height});
        });
      }
    });

  private measureMenuLayout = () =>
    new Promise<LayoutRectangle>(resolve => {
      if (this.menuWrapper) {
        this.menuWrapper.measureInWindow((x, y, width, height) => {
          resolve({x, y, width, height});
        });
      }
    });

  private getLayoutValue = async ({x, y}: {x: number; y: number}) => {
    await Promise.resolve();

    const [container, menu] = await Promise.all([
      this.measureContainerLayout(),
      this.measureMenuLayout(),
    ]);

    // console.log('container', container);
    // console.log('menu', menu);

    // console.log('x', x);
    // console.log('y', y);

    const containerWidth = container.width;
    const containerHeight = container.height;
    const menuWidth = menu.width;
    const menuHeight = menu.height;
    // console.log('containerWidth', containerWidth);
    // console.log('containerHeight', containerHeight);
    // console.log('menuWidth', menuWidth);
    // console.log('menuHeight', menuHeight);

    // 相对于容器的原点
    let tarX = x - container.x;
    let tarY = y - container.y;
    // console.log('tarX', tarX);
    // console.log('tarY', tarY);
    // 判断菜单长宽是否超出容器
    const containerOffsetX = menuWidth + SCREEN_INDENT * 2 - containerWidth;
    const containerOffsetY = menuHeight + SCREEN_INDENT * 2 - containerHeight;

    // console.log('containerOffsetX', containerOffsetX);
    // console.log('containerOffsetY', containerOffsetY);

    if (containerOffsetX >= 0) {
      tarX = containerOffsetX / 2;
    } else {
      const menuOffsetX = tarX + menuWidth + SCREEN_INDENT - containerWidth;
      // 如果超出容器宽度
      if (menuOffsetX > 0) {
        tarX = tarX - menuWidth - SCREEN_INDENT;
      }
    }
    if (containerOffsetY >= 0) {
      tarY = containerOffsetY / 2;
    } else {
      const menuOffsetY = tarY + menuHeight + SCREEN_INDENT - containerHeight;
      // 如果超出容器高度
      if (menuOffsetY > 0) {
        tarY = tarY - menuHeight - SCREEN_INDENT;
      }
    }
    return [tarX, tarY];
  };

  public show: Show = async ({x, y}) => {
    // console.log('show', x, y, this.container);
    this.setState(
      {
        isModalVisible: true,
      },
      async () => {
        // 等渲染
        setTimeout(async () => {
          const [tarX, tarY] = await this.getLayoutValue({x, y}).catch(err => {
            console.log('err', err);
            return [0, 0];
          });
          // console.log('tarX, tarY', tarX, tarY);
          this.setState(
            {
              x: tarX,
              y: tarY,
            },
            () => {
              Animated.parallel([
                Animated.timing(this.state.opacityAnimation, {
                  toValue: 1,
                  duration: ANIMATION_DURATION,
                  easing: EASING,
                  useNativeDriver: true,
                }),
              ]).start();
            },
          );
        }, 0);
      },
    );
  };

  public hide = () => {
    console.log('hide');
    const {onDismiss = () => {}} = this.props;
    Animated.timing(this.state.opacityAnimation, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      easing: EASING,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
      this.setState({
        isModalVisible: false,
      });
    });
  };

  private handleOnPress = (item: MenuOption) => {
    console.log('handleOnPress', item);
    const {extraData} = this.props;
    if (item.onPress) {
      item.onPress(item, extraData);
    }
  };

  // HACK measureInWindow返回为undefined，设置opacity: 1无效
  _onLayout = () => {};

  render() {
    const {options = [], theme} = this.props;
    const {isModalVisible, x, y, opacityAnimation} = this.state;

    const containerStyle = {
      opacity: isModalVisible ? 1 : 0,
    };

    const menuWrapperStyle = {
      transform: [{translateX: x}, {translateY: y}],
    };

    const opacityStyle = {
      opacity: opacityAnimation,
      flex: 1, // 填充组件
    };

    return (
      <Modal
        isVisible={isModalVisible}
        backdropOpacity={0}
        onBackdropPress={this.hide}
        onBackButtonPress={this.hide}>
        <View
          ref={r => (this.container = r)}
          style={[styles.container, containerStyle]}
          onLayout={this._onLayout}
          pointerEvents={'box-none'}>
          <TouchableWithoutFeedback onPress={this.hide}>
            <Animated.View
              needsOffscreenAlphaCompositing={true}
              renderToHardwareTextureAndroid={true}
              style={opacityStyle}>
              <View
                ref={r => (this.menuWrapper = r)}
                style={
                  [
                    styles.menuWrapper,
                    {
                      backgroundColor: theme?.colors.background,
                      borderRadius: theme?.roundness,
                    },
                    menuWrapperStyle,
                  ] as StyleProp<ViewStyle>
                }
                onLayout={this._onLayout}>
                {options.map((item, index) => {
                  let style = {};
                  if (index === 0) {
                    style = {
                      borderTopLeftRadius: theme?.roundness,
                      borderTopRightRadius: theme?.roundness,
                    };
                  }
                  if (index === options.length - 1) {
                    style = {
                      borderBottomLeftRadius: theme?.roundness,
                      borderBottomRightRadius: theme?.roundness,
                    };
                  }
                  return (
                    <TouchableHighlight
                      underlayColor={theme?.colors.underlayColor}
                      key={item.value}
                      style={[style, styles.optionContainer]}
                      onPress={() => {
                        this.handleOnPress(item);
                      }}>
                      <Text style={[{color: theme?.colors.text}]}>
                        {item.name}
                      </Text>
                    </TouchableHighlight>
                  );
                })}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuWrapper: {
    alignSelf: 'flex-start',
    elevation: 4,
  },
  optionContainer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
export default withTheme<PopupMenuProps>(PopupMenu, 'PopupMenu');
