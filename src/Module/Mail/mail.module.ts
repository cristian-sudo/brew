import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import Config from '../../Config';
import RequestPasswordMailSender from '../../Mailer/Methods/request.password.mail.sender';
import ApproveUserMailSender from '../../Mailer/Methods/approve.user.mail.sender';
import CompletedDealsCsvReportMailSender from '../../Mailer/Methods/completed.deals.csv.report.mail.sender';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: Config.email.host,
          port: Config.email.port,
          secure: false,
        },
        defaults: {
          from: Config.email.admin_email,
        },
        template: {
          dir: `${process.cwd()}/src/Mailer/Templates`,
          adapter: new HandlebarsAdapter(undefined, {
            inlineCssEnabled: true,
            inlineCssOptions: {
              url: ' ',
              preserveMediaQueries: true,
            },
          }),
          options: {
            options: {
              strict: true,
            },
          },
        },
        options: {
          partials: {
            dir: `${process.cwd()}/src/Mailer/Partials`,
            options: {
              strict: true,
            },
          },
        },
      }),
    }),
  ],
  providers: [
    RequestPasswordMailSender,
    ApproveUserMailSender,
    CompletedDealsCsvReportMailSender,
  ],
  exports: [
    RequestPasswordMailSender,
    ApproveUserMailSender,
    CompletedDealsCsvReportMailSender,
  ],
})
export default class MailModule {}
