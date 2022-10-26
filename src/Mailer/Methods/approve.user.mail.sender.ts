import MailSender from '../mail.sender';
import User from '../../Entity/User/user.entity';
import Config from '../../Config';

export default class ApproveUserMailSender extends MailSender {
  public approveUserMailSender(user: User): void {
    this.send(
      user.getEmail(),
      Config.email.admin_email,
      '[Intercambio] Account Approved!',
      'approved.user.hbs',
      { name: user.getFirstName() },
    );
  }
}
