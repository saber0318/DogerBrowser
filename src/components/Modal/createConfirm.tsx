import React from 'react';
import RootSiblings from 'react-native-root-siblings';
import Confirm, {ConfirmProps} from './Confirm';

type CreateConfirmProps = Omit<ConfirmProps, 'isVisible'>;

const renderConfirm = (props: ConfirmProps) => {
  return <Confirm {...props} />;
};

const createConfirm = (props: CreateConfirmProps) => {
  const {onCancel, onOk, onModalHide} = props;
  const handle = new RootSiblings(
    renderConfirm({
      ...props,
      isVisible: true,
      onCancel: () => {
        if (typeof onCancel === 'function') {
          onCancel();
        }
        handle.update(
          renderConfirm({
            ...props,
            isVisible: false,
            onModalHide: () => {
              if (typeof onModalHide === 'function') {
                onModalHide();
              }
              handle.destroy();
            },
          }),
        );
      },
      onOk: () => {
        if (typeof onOk === 'function') {
          onOk();
        }
        handle.update(
          renderConfirm({
            ...props,
            isVisible: false,
            onModalHide: () => {
              if (typeof onModalHide === 'function') {
                onModalHide();
              }
              handle.destroy();
            },
          }),
        );
      },
    }),
  );
  return handle;
};

export default createConfirm;
