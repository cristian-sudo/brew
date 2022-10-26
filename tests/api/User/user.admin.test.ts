import { HttpStatus, INestApplication } from '@nestjs/common';
import { matchers } from 'jest-json-schema';
import { parse } from 'csv-parse/lib/sync';
import { Filesystem, LocalFilesystemAdapter } from '@filesystem/core';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import User from '../../../src/Entity/User/user.entity';
import Status from '../../../src/Entity/User/status.entity';
import ApiTestCase from '../../Setup/Api/api.test.case';
import AuthModule from '../../../src/Module/Auth/auth.module';
import JsonSchemaLoader from '../../../src/Schema/json-schema-loader';
import AdminModule from '../../../src/Module/Admin/admin.module';
import MailModule from '../../../src/Module/Mail/mail.module';
import Deal from '../../../src/Entity/Deal/deal.entity';
import { DealTypeCsv } from '../../../src/Type/Deal/deal.type.csv';
import CsvFile from '../../../src/Entity/CSV/csv.file.entity';

expect.extend(matchers);

describe('Admin/User', () => {
  let app: INestApplication;
  let validationSchema: object;
  const generateCSVRoute = '/api/admin/deal/csv';
  const schemaLoader: JsonSchemaLoader = new JsonSchemaLoader();
  const adapter = new LocalFilesystemAdapter('.');
  const filesystem = new Filesystem(adapter);
  const dealsCount: number = 2;
  let orm: MikroORM;
  let em: EntityManager;

  beforeAll(async () => {
    [app, orm] = await ApiTestCase.setUp(app, [AuthModule, AdminModule, MailModule]);
    em = orm.em;
    validationSchema = await schemaLoader.getSchemaByName('Validation', 'validation.error');
    await em.getRepository(CsvFile).nativeDelete({});
    await em.getRepository(User).nativeDelete({});
    await filesystem.deleteDirectory('uploads/test');
  });
  const dataSet = [
    { from: Status.PENDING, to: Status.PENDING, isSuccess: false },
    { from: Status.APPROVED, to: Status.PENDING, isSuccess: false },
    { from: Status.PENDING, to: 'unknown', isSuccess: false },
    { from: Status.PENDING, to: Status.APPROVED, isSuccess: true },
  ];
  test.each(dataSet)(
    'returns true of false if the transition is possible.',
    async ({ from, to, isSuccess }) => {
      const status = await em.getRepository(Status).findOneOrFail({ name: from });

      const user = await ApiTestCase.createApiUser(em, [User.ROLE_USER], status.getName());

      const admin = await ApiTestCase.createApiUser(em, [User.ROLE_ADMIN]);
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `/api/admin/user/changeStatus/${to}/${user.getId().toString()}`,
        admin,
      );
      expect(response.type).toEqual('application/json');

      if (isSuccess) {
        expect(response.statusCode).toBe(HttpStatus.OK);
      } else {
        expect(response.body).toMatchSchema(validationSchema);
        expect(response.body.violations).toContainEqual(
          {
            detail: 'Invalid transition',
            title: 'status',
            violations: ['status has an invalid value or the transaction is invalid'],
          },
        );
        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      }
    },
  );

  describe('Generate CSV', () => {
    test('it_generates_csv_with_no_parameters', async () => {
      const admin = await ApiTestCase.createApiUser(em, [User.ROLE_ADMIN]);
      const owner = await ApiTestCase.createApiUser(em);
      const buyer = await ApiTestCase.createApiUser(em);
      await ApiTestCase.createApiDealsPerStatus(em, dealsCount, owner, buyer);
      const response = await ApiTestCase.jsonGetRequest(app, generateCSVRoute, admin);

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(await filesystem.fileExists(response.body[0])).toBe(true);

      const fileContent = await filesystem.read(response.body[0]);
      const records = parse(fileContent, { columns: true, cast: true });

      response.body.shift();

      expect(records).toEqual(response.body);
    });

    test('it_generates_csv_with_valid_user_parameter', async () => {
      const admin = await ApiTestCase.createApiUser(em, [User.ROLE_ADMIN]);
      const owner = await ApiTestCase.createApiUser(em);
      const buyer = await ApiTestCase.createApiUser(em);
      const deals: Deal[] = await ApiTestCase.createApiDealsPerStatus(em, dealsCount, owner, buyer);
      const userId = deals[0].getUser().getId();

      const response = await ApiTestCase.jsonGetRequest(app, `${generateCSVRoute}?user=${userId}`, admin);

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(await filesystem.fileExists(response.body[0])).toBe(true);

      const fileContent = await filesystem.read(response.body[0]);
      const records = parse(fileContent, { columns: true, cast: true });

      response.body.shift();

      expect(records).toEqual(response.body);
    });

    test('it_generate_empty_file_with_invalid_user_parameter', async () => {
      const admin = await ApiTestCase.createApiUser(em, [User.ROLE_ADMIN]);
      const owner = await ApiTestCase.createApiUser(em);
      const buyer = await ApiTestCase.createApiUser(em);
      await ApiTestCase.createApiDealsPerStatus(em, dealsCount, owner, buyer);

      const response = await ApiTestCase.jsonGetRequest(app, `${generateCSVRoute}?user=-8989`, admin);

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(await filesystem.fileExists(response.body[0])).toBe(true);

      const fileContent = await filesystem.read(response.body[0]);
      const records = parse(fileContent, { columns: true, cast: true });

      response.body.shift();

      expect(records).toEqual(response.body);
    });

    test('it_generate_csv_file_with_from_parameter', async () => {
      const admin = await ApiTestCase.createApiUser(em, [User.ROLE_ADMIN]);
      const owner = await ApiTestCase.createApiUser(em);
      const buyer = await ApiTestCase.createApiUser(em);
      const deals: Deal[] = await ApiTestCase.createApiDealsPerStatus(em, dealsCount, owner, buyer);

      const from: string = deals[0].getUpdate().toISOString();

      const response = await ApiTestCase.jsonGetRequest(app, `${generateCSVRoute}?from=${from}`, admin);

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(await filesystem.fileExists(response.body[0])).toBe(true);

      const fileContent = await filesystem.read(response.body[0]);
      const records = parse(fileContent, { columns: true, cast: true });

      records.forEach((deal:DealTypeCsv) => {
        expect(new Date(deal['Bought At']) >= new Date(from)).toBe(true);
      });
    });

    test('it_generate_csv_file_with_to_parameter', async () => {
      const admin = await ApiTestCase.createApiUser(em, [User.ROLE_ADMIN]);
      const owner = await ApiTestCase.createApiUser(em);
      const buyer = await ApiTestCase.createApiUser(em);
      const deals: Deal[] = await ApiTestCase.createApiDealsPerStatus(em, dealsCount, owner, buyer);

      const to: string = deals[deals.length - 1].getUpdate().toISOString();

      const response = await ApiTestCase.jsonGetRequest(app, `${generateCSVRoute}?to=${to}`, admin);

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(await filesystem.fileExists(response.body[0])).toBe(true);

      const fileContent = await filesystem.read(response.body[0]);
      const records = parse(fileContent, { columns: true, cast: true });

      records.forEach((deal: DealTypeCsv) => {
        expect(new Date(deal['Bought At']) <= new Date(to)).toBe(true);
      });
    });

    test('it_generate_csv_file_with_from_and_to_parameter', async () => {
      const admin = await ApiTestCase.createApiUser(em, [User.ROLE_ADMIN]);
      const owner = await ApiTestCase.createApiUser(em);
      const buyer = await ApiTestCase.createApiUser(em);
      const deals: Deal[] = await ApiTestCase.createApiDealsPerStatus(em, dealsCount, owner, buyer);

      const from: string = deals[0].getUpdate().toISOString();
      const to: string = deals[deals.length - 1].getUpdate().toISOString();

      const response = await ApiTestCase.jsonGetRequest(app, `${generateCSVRoute}?from=${from}&to=${to}`, admin);

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(await filesystem.fileExists(response.body[0])).toBe(true);

      const fileContent = await filesystem.read(response.body[0]);
      const records = parse(fileContent, { columns: true, cast: true });

      records.forEach((deal: DealTypeCsv) => {
        expect(new Date(deal['Bought At']) <= new Date(to)).toBe(true);
        expect(new Date(deal['Bought At']) >= new Date(from)).toBe(true);
      });
    });
  });

  afterEach(async () => {
    await em.getRepository(Deal).nativeDelete({});
    await em.getRepository(CsvFile).nativeDelete({});
    await em.getRepository(User).nativeDelete({});
  });

  afterAll(async () => {
    await filesystem.deleteDirectory('uploads/test');
    await orm.close();
    await app.close();
  });
});
