import React, {Component} from 'react';
import FormContext from './FormContext';
import {InternalFieldProps, FieldEntity} from './interface';

export default class Field
  extends Component<InternalFieldProps>
  implements FieldEntity
{
  static contextType = FormContext;
  static defaultProps = {
    trigger: 'onChangeText',
  };
  constructor(props: InternalFieldProps) {
    super(props);
    this.state = {};
  }

  // didmount中注册这个Item,
  componentDidMount() {
    const {registerField} = this.context;
    registerField(this);
  }

  componentWillUnmount() {
    const {unRegisterField} = this.context;
    unRegisterField(this);
  }

  public update = () => {
    // 强制更新
    this.forceUpdate();
  };

  // 完成双向数据绑定，与FormStore通信，直接从store中读取、存储
  getControlled = () => {
    const {name, trigger} = this.props;
    const {
      getFieldValue,
      setFieldsValue,
      getFieldError,
      setFieldsError,

      _getCallbacks = () => ({}),
    } = this.context;
    const callbacks = _getCallbacks();
    const {onValuesChange} = callbacks;

    return {
      error: getFieldError(name),
      value: getFieldValue(name),
      [trigger]: (value: any) => {
        setFieldsError({[name]: undefined});
        setFieldsValue({[name]: value});
        if (onValuesChange) {
          onValuesChange({[name]: value});
        }
      },
    };
  };

  render() {
    const {getControlled} = this;
    const {children} = this.props;
    const returnChild = React.cloneElement(children, getControlled());
    return returnChild;
  }
}
