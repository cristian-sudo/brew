import 'dotenv/config';
import { EntityManager } from '@mikro-orm/mysql';
import { Seeder } from '@mikro-orm/seeder';
import Deal from '../../../Entity/Deal/deal.entity';
import User from '../../../Entity/User/user.entity';
import DealStatus from '../../../Entity/Deal/status.entity';
import UserDemoSeed from '../User/user.demo.seed';

export default class DealDemoSeed extends Seeder {
  public static readonly dealCountPerStatus: number = 4;

  public async run(em: EntityManager): Promise<void> {
    await Promise.all(DealStatus.ALL.map(async (statusName, index) => {
      const status: DealStatus = await em.getRepository(DealStatus).findOneOrFail({ name: statusName });

      const deals: Deal[] = [];
      for (let i: number = 1; i < DealDemoSeed.dealCountPerStatus; ++i) {
        // eslint-disable-next-line no-await-in-loop
        const user:User | undefined = await em.getRepository(User).findOneOrFail({ id: i });
        const uniqueNumber: number = index + i * UserDemoSeed.userCount;
        const deal:Deal = new Deal(
          `Deal-${uniqueNumber}`,
          `Description for deal-${uniqueNumber}`,
          `Condition for deal-${uniqueNumber}`,
          uniqueNumber,
          status,
          user,
        );
        deals.push(deal);
      }
      await em.persist(deals);
      await em.flush();
    }));
  }
}
