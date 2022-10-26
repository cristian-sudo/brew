import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import UserModule from './Module/User/user.module';
import AuthModule from './Module/Auth/auth.module';
import AdminModule from './Module/Admin/admin.module';
import MailModule from './Module/Mail/mail.module';
import DealModule from './Module/Deal/deal.module';
import AppInstallCommand from './Command/app-Install.command';
import ClearPasswordResetCommand from './Command/clear-password-reset.command';
import CompletedDealsCsvReportMailSender from './Mailer/Methods/completed.deals.csv.report.mail.sender';
import GenerateAndSendCompletedDealsCsvReportCommand from './Command/generate-and-send-deals-report-csv.command';

@Module({
  imports: [
    MikroOrmModule.forRoot(),
    CommandModule,
    AuthModule,
    AdminModule,
    MailModule,
    UserModule,
    DealModule,
  ],
  controllers: [],
  providers: [
    AppInstallCommand,
    ClearPasswordResetCommand,
    GenerateAndSendCompletedDealsCsvReportCommand,
    CompletedDealsCsvReportMailSender,
  ],
  exports: [],
})
export default class AppModule {}
