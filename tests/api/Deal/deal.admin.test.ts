import {
  HttpStatus, INestApplication,
} from '@nestjs/common';
import { matchers } from 'jest-json-schema';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import User from '../../../src/Entity/User/user.entity';
import ApiTestCase from '../../Setup/Api/api.test.case';
import AuthModule from '../../../src/Module/Auth/auth.module';
import JsonSchemaLoader from '../../../src/Schema/json-schema-loader';
import AdminModule from '../../../src/Module/Admin/admin.module';
import Deal from '../../../src/Entity/Deal/deal.entity';
import MailModule from '../../../src/Module/Mail/mail.module';
import DealStatus from '../../../src/Entity/Deal/status.entity';
import DealModule from '../../../src/Module/Deal/deal.module';

expect.extend(matchers);

const getDealsRoute: string = '/api/admin/deal';
const editDealRoute: string = '/api/admin/deal/edit';
const deleteDealRoute: string = '/api/admin/deal/delete';
const approveDealRoute: string = '/api/admin/deal/approveDeal';

describe('Admin/Deal controller test', () => {
  let app: INestApplication;
  let orm: MikroORM;
  let em: EntityManager;
  let readDealSchema: object;

  const schemaLoader: JsonSchemaLoader = new JsonSchemaLoader();

  beforeAll(async () => {
    [app, orm] = await ApiTestCase.setUp(app, [AuthModule, AdminModule, MailModule, DealModule]);
    em = orm.em;
    readDealSchema = await schemaLoader.getSchemaByName('Deal', 'read.deal');
  });
  describe('Get Deals By Admin', () => {
    test('it_returns_deals', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      const admin: User = await ApiTestCase.createApiUser(em, [User.ROLE_ADMIN]);
      await ApiTestCase.createApiDeal(em, user);
      const response = await ApiTestCase.jsonGetRequest(app, getDealsRoute, admin);

      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    test('it_returns_deal_with_valid_id', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      const admin: User = await ApiTestCase.createApiUser(em, [User.ROLE_ADMIN]);
      const deal: Deal = await ApiTestCase.createApiDeal(em, user);
      const response = await ApiTestCase.jsonGetRequest(app, `${getDealsRoute}/${deal.getId()}`, admin);

      expect(response.type).toEqual('application/json');
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toMatchSchema(readDealSchema);
    });

    test('it_fails_with_invalid_id', async () => {
      const admin: User = await ApiTestCase.createApiUser(em, [User.ROLE_ADMIN]);
      const response = await ApiTestCase.jsonGetRequest(app, `${getDealsRoute}/-9999`, admin);

      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });
  describe('Edit Deals By Admin', () => {
    test('it_edits_deal_with_valid_data', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      const admin: User = await ApiTestCase.createApiUser(em, [User.ROLE_ADMIN]);
      const deal: Deal = await ApiTestCase.createApiDeal(em, user);

      const response = await ApiTestCase.jsonPutRequest(
        app,
        `${editDealRoute}/${deal.getId()}`,
        {
          name: 'editedName',
          description: 'editedDescription',
          dealCondition: 'editedDealCondition',
          price: 93,
        },
        admin,
      );

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toMatchSchema(readDealSchema);
      expect(response.body.name === deal.getName()).toBeFalsy();
      expect(response.body.description === deal.getDescription()).toBeFalsy();
      expect(response.body.dealCondition === deal.getDealCondition()).toBeFalsy();
      expect(response.body.price === deal.getPrice()).toBeFalsy();
    });
  });
  describe('Delete Deals By Admin', () => {
    test('it_deletes_deal_with_valid_data', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      const admin: User = await ApiTestCase.createApiUser(em, [User.ROLE_ADMIN]);
      const deal: Deal = await ApiTestCase.createApiDeal(em, user);

      const response = await ApiTestCase.jsonPostRequest(
        app,
        `${deleteDealRoute}/${deal.getId()}`,
        {
          name: 'editedName',
          description: 'editedDescription',
          dealCondition: 'editedDealCondition',
          price: 93,
        },
        admin,
      );
      expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    });
  });
  describe('Approve Deals By Admin', () => {
    test('it_approves_deal By Admin', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      const admin: User = await ApiTestCase.createApiUser(em, [User.ROLE_ADMIN]);
      const deal: Deal = await ApiTestCase.createApiDeal(em, user, DealStatus.PENDING);

      const response = await ApiTestCase.jsonPostRequest(
        app,
        `${approveDealRoute}?id=${deal.getId()}`,
        {},
        admin,
      );

      expect(response.statusCode).toBe(HttpStatus.OK);

      /* const newDeal = await em.getRepository(Deal).findOneOrFail({ id: deal.getId() });
      expect(deal.getStatus().getName() === newDeal.getStatus().getName()).toBeFalsy();
      expect(deal.getUpdate() === newDeal.getUpdate()).toBeFalsy(); */
    });

    test('it_fails_approving_deal_with_non_pending_deal_status', async () => {
      const user: User = await ApiTestCase.createApiUser(em);
      const admin: User = await ApiTestCase.createApiUser(em, [User.ROLE_ADMIN]);
      const deal: Deal = await ApiTestCase.createApiDeal(em, user, DealStatus.LIVE);

      const response = await ApiTestCase.jsonPostRequest(
        app,
        `${approveDealRoute}?id=${deal.getId()}`,
        {},
        admin,
      );

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);

      // @ts-ignore
      const newDeal = await em.getRepository(Deal).findOneOrFail({ name: deal.getName() });

      expect(newDeal.getStatus().getName()).toEqual(deal.getStatus().getName());
      expect(newDeal.getUpdate()).toEqual(deal.getUpdate());
    });
  });

  afterEach(async () => {
    await em.getRepository(Deal).nativeDelete({});
    await em.getRepository(User).nativeDelete({});
  });

  afterAll(async () => {
    await orm;
    await app.close();
  });
});
