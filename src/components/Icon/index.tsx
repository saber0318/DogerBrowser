import TouchableIcon from './TouchableIcon';
import LoadingIcon from './LoadingIcon';

type InternalIcon = typeof TouchableIcon;

type RefIcon = InternalIcon & {
  Loading: typeof LoadingIcon;
};

const RefIcon = TouchableIcon as RefIcon;

RefIcon.Loading = LoadingIcon;

export default RefIcon;
