import React, {ReactNode, useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Text,
  ViewStyle,
} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Modal from '@/components/Modal';
import {useUIState} from '@/stores';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface PageViewProps {
  name: string;
  isVisible: boolean;
  onBack: () => void;
  renderHeader?: () => ReactNode;
  children?: ReactNode;
  left?: string | number;
  backdropOpacity?: number;
}

const PageView: ThemeFunctionComponent<PageViewProps> = props => {
  const {
    name,
    renderHeader,
    isVisible,
    children,
    onBack = () => {},
    left = 0,
    backdropOpacity = 0,
    theme,
  } = props;

  const {dimension} = useUIState();

  const [headerContainerStyle, setHeaderContainerStyle] = useState<ViewStyle>(
    {},
  );
  const [headerStyle, setHeaderStyle] = useState<ViewStyle>({});

  useEffect(() => {
    const {statusBarHeight = 0, pageHeaderHeight = 0} = dimension || {};
    setHeaderContainerStyle({
      marginTop: statusBarHeight,
    });
    setHeaderStyle({
      height: pageHeaderHeight,
    });
  }, [dimension]);

  const handlePress = () => {
    onBack();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handlePress}
      onBackButtonPress={handlePress}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      backdropOpacity={backdropOpacity}>
      <View
        style={[
          styles.container,
          {backgroundColor: theme?.colors.background, left},
        ]}>
        <View
          style={[
            headerContainerStyle,
            styles.headerContainer,
            {borderColor: theme?.colors.underlayColor},
          ]}>
          {renderHeader ? (
            renderHeader()
          ) : (
            <TouchableWithoutFeedback onPress={handlePress}>
              <View style={[headerStyle, styles.header]}>
                <EvilIcons
                  style={[styles.headerIcon, {color: theme?.colors.text}]}
                  name="chevron-left"
                />
                <Text style={[styles.headerText, {color: theme?.colors.text}]}>
                  {name}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
        <View style={styles.scrollContainer}>{children}</View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    padding: 0,
  },
  headerContainer: {
    // marginTop: statusBarHeight,
    // borderColor: '#f0f0f0',
    borderBottomWidth: 1,
    paddingVertical: 8,
    // paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // height: pageHeaderHeight,
  },
  headerIcon: {
    fontSize: 34,
    // color: '#333',
  },
  headerText: {
    fontSize: 16,
    // color: '#333',
  },
  scrollContainer: {
    flex: 1,
  },
});

export default withTheme<PageViewProps>(PageView, 'PageView');
