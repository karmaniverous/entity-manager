import type { Exactify } from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';

export type EntityToken<C extends BaseConfigMap> = keyof Exactify<
  C['EntityMap']
> &
  string;
