import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Loaded } from '@mikro-orm/core';
import Deal from '../../Entity/Deal/deal.entity';

@Injectable()
export default class DealRepository {
  constructor(private em: EntityManager) {}

  async findAll(): Promise<Deal[]> {
    return this.em.getRepository(Deal).find({});
  }

  async findOneById(id: number): Promise<Loaded<Deal> | null> {
    // @ts-ignore
    return this.em.getRepository(Deal).findOne({ id });
  }

  async deleteOneById(id:number) {
    // @ts-ignore
    const deal: Loaded<Deal> | null = await this.em.getRepository(Deal).findOne({ id });

    if (!deal) {
      throw new NotFoundException();
    }

    return this.em.getRepository(Deal).removeAndFlush(deal);
  }
}
