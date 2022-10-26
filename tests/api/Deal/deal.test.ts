import {
  HttpStatus, INestApplication,
} from '@nestjs/common';
import { matchers } from 'jest-json-schema';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import AdminModule from '../../../src/Module/Admin/admin.module';
import User from '../../../src/Entity/User/user.entity';
import ApiTestCase from '../../Setup/Api/api.test.case';
import AuthModule from '../../../src/Module/Auth/auth.module';
import JsonSchemaLoader from '../../../src/Schema/json-schema-loader';
import Deal from '../../../src/Entity/Deal/deal.entity';
import DealModule from '../../../src/Module/Deal/deal.module';
import MailModule from '../../../src/Module/Mail/mail.module';
import Status from '../../../src/Entity/User/status.entity';
import DealStatus from '../../../src/Entity/Deal/status.entity';
import { DealType } from '../../../src/Type/Deal/deal.type';
import DealApiTestCase from '../../Setup/Api/Deal/deal.api.test.case';

expect.extend(matchers);

const getDealsRoute: string = '/api/deal';
const createDealRoute: string = '/api/deal/create';
const editDealRoute: string = '/api/deal/edit';
const deleteDealRoute: string = '/api/deal/delete';
const buyDealRoute: string = '/api/deal/buy';
const manyDealsPerStatus: number = 2;
const dealsLimit: number = 3;

describe('Deal', () => {
  let app: INestApplication;
  let orm: MikroORM;
  let em: EntityManager;
  const schemaLoader: JsonSchemaLoader = new JsonSchemaLoader();
  let readDealSchema: object;
  let validationSchema: object;

  beforeAll(async () => {
    [app, orm] = await ApiTestCase.setUp(app, [AuthModule, AdminModule, DealModule, MailModule]);
    em = orm.em;
    readDealSchema = await schemaLoader.getSchemaByName('Deal', 'read.deal');
    validationSchema = await schemaLoader.getSchemaByName('Validation', 'validation.error');
    await em.getRepository(Deal).nativeDelete({});
    await em.getRepository(User).nativeDelete({});
  });
  describe('Get deal', () => {
    test('it_returns_deals', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      await ApiTestCase.createApiDeal(em, user);
      const response = await ApiTestCase.jsonGetRequest(app, getDealsRoute, user);

      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    test('it_returns_deal_with_valid_id', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      const deal:Deal = await ApiTestCase.createApiDeal(em, user);

      const response = await ApiTestCase.jsonGetRequest(app, `${getDealsRoute}/${deal.getId()}`, user);

      expect(response.type).toEqual('application/json');

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toMatchSchema(readDealSchema);
    });

    test('it_fails_with_invalid_id', async () => {
      const user: User = await ApiTestCase.createApiUser(em);

      const response = await ApiTestCase.jsonGetRequest(app, `${getDealsRoute}/-9999`, user);

      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('Create Deal', () => {
    test('it_creates_deal_with_valid_data', async () => {
      const user: User = await ApiTestCase.createApiUser(em);

      const response = await ApiTestCase.jsonPostRequest(
        app,
        createDealRoute,
        {
          name: 'Mercedes',
          description: 'better than BMW',
          dealCondition: 'Perfect',
          price: 900,
        },
        user,
      );

      expect(response.statusCode).toBe(HttpStatus.CREATED);
      expect(response.body).toMatchSchema(readDealSchema);
    });

    test('it_fails_with_no_body', async () => {
      const user: User = await ApiTestCase.createApiUser(em);

      const response = await ApiTestCase.jsonPostRequest(
        app,
        createDealRoute,
        {},
        user,
      );

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchSchema(validationSchema);
    });
  });

  describe('Edit Deal', () => {
    test('it_edits_deal_with_valid_data', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      const deal:Deal = await ApiTestCase.createApiDeal(em, user);

      const response = await ApiTestCase.jsonPutRequest(
        app,
        `${editDealRoute}/${deal.getId()}`,
        {
          name: 'editedName',
          description: 'editedDescription',
          dealCondition: 'editedDealCondition',
          price: 93,
        },
        user,
      );

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toMatchSchema(readDealSchema);
      expect(response.body.name === deal.getName()).toBeFalsy();
      expect(response.body.description === deal.getDescription()).toBeFalsy();
      expect(response.body.dealCondition === deal.getDealCondition()).toBeFalsy();
      expect(response.body.price === deal.getPrice()).toBeFalsy();
    });

    test('it_fails_with_no_body', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      const deal:Deal = await ApiTestCase.createApiDeal(em, user);

      const response = await ApiTestCase.jsonPutRequest(
        app,
        `${editDealRoute}/${deal.getId()}`,
        {
        },
        user,
      );

      expect(response.body).toMatchSchema(validationSchema);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchSchema(validationSchema);
    });
  });

  describe('Delete Deal', () => {
    test('it_deletes_deal_with_valid_body', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      const deal:Deal = await ApiTestCase.createApiDeal(em, user);

      const response = await ApiTestCase.jsonPostRequest(
        app,
        `${deleteDealRoute}/${deal.getId()}`,
        {},
        user,
      );

      expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    });
  });

  describe('Buy Deal', () => {
    test('it_buys_deal', async () => {
      const owner: User = await ApiTestCase.createApiUser(em);
      const buyer: User = await ApiTestCase.createApiUser(em);
      const deal: Deal = await ApiTestCase.createApiDeal(em, owner, DealStatus.LIVE);

      const response = await ApiTestCase.jsonGetRequest(app, `${buyDealRoute}?id=${deal.getId()}`, buyer);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    test('it_fails_buying_deal_with_invalid_id', async () => {
      const owner: User = await ApiTestCase.createApiUser(em);
      const buyer: User = await ApiTestCase.createApiUser(em);
      await ApiTestCase.createApiDeal(em, owner, DealStatus.LIVE);

      const response = await ApiTestCase.jsonGetRequest(app, `${buyDealRoute}?id=-999`, buyer);

      expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Filter Deals', () => {
    test('it_filters_deals_by_status', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      await DealApiTestCase.createApiDealsPerStatus(em, user, manyDealsPerStatus);
      const status:string = Status.PENDING;
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getDealsRoute}?filter[status]=${status}`,
        user,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);
      const deals:DealType[] = response.body;
      deals.forEach((deal) => {
        expect(deal.status.name).toBe(status);
      });
    });
    test('it_returns_empty_response_filtering_deals_by_status_with_invalid_status', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      await DealApiTestCase.createApiDealsPerStatus(em, user, manyDealsPerStatus);
      const status:string = 'not a status';
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getDealsRoute}?filter[status]=${status}`,
        user,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toEqual([]);
    });
    test('it_filters_deals_by_name', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      const deals = await DealApiTestCase.createApiDealsPerStatus(em, user, manyDealsPerStatus);

      const name:string = deals[0].getName();
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getDealsRoute}?filter[name]=${name}`,
        user,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);

      const dealsResponse:DealType[] = response.body;
      dealsResponse.forEach((deal) => {
        expect(deal.name).toBe(name);
      });
    });
    test('it_returns_empty_response_filtering_deals_by_name_with_invalid_name', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      await DealApiTestCase.createApiDealsPerStatus(em, user, manyDealsPerStatus);
      const name:string = 'not a valid name';
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getDealsRoute}?filter[name]=${name}`,
        user,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toEqual([]);
    });
    test('it_filters_deals_by_price', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      const deals = await DealApiTestCase.createApiDealsPerStatus(em, user, manyDealsPerStatus);

      const price:string | number = deals[0].getPrice();
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getDealsRoute}?filter[price]=${price}`,
        user,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);
      const dealsResponse:DealType[] = response.body;
      dealsResponse.forEach((deal) => {
        expect(deal.price).toBe(price);
      });
    });
    test('it_returns_empty_response_filtering_deals_by_price_with_invalid_price', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      await DealApiTestCase.createApiDealsPerStatus(em, user, manyDealsPerStatus);
      const price:string | number = -9329;
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getDealsRoute}?filter[price]=${price}`,
        user,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toEqual([]);
    });
    test('it_filters_deals_by_condition', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      const deals = await DealApiTestCase.createApiDealsPerStatus(em, user, manyDealsPerStatus);

      const condition:string = deals[0].getDealCondition();
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getDealsRoute}?filter[dealCondition]=${condition}`,
        user,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);
      const dealsResponse:DealType[] = response.body;
      dealsResponse.forEach((deal) => {
        expect(deal.dealCondition).toBe(condition);
      });
    });
    test('it_returns_empty_response_filtering_deals_by_condition_with_invalid_condition', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      await DealApiTestCase.createApiDealsPerStatus(em, user, manyDealsPerStatus);
      const condition:string = 'not a condition';
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getDealsRoute}?filter[dealCondition]=${condition}`,
        user,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toEqual([]);
    });
  });

  describe('Order Deals Id', () => {
    test('it_orders_deals_by_id_ASC', async () => {
      const user: User = await ApiTestCase.createApiUser(em);

      await DealApiTestCase.createApiDealsPerStatus(em, user, manyDealsPerStatus);

      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getDealsRoute}?sort[id]=ASC`,
        user,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);

      const dealsAfter:DealType[] = response.body;
      const idS: number[] = [];
      dealsAfter.forEach((deal) => {
        idS.push(deal.id);
      });
      const isSorted: boolean = ApiTestCase.sorted(idS, false);
      expect(isSorted).toBe(true);
    });
    test('it_orders_deals_by_id_DESC', async () => {
      const user: User = await ApiTestCase.createApiUser(em);

      await DealApiTestCase.createApiDealsPerStatus(em, user, manyDealsPerStatus);

      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getDealsRoute}?sort[id]=DESC`,
        user,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);

      const dealsAfter:DealType[] = response.body;
      const idS: number[] = [];
      dealsAfter.forEach((deal) => {
        idS.push(deal.id);
      });
      const isSorted: boolean = ApiTestCase.sorted(idS, true);
      expect(isSorted).toBe(true);
    });
  });

  describe('Limit Deals', () => {
    test('it_limit_deal_response', async () => {
      const user: User = await ApiTestCase.createApiUser(em);

      await DealApiTestCase.createApiDealsPerStatus(em, user, manyDealsPerStatus);

      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getDealsRoute}?limit=${dealsLimit}`,
        user,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);
      const dealsAfter:DealType[] = response.body;
      expect(dealsAfter.length).toBe(dealsLimit);
    });
    test('it_limit_deal_response_on_default_limit_when_invalid_limit_value', async () => {
      const user: User = await ApiTestCase.createApiUser(em);

      await DealApiTestCase.createApiDealsPerStatus(em, user, manyDealsPerStatus);

      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getDealsRoute}?limit=sdssfssfsf`,
        user,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);
      const dealsAfter:DealType[] = response.body;
      expect(dealsAfter.length === dealsLimit).toBeFalsy();
    });
  });

  afterEach(async () => {
    await em.getRepository(Deal).nativeDelete({});
    await em.getRepository(User).nativeDelete({});
  });

  afterAll(async () => {
    await orm.close();
    await app.close();
  });
});
