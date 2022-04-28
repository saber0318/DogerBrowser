import {useRef} from 'react';
import {validateUrl} from '@/utils';
import {
  Store,
  FormInstance,
  FieldError,
  FieldEntity,
  Callbacks,
} from './interface';
class FormStore {
  private store: Store;
  private formItems: FieldEntity[];
  private error: FieldError | undefined;
  private initialValues: Store = {};
  private callbacks: Callbacks = {};

  constructor() {
    // 所有键值对
    this.store = {};
    // Form中的Item
    this.formItems = [];
    this.error = {};
    this.initialValues = {};
  }
  // 校验方法返回个promise对象
  validator = () => {
    return new Promise((resolve, reject) => {
      // 定义一个数组存错误
      let error: FieldError = {};
      const {t = () => {}} = this.callbacks;

      // 遍历所有的Field组件，获取name和rules
      this.formItems.forEach(item => {
        const {name, label, rules} = item.props;
        const value = this.store[name];
        // 这里意思意思，校验一下
        rules?.forEach(rule => {
          if (rule.required && !(value || value === 0 || value === false)) {
            error[name] = (error[name] || []).concat(
              rule.message || t('{{text}} cannot be empty!', {text: label}),
            );
          }
          if ((rule.len || rule.len === 0) && value.lenth !== rule.len) {
            error[name] = (error[name] || []).concat(
              rule.message ||
                t('The {{text1}} length should be {{text2}}!', {
                  text1: label,
                  text2: rule.len,
                }),
            );
          }
          if ((rule.max || rule.max === 0) && value > rule.max) {
            error[name] = (error[name] || []).concat(
              rule.message ||
                t('The {{text1}} maximum value is {{text2}}!', {
                  text1: label,
                  text2: rule.max,
                }),
            );
          }
          if ((rule.min || rule.min === 0) && value < rule.min) {
            error[name] = (error[name] || []).concat(
              rule.message ||
                t('The {{text1}} minimum value is {{text2}}!', {
                  text1: label,
                  text2: rule.min,
                }),
            );
          }
          if (rule.type === 'url') {
            const r = validateUrl(value);
            if (r.error) {
              error[name] = (error[name] || []).concat(
                rule.message ||
                  t('The {{text}} format is incorrect!', {text: label}),
              );
            }
          }
          if (rule.type === 'regexp') {
            if (!rule.pattern) {
              error[name] = (error[name] || []).concat(
                t('{{text}} cannot be empty!', {text: t('RegExp')}),
              );
            } else if (!rule.pattern.test(value)) {
              error[name] = (error[name] || []).concat(
                rule.message ||
                  t('The {{text}} format is incorrect!', {text: t('RegExp')}),
              );
            }
          }
        });
      });
      // 有错reject错误信息
      if (Object.keys(error).length > 0) {
        this.error = error;
        this.formItems.forEach(item => {
          item.update();
        });
        reject(error);
      } else {
        // 没错resolve数据
        this.error = undefined;
        this.formItems.forEach(item => {
          item.update();
        });
        resolve(this.store);
      }
    });
  };
  // 注册所有的Field组件
  registerField = (item: FieldEntity) => {
    this.formItems.push(item);
  };
  // 有注册有取消，返回一个取消注册方法在组件willunmount中用
  unRegisterField = (item: FieldEntity) => {
    this.formItems = this.formItems.filter(formItem => formItem !== item);
  };
  // 设置字段值，接收一个对象
  setFieldsValue = (newVal: object) => {
    this.store = {
      ...this.store,
      ...newVal,
    };
    // 遍历对象，找出要更新的item组件执行更新
    Object.keys(newVal).forEach(name => {
      this.formItems.forEach(item => {
        // 每个formitem上接收用户传入的name属性，和当前改的name是一个 的话，就调用这个组件更新方法
        if (name === item.props.name) {
          item.update();
        }
      });
    });
  };
  // 设置错误信息，接收一个对象
  setFieldsError = (newVal: object) => {
    this.error = {
      ...this.error,
      ...newVal,
    };
    // 遍历对象，找出要更新的item组件执行更新
    Object.keys(newVal).forEach(name => {
      this.formItems.forEach(item => {
        // 每个formitem上接收用户传入的name属性，和当前改的name是一个 的话，就调用这个组件更新方法
        if (name === item.props.name) {
          item.update();
        }
      });
    });
  };
  setInitialValues = (initialValues: Store, init: boolean) => {
    this.initialValues = initialValues || {};
    if (init) {
      this.store = {...initialValues, ...this.store};
    }
  };
  // 接收一个表单名key值 获取对象值
  getFieldValue = (name: string) => {
    return this.store[name];
  };
  // 获取报错
  getFieldError = (name: string): string[] | undefined => {
    return this.error ? this.error[name] : undefined;
  };
  resetField = () => {
    this.store = {};
    this.error = {};
    this.initialValues = {};
  };
  setCallbacks = (callbacks: Callbacks) => {
    this.callbacks = {...this.callbacks, ...callbacks};
  };
  getCallbacks = () => {
    return this.callbacks;
  };
  getForm = () => {
    return {
      setFieldsValue: this.setFieldsValue,
      setFieldsError: this.setFieldsError,
      setInitialValues: this.setInitialValues,
      getFieldValue: this.getFieldValue,
      getFieldError: this.getFieldError,
      registerField: this.registerField,
      unRegisterField: this.unRegisterField,
      validator: this.validator,
      resetField: this.resetField,
      // 内部方法
      _setCallbacks: this.setCallbacks,
      _getCallbacks: this.getCallbacks,
    };
  };
}

// 函数组件会执行两次useForm,所以要复用form
export function useForm<Values = any>(
  form?: FormInstance<Values>,
): [FormInstance<Values>] {
  const formRef = useRef<FormInstance>();
  if (!formRef.current) {
    if (form) {
      formRef.current = form;
    } else {
      const formStore = new FormStore();
      formRef.current = formStore.getForm();
    }
  }

  return [formRef.current];
}
