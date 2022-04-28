import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import {ThemeFunctionComponent, withTheme} from '@/theme';

export interface DescTextProps {
  desc: string[];
  style: ViewStyle;
  color?: string;
}

const DescText: ThemeFunctionComponent<DescTextProps> = props => {
  const {desc, style = {}, color, theme} = props;

  return (
    <View style={[styles.wrapper, style]}>
      {desc.map((item, index) => {
        return (
          <Text
            style={[styles.desc, {color: color ?? theme?.colors.text}]}
            key={index}>
            {item}
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingLeft: 20,
    paddingTop: 16,
    paddingRight: 4,
    paddingBottom: 16,
  },
  desc: {
    fontSize: 12,
    marginRight: 10,
    marginBottom: 8,
  },
});

export default withTheme<DescTextProps>(DescText, 'DescText');
