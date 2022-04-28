import React from 'react';
import RootSiblings from 'react-native-root-siblings';
import ActionSheet, {ActionSheetProps} from './ActionSheet';

type CreateActionSheetProps = Omit<ActionSheetProps, 'isVisible'>;

const renderActionSheet = (props: ActionSheetProps) => {
  return <ActionSheet {...props} />;
};

const createActionSheet = (props: CreateActionSheetProps) => {
  const {onCancel, onModalHide} = props;
  const rootSiblings = new RootSiblings(
    renderActionSheet({
      ...props,
      isVisible: true,
      onCancel: () => {
        if (typeof onCancel === 'function') {
          onCancel();
        }
        rootSiblings.update(
          renderActionSheet({
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
        renderActionSheet({
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
  };

  return handle;
};

export default createActionSheet;
