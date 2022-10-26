import { EntityManager } from '@mikro-orm/core';
import User from '../../../../src/Entity/User/user.entity';
import Deal from '../../../../src/Entity/Deal/deal.entity';
import DealStatus from '../../../../src/Entity/Deal/status.entity';
import ApiTestCase from '../api.test.case';

const DealApiTestCase = {
  async createApiDealsPerStatus(
    em: EntityManager,
    user: User,
    many: number,
  ): Promise<Deal[]> {
    const deals: Deal[] = [];
    for (let i = 1; i <= DealStatus.ALL.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const statusFound: DealStatus | undefined = await em.getRepository(DealStatus).findOneOrFail(
        { id: i },
      );
      for (let j = 1; j <= many; j++) {
        // eslint-disable-next-line no-await-in-loop
        const deal: Deal = await ApiTestCase.createApiDeal(em, user, statusFound.getName());
        deals.push(deal);
      }
    }
    await em.getRepository(Deal).persistAndFlush(deals);

    return deals;
  },

};

export default DealApiTestCase;
