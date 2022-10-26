import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';

export default class TestMailer extends MailerService {
  messages: ISendMailOptions[] = [];

  async sendMail(sendMailOptions: ISendMailOptions): Promise<any> {
    this.messages.push(sendMailOptions);
  }

  async clean() {
    this.messages = [];
  }
}
