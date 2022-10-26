import MailSender from '../mail.sender';
import Config from '../../Config';

export default class CompletedDealsCsvReportMailSender extends MailSender {
  public completedDealsCSVReportMailSender(query: any, id: number): void {
    this.send(
      Config.email.admin_email,
      Config.email.support_email,
      'Download',
      'completed.deals.csv.report.hbs',
      {
        id,
        name: 'Admin',
        filters: !!query,
        user: query.user ? query.user : undefined,
        start: query.from ? query.from : undefined,
        end: query.to ? query.to : undefined,
        domain: Config.baseUrl,
      },
    );
  }
}
