import { INestApplication, InternalServerErrorException } from '@nestjs/common';
import { Filesystem, LocalFilesystemAdapter } from '@filesystem/core';
import { CommandModule, CommandModuleTest } from 'nestjs-command';
import { parse } from 'csv-parse/lib/sync';
import { MailerService } from '@nestjs-modules/mailer';
import { TestingModule } from '@nestjs/testing';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import ApiTestCase from '../Setup/Api/api.test.case';
import MailModule from '../../src/Module/Mail/mail.module';
import AdminModule from '../../src/Module/Admin/admin.module';
import DealModule from '../../src/Module/Deal/deal.module';
import Deal from '../../src/Entity/Deal/deal.entity';
import CsvFile from '../../src/Entity/CSV/csv.file.entity';
import TestMailer from '../Setup/Api/test-mailer';
import { DealTypeCsv } from '../../src/Type/Deal/deal.type.csv';
import AppModule from '../../src/app.module';
import User from '../../src/Entity/User/user.entity';

describe('Admin/CSV', () => {
  let app: INestApplication;
  let module: TestingModule;
  let commandModule : CommandModuleTest;
  let em: EntityManager;
  let orm: MikroORM;
  let testMailer: TestMailer;

  const adapter = new LocalFilesystemAdapter('.');
  const filesystem = new Filesystem(adapter);

  const dealsCount: number = 10;
  let deals: Deal[];
  let from: string;
  let to: string;

  beforeAll(async () => {
    [app, orm, module] = await ApiTestCase.setUp(
      app,
      [DealModule, AdminModule, MailModule, CommandModule, AppModule],
    );
    em = orm.em;
    commandModule = new CommandModuleTest(app.select(CommandModule));
    testMailer = module.get(MailerService);
    await em.getRepository(Deal).nativeDelete({});
    await em.getRepository(User).nativeDelete({});
    await em.getRepository(CsvFile).nativeDelete({});
    await testMailer.clean();
    const owner = await ApiTestCase.createApiUser(em);
    const buyer = await ApiTestCase.createApiUser(em);
    deals = await ApiTestCase.createApiDealsPerStatus(em, dealsCount, owner, buyer);
    from = deals[0].getUpdate().toISOString();
    to = deals[deals.length - 1].getUpdate().toISOString();
    await filesystem.deleteDirectory('uploads/test');
  });

  describe('Generate CSV', () => {
    test('it_generates_csv_with_no_parameters', async () => {
      await commandModule.execute('app:generate:csv', {});
      // @ts-ignore
      const csv: CsvFile[] = await em.getRepository(CsvFile).find({}, { orderBy: { id: 'DESC' } });
      expect(await filesystem.fileExists(csv[0].getPath())).toBe(true);
      expect(testMailer.messages.length === 1).toBe(true);

      if (!testMailer.messages[0].context) {
        throw new InternalServerErrorException();
      }
      expect(csv[0].getId() === testMailer.messages[0].context.id).toBe(true);
    });
    test('it_generates_csv_with_valid_user_parameter', async () => {
      const userId = deals[0].getUser().getId();
      await commandModule.execute('app:generate:csv', { userId });

      // @ts-ignore
      const csv: CsvFile[] = await em.getRepository(CsvFile).find({}, { orderBy: { id: 'DESC' } });
      const fileContent = await filesystem.read(csv[0].getPath());
      const records = parse(fileContent, { columns: true, cast: true });

      records.forEach((record:DealTypeCsv) => {
        expect(record['Owner ID'] === userId).toBe(true);
      });
    });
    test('it_generate_empty_file_with_invalid_user_parameter', async () => {
      await commandModule.execute('app:generate:csv', { userId: -343434 });

      // @ts-ignore
      const csv: CsvFile[] = await em.getRepository(CsvFile).find({}, { orderBy: { id: 'DESC' } });
      const fileContent = await filesystem.read(csv[0].getPath());
      const records: [] = parse(fileContent, { columns: true, cast: true });

      expect(records.length === 0).toBe(true);
    });
    test('it_generate_csv_file_with_from_parameter', async () => {
      await commandModule.execute('app:generate:csv', { start: from });

      // @ts-ignore
      const csv: CsvFile[] = await em.getRepository(CsvFile).find({}, { orderBy: { id: 'DESC' } });
      const fileContent = await filesystem.read(csv[0].getPath());
      const records = parse(fileContent, { columns: true, cast: true });

      records.forEach((record:DealTypeCsv) => {
        expect(new Date(record['Bought At']) >= new Date(from)).toBe(true);
      });
    });
    test('it_generate_csv_file_with_to_parameter', async () => {
      await commandModule.execute('app:generate:csv', { end: to });

      // @ts-ignore
      const csv: CsvFile[] = await em.getRepository(CsvFile).find({}, { orderBy: { id: 'DESC' } });
      const fileContent = await filesystem.read(csv[0].getPath());
      const records = parse(fileContent, { columns: true, cast: true });
      records.forEach((record:DealTypeCsv) => {
        expect(new Date(record['Bought At']) <= new Date(to)).toBe(true);
      });
    });
    test('it_generate_csv_file_with_from_and_to_parameter', async () => {
      await commandModule.execute('app:generate:csv', { start: from, end: to });

      // @ts-ignore
      const csv: CsvFile[] = await em.getRepository(CsvFile).find({}, { orderBy: { id: 'DESC' } });
      const fileContent = await filesystem.read(csv[0].getPath());
      const records = parse(fileContent, { columns: true, cast: true });
      records.forEach((record:DealTypeCsv) => {
        expect(new Date(record['Bought At']) >= new Date(from)).toBe(true);
        expect(new Date(record['Bought At']) <= new Date(to)).toBe(true);
      });
    });
  });

  afterEach(async () => {
    await testMailer.clean();
  });

  afterAll(async () => {
    await em.getRepository(Deal).nativeDelete({});
    await em.getRepository(User).nativeDelete({});
    await em.getRepository(CsvFile).nativeDelete({});
    await filesystem.deleteDirectory('uploads/test');
    await testMailer.clean();
    await orm.close();
    await app.close();
  });
});
