import React from 'react';
import RootSiblings from 'react-native-root-siblings';
import Alert, {AlertProps} from './Alert';

type CreateAlertProps = Omit<AlertProps, 'isVisible'>;

const renderAlert = (props: AlertProps) => {
  return <Alert {...props} />;
};

const createAlert = (props: CreateAlertProps) => {
  const {onOk, onModalHide} = props;
  const rootSiblings = new RootSiblings(
    renderAlert({
      ...props,
      isVisible: true,
      onOk: () => {
        if (typeof onOk === 'function') {
          onOk();
        }
        rootSiblings.update(
          renderAlert({
            ...props,
            isVisible: false,
            onModalHide: () => {
              if (typeof onModalHide === 'function') {
                onModalHide();
              }
              rootSiblings.destroy();
            },
          }),
        );
      },
    }),
  );

  const handle = {
    ...rootSiblings,
    close: () => {
      rootSiblings.update(
        renderAlert({
          ...props,
          isVisible: false,
          onModalHide: () => {
            if (typeof onModalHide === 'function') {
              onModalHide();
            }
            rootSiblings.destroy();
          },
        }),
      );
    },
    update: (alertProps: CreateAlertProps) => {
      rootSiblings.update(
        renderAlert({
          ...alertProps,
          isVisible: true,
          onModalHide: () => {
            if (typeof alertProps.onModalHide === 'function') {
              alertProps.onModalHide();
            }
            rootSiblings.destroy();
          },
        }),
      );
    },
  };

  return handle;
};

export default createAlert;
