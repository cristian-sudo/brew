import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/mysql';
import User from '../../../Entity/User/user.entity';
import UserStatus from '../../../Entity/User/status.entity';

export default class UserDemoSeed extends Seeder {
  public static readonly userCount: number = 10;

  public async run(em:EntityManager): Promise<void> {
    await Promise.all(UserStatus.ALL.map(async (statusName, index) => {
      const status: UserStatus | undefined = await em.getRepository(UserStatus)
        .findOneOrFail({ name: statusName });

      const users: User[] = [];
      for (let i: number = 1; i < UserDemoSeed.userCount; ++i) {
        const uniqueNumber: number = index + i * UserDemoSeed.userCount;
        const user: User = new User(
          `username${uniqueNumber}@example.com`,
          // eslint-disable-next-line no-await-in-loop
          await bcrypt.hash(`password${uniqueNumber}`, 0),
          `First Name ${uniqueNumber}`,
          `Last Name ${uniqueNumber}`,
          status,
        );
        users.push(user);
      }
      await em.persist(users);
      await em.flush();
    }));
  }
}
