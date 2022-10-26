import 'dotenv/config';
import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/mysql';
import UserStatusSeed from './Required/User/user.status.seed';
import DealStatusSeed from './Required/Deal/deal.status.seed';
import AdminDemoSeed from './Demo/User/admin.demo.seed';
import UserDemoSeed from './Demo/User/user.demo.seed';
import DealDemoSeed from './Demo/Deal/deal.demo.seed';

// eslint-disable-next-line import/prefer-default-export
export class DatabaseSeeder extends Seeder {
  public async run(em: EntityManager): Promise<void> {
    return this.call(em, [
      UserStatusSeed,
      DealStatusSeed,
      AdminDemoSeed,
      UserDemoSeed,
      DealDemoSeed,
    ]);
  }
}
