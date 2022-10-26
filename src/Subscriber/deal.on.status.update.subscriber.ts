import {
  EventArgs, EventSubscriber, Loaded, Subscriber,
} from '@mikro-orm/core';
import { EntityName } from '@mikro-orm/core/typings';
import Deal from '../Entity/Deal/deal.entity';

@Subscriber()
export default class DealOnStatusUpdateSubscriber implements EventSubscriber<Deal> {
  getSubscribedEntities(): EntityName<Deal>[] {
    return [Deal];
  }

  async beforeUpdate(args: EventArgs<Deal>): Promise<any> {
    const deal: Loaded<Deal> | null = await args.em.getRepository(Deal)
      .findOne({ id: args.entity.getStatus().getId() });

    if (deal) {
      if (deal.getStatus().getId() !== args.entity.getStatus().getId()) {
        args.entity.setUpdate(new Date());
      }
    }
  }
}
