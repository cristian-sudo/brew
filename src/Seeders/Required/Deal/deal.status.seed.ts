import 'dotenv/config';
import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/mysql';
import DealStatus from '../../../Entity/Deal/status.entity';

export default class DealStatusSeed extends Seeder {
  public async run(em: EntityManager): Promise<void> {
    await Promise.all(DealStatus.ALL.map(async (statusName) => {
      await em.createQueryBuilder(DealStatus)
        .insert([{ name: statusName }])
        .execute();
    }));
  }
}
