/**
 * base on
 * https://github.com/react-component/field-form
 * https://github.com/ant-design/ant-design/tree/master/components/form
 * https://www.jianshu.com/p/a35185cd5afa
 * https://segmentfault.com/a/1190000021623902
 */

import From from './Form';
import Field from './Field';
import FormItemInput from './FormItemInput';
import FormItemCheckbox from './FormItemCheckbox';
import FormItemRadio from './FormItemRadio';
import {useForm} from './useForm';

type InternalForm = typeof From;

interface RefForm extends InternalForm {
  Field: typeof Field;
  ItemInput: typeof FormItemInput;
  ItemCheckbox: typeof FormItemCheckbox;
  ItemRadio: typeof FormItemRadio;
  useForm: typeof useForm;
}

const RefForm = From as RefForm;

RefForm.Field = Field;
RefForm.ItemInput = FormItemInput;
RefForm.ItemCheckbox = FormItemCheckbox;
RefForm.ItemRadio = FormItemRadio;
RefForm.useForm = useForm;

export {useForm};
export default RefForm;
