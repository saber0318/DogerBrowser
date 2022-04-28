import React, {useEffect} from 'react';
import {ScrollView, Text, StyleSheet, ToastAndroid} from 'react-native';
import {useTranslation} from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import PageView from '@/components/PageView';
// import {FieldText} from '@/components/Field';
import {createAlert} from '@/components/Modal';
import {FieldIcon} from '@/components/Field';
import {createActionSheet} from '@/components/Modal';
import {DownloadFile, UpdateSniffResources} from '@/components/WebView';
import {useUIState, useUIDispatch} from '@/stores';
import {ThemeFunctionComponent, withTheme} from '@/theme';

interface SniffResourcesProps {
  downloadFile: DownloadFile;
  updateSniffResources: UpdateSniffResources;
}

const SniffResources: ThemeFunctionComponent<SniffResourcesProps> = props => {
  const {downloadFile, updateSniffResources, theme} = props;
  const {pagesVisible, resources} = useUIState();
  const {sniffResourcesVisible} = pagesVisible;

  useEffect(() => {
    if (sniffResourcesVisible) {
      updateSniffResources();
    }
  }, [sniffResourcesVisible, updateSniffResources]);

  const {t} = useTranslation();

  const {updatePagesVisible} = useUIDispatch();

  const onBack = () => {
    updatePagesVisible({sniffResourcesVisible: false});
  };

  const getFileName = (s: string) => {
    if (!s) {
      return '';
    }
    let url = s.split('?')[0];
    if (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
    const file = url.split('/');
    const name = file[file.length - 1];
    return name;
  };

  const renderItemComponent = (item: string, index: number) => {
    return (
      <FieldIcon
        key={index}
        label={t('File name:') + (getFileName(item) || t('Unknow'))}
        subLabel={item}
        type="ellipsis1"
        onPress={() => {
          const actionSheet = createActionSheet({
            title: getFileName(item) || t('Unknow'),
            options: [
              {
                name: t('View link'),
                value: 'view',
                onPress: () => {
                  actionSheet.close();
                  createAlert({
                    title: t('Link'),
                    content: item,
                  });
                },
              },
              {
                name: t('Copy {{text}}', {text: t('Link')}),
                value: 'copy',
                onPress: () => {
                  actionSheet.close();
                  Clipboard.setString(item);
                  ToastAndroid.show(
                    t('{{text}} copied to clipboard', {text: t('Link')}),
                    1000,
                  );
                },
              },
              {
                name: t('Download'),
                value: 'download',
                onPress: () => {
                  actionSheet.close();
                  downloadFile(item, getFileName(item));
                },
              },
            ],
          });
        }}
      />
    );
  };

  const renderEmptyComponent = () => {
    return (
      <Text style={[styles.listEmpty, {color: theme?.colors.descript}]}>
        {t('The current page does not get the resource.')}
      </Text>
    );
  };

  return (
    <PageView
      name={t('Sniff resources')}
      isVisible={sniffResourcesVisible}
      onBack={onBack}>
      <ScrollView>
        {resources.length === 0
          ? renderEmptyComponent()
          : resources.map((item, index) => {
              return renderItemComponent(item, index);
            })}
      </ScrollView>
    </PageView>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  itemButton: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  itemFileName: {
    flex: 1,
  },
  itemLinkText: {
    alignSelf: 'flex-start',
  },
  listEmpty: {
    marginVertical: 50,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default withTheme<SniffResourcesProps>(SniffResources, 'SniffResources');
