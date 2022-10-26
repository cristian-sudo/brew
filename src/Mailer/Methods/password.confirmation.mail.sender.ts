import MailSender from '../mail.sender';
import Config from '../../Config';
import User from '../../Entity/User/user.entity';

export default class PasswordConfirmationMailSender extends MailSender {
  public passwordConfirmationMailSender(user: User): void {
    this.send(
      user.getEmail(),
      Config.email.support_email,
      '[Intercambio] Your Password was reset',
      'password.change.confirmation.hbs',
      { name: user.getFirstName() },
    );
  }
}
