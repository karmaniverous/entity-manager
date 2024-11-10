import { faker } from '@faker-js/faker';
import type { Entity } from '@karmaniverous/entity-tools';
import { normstr } from '@karmaniverous/string-utilities';

export interface User extends Entity {
  beneficiaryId: string;
  created: number;
  firstNameCanonical: string;
  lastNameCanonical: string;
  phone?: string;
  updated: number;
  userId: string;
}

export const getUsers = (count = 1, daysFromNow = 0, forDays = 1) => {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const users: User[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const timestamp = faker.date
      .soon({ days: forDays, refDate: now + day * daysFromNow })
      .getTime();

    users.push({
      beneficiaryId: 'abc123',
      created: timestamp,
      firstName,
      firstNameCanonical: normstr(firstName)!,
      lastName,
      lastNameCanonical: normstr(lastName)!,
      phone: faker.phone.number({ style: 'international' }),
      updated: timestamp,
      userId: faker.string.nanoid(),
    });
  }

  return users;
};
