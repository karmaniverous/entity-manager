import { range } from 'radash';

export const dehydratedPattern = (n: number) =>
  new RegExp([...range<string>(n - 1)].fill('[^|]*').join('\\|'));
