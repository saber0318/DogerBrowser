import React from 'react';
import {TextStyle} from 'react-native';
import * as RNProgress from 'react-native-progress';
import {ThemeFunctionComponent, withTheme} from '@/theme';

export interface ProgressCircleState {
  progress: number;
  size?: number;
  textSize?: number;
  showsText?: boolean;
  textStyle?: TextStyle;
  formatText?: (progress: number) => string;
}

type ProgressCircleProps = ProgressCircleState;

export type SetProgress = (progress: ProgressCircleState) => void;

const ProgressCircle: ThemeFunctionComponent<ProgressCircleProps> = props => {
  const {
    progress,
    size = 40,
    theme,
    textStyle,
    textSize = 20,
    showsText,
    formatText = () => {},
  } = props;

  return (
    <RNProgress.Circle
      color={theme?.colors.primary}
      size={size}
      textStyle={{...textStyle, fontSize: textSize}}
      progress={progress}
      showsText={showsText}
      formatText={formatText}
    />
  );
};

export default withTheme<ProgressCircleProps>(ProgressCircle, 'ProgressCircle');
