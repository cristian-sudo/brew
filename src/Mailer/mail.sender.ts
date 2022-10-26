import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import Config from '../Config';

@Injectable()
export default abstract class MailSender {
  constructor(protected mailerService: MailerService) {}

  protected send(to: string, from: string, subject: string, template: string, context: object): void {
    Object.assign(context, { baseUrl: Config.baseUrl });

    this.mailerService.sendMail({
      to, from, subject, template, context,
    });
  }
}
