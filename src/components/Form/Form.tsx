import React, {useImperativeHandle, forwardRef} from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {FormInstance, FormProps} from './interface';
import FormContext from './FormContext';
import {useForm} from './useForm';

const Form = forwardRef<{formInstance: FormInstance}, FormProps>(
  (props, ref) => {
    const {
      form,
      style = {},
      children,
      initialValues = {},
      onValuesChange,
    } = props;
    const [formInstance] = useForm(form);
    useImperativeHandle(ref, () => ({
      formInstance,
    }));

    const {t} = useTranslation();

    const {setInitialValues, _setCallbacks} = formInstance;

    if (onValuesChange) {
      _setCallbacks({onValuesChange});
    }

    _setCallbacks({t});

    const mountRef = React.useRef(false);
    setInitialValues(initialValues, !mountRef.current);
    if (!mountRef.current) {
      mountRef.current = true;
    }

    return (
      <FormContext.Provider value={formInstance}>
        <View style={style}>{children}</View>
      </FormContext.Provider>
    );
  },
);

export default Form;
