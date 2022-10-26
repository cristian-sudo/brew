import { Injectable } from '@nestjs/common';
import { Command, Option } from 'nestjs-command';
import { EntityManager } from '@mikro-orm/mysql';
import AdminHandler from '../Service/Handler/Admin/admin.handler';
import CompletedDealsCsvReportMailSender from '../Mailer/Methods/completed.deals.csv.report.mail.sender';
import CsvFile from '../Entity/CSV/csv.file.entity';

@Injectable()
export default class GenerateAndSendCompletedDealsCsvReportCommand {
  constructor(
    private em: EntityManager,
    private adminHandler: AdminHandler,
    private mailer: CompletedDealsCsvReportMailSender,
  ) {
  }

  @Command({
    command: 'app:generate:csv',
    describe: 'Generates completed deals report and sends it via email to the admin',
  })
  async create(
  @Option({
    name: 'start',
    describe: 'start date',
    type: 'string',
    alias: 's',
    required: false,
  })
    start: string,

    @Option({
      name: 'end',
      describe: 'end date',
      type: 'string',
      alias: 'e',
      required: false,
    })
    end: string,

    @Option({
      name: 'userId',
      describe: 'id of the user',
      type: 'number',
      alias: 'userId',
      required: false,
    })
    userId: string,

  ) {
    const query: {} = {};

    if (userId) {
      Object.assign(query, { user: userId });
    }

    if (start) {
      Object.assign(query, { from: start });
    }

    if (end) {
      Object.assign(query, { to: end });
    }
    await this.adminHandler.generateCVS(query);

    // @ts-ignore
    const csv: CsvFile[] = await this.em.getRepository(CsvFile).find({}, { orderBy: { id: 'DESC' }, limit: 1 });

    this.mailer.completedDealsCSVReportMailSender(query, csv[0].getId());
  }
}
