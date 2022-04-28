import Circle from './Circle';
import Bar from './Bar';

export type {ProgressBarState} from './Bar';
export type {ProgressCircleState} from './Circle';

type InternalProgress = typeof Bar;

type RefProgress = InternalProgress & {
  Circle: typeof Circle;
};

const RefProgress = Bar as RefProgress;

RefProgress.Circle = Circle;

export default RefProgress;
