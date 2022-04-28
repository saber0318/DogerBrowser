import React, {useState} from 'react';
import {ToastAndroid} from 'react-native';
import RNRestart from 'react-native-restart';
import {useTranslation} from 'react-i18next';
import {Confirm} from '@/components/Modal';
import {resetAppDatabase} from '@/servces';
import {useUIState, useUIDispatch} from '@/stores';

const ResetApp = () => {
  const {t} = useTranslation();

  const [loading, setLoading] = useState<boolean>(false);
  const {pagesVisible} = useUIState();
  const {resetAppVisible} = pagesVisible;

  const {updatePagesVisible} = useUIDispatch();

  const onBack = () => {
    setLoading(false);
    updatePagesVisible({resetAppVisible: false});
  };

  const handleResetAPP = async () => {
    setLoading(true);
    await resetAppDatabase();
    onBack();
    ToastAndroid.show(t('Restarting app!'), 1000);
    RNRestart.Restart();
  };

  return (
    <Confirm
      isVisible={resetAppVisible}
      title={t('Attention')}
      content={t('Are you sure to reset and restart the application?')}
      onCancel={onBack}
      loading={loading}
      onOk={handleResetAPP}
    />
  );
};

export default ResetApp;
