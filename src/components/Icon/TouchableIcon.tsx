import React from 'react';
import {
  StyleSheet,
  View,
  TextStyle,
  TouchableOpacity,
  StyleProp,
} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface TouchableIconProps {
  name: string;
  type?: 'EvilIcons' | 'AntDesign';
  visible?: boolean;
  disable?: boolean;
  onPress?: () => void;
  style?: StyleProp<TextStyle>;
  color?: string;
  fontSize?: number;
  iconStyle?: TextStyle;
  children?: React.ReactNode;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto' | undefined;
}

const TouchableIcon: ThemeFunctionComponent<TouchableIconProps> = props => {
  const {
    name,
    color,
    style = {},
    iconStyle = {},
    fontSize,
    visible = true,
    disable,
    type = 'EvilIcons',
    pointerEvents,
    onPress,
    theme,
  } = props;
  const onIconPress = () => {
    if (!disable && onPress) {
      onPress();
    }
  };
  const computedIconStyle = {
    ...iconStyle,
    color: disable ? theme?.colors.disabled : color || theme?.colors.primary,
    fontSize:
      fontSize || fontSize === 0
        ? fontSize
        : iconStyle?.fontSize
        ? iconStyle.fontSize
        : 30,
  };
  return visible ? (
    <View pointerEvents={pointerEvents}>
      <TouchableOpacity
        activeOpacity={0.3}
        style={[style, styles.iconContainer]}
        disabled={disable}
        onPress={onIconPress}>
        {type === 'EvilIcons' && (
          <EvilIcons style={computedIconStyle} name={name} />
        )}
        {type === 'AntDesign' && (
          <AntDesign style={computedIconStyle} name={name} />
        )}
      </TouchableOpacity>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default withTheme<TouchableIconProps>(TouchableIcon, 'TouchableIcon');
