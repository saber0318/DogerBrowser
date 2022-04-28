import React from 'react';
import {StyleSheet, View} from 'react-native';
import Icon from '@/components/Icon';
import {useUIDispatch} from '@/stores';

const More = () => {
  const {updatePagesVisible} = useUIDispatch();
  const onPress = () => {
    updatePagesVisible({customControlVisible: true});
  };
  return (
    <View>
      <Icon
        style={styles.icon}
        iconStyle={styles.ellipsis1Icon}
        type="AntDesign"
        name="ellipsis1"
        onPress={onPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 30,
    height: 30,
  },
  ellipsis1Icon: {
    fontSize: 18,
    transform: [{rotate: '90deg'}],
  },
});

export default More;
