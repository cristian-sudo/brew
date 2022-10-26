import 'dotenv/config';
import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/mysql';
import UserStatus from '../../../Entity/User/status.entity';

export default class UserStatusSeed extends Seeder {
  // eslint-disable-next-line class-methods-use-this
  public async run(em: EntityManager): Promise<void> {
    await Promise.all(UserStatus.ALL.map(async (statusName) => {
      await em.createQueryBuilder(UserStatus)
        .insert([{ name: statusName }])
        .execute();
    }));
  }
}
