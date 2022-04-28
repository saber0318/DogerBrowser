import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ThemeFunctionComponent, withTheme} from '@/theme';

const FieldDivider: ThemeFunctionComponent<{}> = props => {
  const {theme} = props;
  return (
    <View style={[styles.divider, {backgroundColor: theme?.colors.grey5}]} />
  );
};

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
    marginHorizontal: 20,
  },
});

export default withTheme<{}>(FieldDivider, 'FieldDivider');
