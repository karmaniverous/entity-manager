import { TypeMap } from '@karmaniverous/entity-tools';

export const string2Stringifiable = <IndexableTypes extends TypeMap>(
  type: keyof IndexableTypes,
  value?: string,
): IndexableTypes[keyof IndexableTypes] | undefined => {
  if (!value) return;

  switch (type) {
    case 'string':
      return value as IndexableTypes[keyof IndexableTypes];
    case 'number':
      return Number(value) as IndexableTypes[keyof IndexableTypes];
    case 'boolean':
      return (value === 'true') as IndexableTypes[keyof IndexableTypes];
    case 'bigint':
      return BigInt(value) as IndexableTypes[keyof IndexableTypes];
    default:
      throw new Error(
        `unsupported indexable type '${(type as string | undefined) ?? ''}'`,
      );
  }
};
