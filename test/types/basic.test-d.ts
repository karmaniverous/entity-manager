import type { BaseConfigMap } from '@karmaniverous/entity-manager';
import { expectType } from 'tsd';

// Basic availability/shape check
type C = BaseConfigMap;
declare const cfg: C;
expectType<C>(cfg);
