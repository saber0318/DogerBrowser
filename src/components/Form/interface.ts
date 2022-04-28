import {ViewStyle} from 'react-native';
import {TFunction} from 'react-i18next';

export type StoreValue = any;
export type Store = Record<string, StoreValue>;
export type FieldError = {
  [propName: string]: string[] | undefined;
};
export interface FormProps {
  initialValues?: Store;
  style?: ViewStyle;
  form: FormInstance;
  children: React.ReactNode;
  onValuesChange?: (changedValues: any) => void;
}
export interface FormInstance<Values = any> {
  getFieldValue: (name: string) => StoreValue;
  getFieldError: (name: string) => string[] | undefined;
  setInitialValues: (values: Store, init: boolean) => void;
  setFieldsValue: (values: Values) => void;
  setFieldsError: (values: Values) => void;
  registerField: (form: FieldEntity) => void;
  unRegisterField: (form: FieldEntity) => void;
  validator: () => Promise<Values | FieldError[]>;
  resetField: () => void;

  // 内部方法
  _setCallbacks: (callbacks: Callbacks) => void;
  _getCallbacks: () => Callbacks;
}
export interface Callbacks<Values = any> {
  onValuesChange?: (changedValues: any) => void;
  t?: TFunction;
}
export interface InternalHooks {
  _setCallbacks: (callbacks: Callbacks) => void;
}
export interface InternalFieldProps<Values = any> {
  label: string;
  name: string;
  rules?: Rule[];
  trigger: string;
  desc?: string; // 描述说明
  children: React.ReactElement;
  [propName: string]: any;
}
// export type RuleType =
//   | 'string'
//   | 'number'
//   | 'boolean'
//   | 'method'
//   | 'regexp'
//   | 'integer'
//   | 'float'
//   | 'object'
//   | 'enum'
//   | 'date'
//   | 'url'
//   | 'hex'
//   | 'email';
export type RuleType = 'url' | 'regexp';
export interface ValidatorRule {
  message?: string;
  validator: Validator;
}

type Validator = (
  rule: RuleObject,
  value: StoreValue,
  callback: (error?: string) => void,
) => Promise<void | any> | void;

interface BaseRule {
  required?: boolean;
  len?: number;
  max?: number;
  min?: number;
  message?: string;
  type?: RuleType;
  pattern?: RegExp;

  /** Customize rule level `validateTrigger`. Must be subset of Field `validateTrigger` */
  validateTrigger?: string | string[];
}

type AggregationRule = BaseRule & Partial<ValidatorRule>;

interface ArrayRule extends Omit<AggregationRule, 'type'> {
  type: 'array';
  defaultField?: RuleObject;
}

export type RuleObject = AggregationRule | ArrayRule;
export type Rule = RuleObject;
export interface FieldEntity {
  update: () => void;
  props: {
    label: string;
    name: string;
    rules?: Rule[];
    initialValue?: any;
  };
}
