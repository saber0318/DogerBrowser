import React from 'react';
import {View, Text, ViewStyle} from 'react-native';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface WrodBreakTextProps {
  content?: string;
  style?: ViewStyle;
}

const WrodBreakText: ThemeFunctionComponent<WrodBreakTextProps> = props => {
  const {content, style = {}, theme} = props;

  return content ? (
    <Text style={style}>
      {[...content].map((item, index) => {
        return (
          <View key={index}>
            <Text style={{color: theme?.colors.text}}>{item}</Text>
          </View>
        );
      })}
    </Text>
  ) : (
    <Text style={style} />
  );
};

export default withTheme<WrodBreakTextProps>(WrodBreakText, 'WrodBreakText');
