import React from 'react';
import {FormInstance} from './interface';

const FormContext = React.createContext<FormInstance>({
  getFieldValue: () => {},
  getFieldError: () => undefined,
  setFieldsValue: () => {},
  setFieldsError: () => {},
  setInitialValues: () => {},
  registerField: () => {},
  unRegisterField: () => {},
  validator: () => Promise.resolve(),
  resetField: () => {},
  _setCallbacks: () => {},
  _getCallbacks: () => ({}),
});

export default FormContext;
