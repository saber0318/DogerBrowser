import React, {useEffect, useState} from 'react';
import {Animated, Easing, ColorValue} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface LoadingProps {
  color?: ColorValue;
  size?: number;
  duration?: number;
}

const LoadingIcon: ThemeFunctionComponent<LoadingProps> = props => {
  const {color, size = 20, duration = 600, theme} = props;
  const [rotateVal] = useState(new Animated.Value(0));
  const [animationLoading] = useState(
    Animated.timing(rotateVal, {
      toValue: 100,
      easing: Easing.linear,
      duration,
      useNativeDriver: true,
    }),
  );

  const AnimatedViewStyle = {
    width: size,
    height: size,
    transform: [
      {
        // 动画属性
        rotate: rotateVal.interpolate({
          inputRange: [0, 100],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  const loadingStyle = {
    fontSize: size,
    color: color ?? theme?.colors.text,
  };

  useEffect(() => {
    Animated.loop(animationLoading).start();
  }, [animationLoading]);

  return (
    <Animated.View style={AnimatedViewStyle}>
      <AntDesign style={loadingStyle} name={'loading2'} />
    </Animated.View>
  );
};

export default withTheme<LoadingProps>(LoadingIcon, 'LoadingIcon');
