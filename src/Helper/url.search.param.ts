import { Injectable } from '@nestjs/common';
import { toLower } from 'lodash';
import { EntityManager } from '@mikro-orm/mysql';
import { EntityName } from '@mikro-orm/core/typings';
import { CurrentUserInterface } from '../Entity/User/user.entity';

@Injectable()
export default class UrlSearchParam {
  constructor(private em: EntityManager) {}

  static readonly limit = 10;

  async applyFiltersAndSorting(
    query: any,
    entity: EntityName<any>,
    status: EntityName<any>,
    user: CurrentUserInterface | undefined = undefined,
  ): Promise<EntityName<any>[]> {
    const where: {} = await this.filter(query, entity, status, user);
    const sort = await this.sort(query, entity);
    let limit: number = 10;

    if (query.limit) {
      if (parseInt(query.limit, 10)) {
        limit = query.limit;
      }
    }

    return this.em.getRepository(entity).find(
      where,
      { orderBy: sort, limit: limit || UrlSearchParam.limit },
    );
  }

  async sort(
    query: any,
    entity: EntityName<any>,
  ): Promise<{}> {
    const sort: {} = {};

    const proprieties: any = this.em.getMetadata();

    if (query.sort) {
      let sortFilter: any | {};

      if (typeof query.sort === 'string') {
        sortFilter = JSON.parse(query.sort);
      } else {
        sortFilter = query.sort;
      }
      Object.keys(sortFilter).forEach((key) => {
        if (typeof entity !== 'string') {
          // @ts-ignore
          if (proprieties.metadata[entity.name].propertyOrder.has(key)) {
            if (
              toLower(sortFilter[key]) === 'asc'
              || toLower(sortFilter[key]) === 'desc'
            ) {
              Object.assign(sort, { [key]: sortFilter[key] });
            }
          }
        }
      });
    }

    return sort;
  }

  async filter(
    query: any,
    entity: EntityName<any>,
    status: EntityName<any>,
    user: CurrentUserInterface | undefined = undefined,
  ): Promise<{}> {
    const where: {} = {};

    if (user) {
      Object.assign(where, { user });
    }

    if (query.filter) {
      const proprieties: any = this.em.getMetadata();
      let filter: any | {};

      if (typeof query.filter === 'string') {
        filter = JSON.parse(query.filter);
      } else {
        filter = query.filter;
      }
      Object.keys(filter).forEach((key) => {
        if (typeof entity !== 'string') {
          // @ts-ignore
          if (proprieties.metadata[entity.name].propertyOrder.has(key)) {
            Object.assign(where, { [key]: filter[key] });
          }
        }
      });
    }

    return where;
  }
}
