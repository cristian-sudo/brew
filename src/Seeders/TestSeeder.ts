import 'dotenv/config';
import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/mysql';
import UserStatusSeed from './Required/User/user.status.seed';
import DealStatusSeed from './Required/Deal/deal.status.seed';
import AdminDemoSeed from './Demo/User/admin.demo.seed';

// eslint-disable-next-line import/prefer-default-export
export class TestSeeder extends Seeder {
  public async run(em: EntityManager): Promise<void> {
    process.env.DB_HOST = 'db_test';

    return this.call(em, [
      DealStatusSeed,
      UserStatusSeed,
      AdminDemoSeed,
    ]);
  }
}
