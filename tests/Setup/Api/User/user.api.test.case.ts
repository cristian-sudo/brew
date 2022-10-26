import { EntityManager } from '@mikro-orm/core';
import User from '../../../../src/Entity/User/user.entity';
import ApiTestCase from '../api.test.case';
import Status from '../../../../src/Entity/User/status.entity';

const UserApiTestCase = {
  async createApiUsersPerStatus(
    em: EntityManager,
    many: number,
  ): Promise<User[]> {
    const evenOdd = 2;
    const users: User[] = [];
    for (let i = 1; i <= Status.ALL.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const statusFound: Status = await em.getRepository(Status).findOneOrFail({ id: i });
      for (let j = 1; j <= many; j++) {
        // eslint-disable-next-line no-await-in-loop
        const user: User = await ApiTestCase.createApiUser(
          em,
          j % evenOdd === 0 ? ['ROLE_USER'] : ['ROLE_ADMIN'],
          statusFound.getName(),
        );
        users.push(user);
      }
    }

    return users;
  },

};

export default UserApiTestCase;
