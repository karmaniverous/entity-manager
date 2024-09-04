import { faker } from '@faker-js/faker';
import { normstr } from '@karmaniverous/string-utilities';

import { type EntityItem } from '../src';

interface User extends EntityItem {
  created: number;
  firstName: string;
  lastName: string;
  userId: string;
  firstNameCanonical: string;
  lastNameCanonical: string;
  shardKey?: string;
  entityPK?: string;
  entitySK?: string;
  firstNameSK?: string;
  lastNameSK?: string;
}

export const getUsers = (count = 1, daysFromNow = 0) => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const users: User[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    users.push({
      created: faker.date
        .soon({ days: 1, refDate: now + day * daysFromNow })
        .getTime(),
      firstName,
      firstNameCanonical: normstr(firstName)!,
      lastName,
      lastNameCanonical: normstr(lastName)!,
      userId: faker.string.nanoid(),
    });
  }

  return users;
};
