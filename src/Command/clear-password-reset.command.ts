import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import PasswordReset from '../Entity/User/Password/password.reset.entity';

@Injectable()
export default class ClearPasswordResetCommand {
  constructor(private em: EntityManager) {
  }

  @Command({
    command: 'app:password-reset:clear',
    describe: 'Removes all entries in password_reset table which have expired',
  })
  async create() {
    await this.em.createQueryBuilder(PasswordReset)
      .delete()
      .where({ timeStamp: { $lte: Date.now() } });
  }
}
