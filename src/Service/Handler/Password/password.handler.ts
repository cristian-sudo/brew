import * as bcrypt from 'bcrypt';
import {
  BadRequestException, ClassSerializerInterceptor,
  Injectable, UseInterceptors,
} from '@nestjs/common';
import randomBytes = require('random-bytes');
import { EntityManager } from '@mikro-orm/mysql';
import User from '../../../Entity/User/user.entity';
import PasswordReset from '../../../Entity/User/Password/password.reset.entity';
import ResetPasswordFromLinkDto from '../../../Dto/User/Password/reset.password.from.link.dto';
import UserRepository from '../../../Repository/User/user.repository';
import RequestPasswordMailSender from '../../../Mailer/Methods/request.password.mail.sender';
import TokenHandler from '../../../Auth/Jwt/token.handler';
import { Token } from '../../../Type/Jwt/token.type';
import { ResetLink } from '../../../Type/Password/resetLink.type';
import PasswordConfirmationMailSender from '../../../Mailer/Methods/password.confirmation.mail.sender';
import Validator from '../../../Validator/validator';
import SamePreviousPasswordDto from '../../../Dto/User/Password/same.previous.password.dto';

const ONE_DAY_IN_MILLISECONDS: number = 8640000;

@Injectable()
export default class PasswordHandler {
  constructor(
    private requestMailer: RequestPasswordMailSender,
    private resetMailer: PasswordConfirmationMailSender,
    private userRepository: UserRepository,
    private tokenHandler: TokenHandler,
    private validator:Validator,
    private em:EntityManager,
  ) {
  }

  static readonly LENGTH = 30;

  public async requestNewPassword(user: User): Promise<ResetLink> {
    const expiresIn: number = Date.now() + ONE_DAY_IN_MILLISECONDS;
    const randomBytesGenerated: Buffer = await randomBytes(PasswordHandler.LENGTH);
    const [passwordReset] = await this.userRequested(randomBytesGenerated.toString('hex'), expiresIn.toString(), user);

    passwordReset.refreshPasswordRequest(randomBytesGenerated.toString('hex'), expiresIn.toString());

    await this.em.persistAndFlush(passwordReset);

    this.requestMailer.requestPasswordMailSender(user, randomBytesGenerated.toString('hex'));

    return {
      resetLink: randomBytesGenerated.toString('hex'),
    };
  }

  private async userRequested(
    resetLink: string,
    timeStamp: string,
    user: User,
  ): Promise<[PasswordReset]> {
    const userRequested = await this.em.getRepository(PasswordReset).findOne(
      {
        user,
      },
    );

    if (!userRequested) {
      return [
        new PasswordReset(resetLink, timeStamp, user),
      ];
    }

    if (Date.now() <= Number(userRequested.getTimeStamp())) {
      await this.em.getRepository(PasswordReset).remove(userRequested);

      return [
        new PasswordReset(resetLink, timeStamp, user),
      ];
    }

    return [userRequested];
  }

  @UseInterceptors(ClassSerializerInterceptor)
  public async reset(resetLink: string, passwords: ResetPasswordFromLinkDto): Promise<Token> {
    const passwordReset = await this.em.getRepository(PasswordReset)
      .findOne({ resetLink });

    if (!passwordReset) {
      throw new BadRequestException();
    }

    const user: User = await this.em.getRepository(User)
      .findOneOrFail({ id: passwordReset.getUser().getId() });

    const myBodyObject:SamePreviousPasswordDto = new SamePreviousPasswordDto(passwords.password, user.getId());
    await this.validator.validate(myBodyObject);

    const password = await bcrypt.hash(passwords.password, 0);

    user.setPassword(password);
    await this.em.persistAndFlush(user);
    await this.em.getRepository(PasswordReset).remove(passwordReset);

    this.resetMailer.passwordConfirmationMailSender(user);

    return this.tokenHandler.getTokens(user);
  }
}
