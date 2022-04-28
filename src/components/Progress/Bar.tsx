import React from 'react';
import {StyleSheet} from 'react-native';
import * as RNProgress from 'react-native-progress';
import {ThemeFunctionComponent, withTheme} from '@/theme';

export interface ProgressBarState {
  progress: number;
  width?: number;
}

type ProgressBarProps = ProgressBarState;

export type SetProgress = (progress: ProgressBarState) => void;

const ProgressBar: ThemeFunctionComponent<ProgressBarProps> = props => {
  // const [progressValue, setProgressValue] = useState<number>(0);
  const {progress, theme, width} = props;

  return (
    <RNProgress.Bar
      color={theme?.colors.primary}
      style={styles.progress}
      progress={progress}
      width={width} // HACK 设置width解决进度条样式居中的问题
    />
  );
};

const styles = StyleSheet.create({
  progress: {
    position: 'absolute',
    top: 0,
    height: 2,
    width: '100%',
    borderRadius: 0,
    borderWidth: 0,
    zIndex: 1,
  },
});

export default withTheme<ProgressBarProps>(ProgressBar, 'ProgressBar');
