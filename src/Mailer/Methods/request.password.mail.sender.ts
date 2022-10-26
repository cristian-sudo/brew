import MailSender from '../mail.sender';
import Config from '../../Config';
import User from '../../Entity/User/user.entity';

export default class RequestPasswordMailSender extends MailSender {
  public requestPasswordMailSender(user: User, resetLink: string): void {
    this.send(
      user.getEmail(),
      Config.email.support_email,
      '[Intercambio] Please reset your password',
      'password.change.hbs',
      { name: user.getFirstName(), resetLink },
    );
  }
}
