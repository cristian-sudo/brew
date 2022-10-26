import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import UserController from '../../Controller/User/user.controller';
import UserRepository from '../../Repository/User/user.repository';
import UserHandler from '../../Service/Handler/User/user.handler';
import TokenHandler from '../../Auth/Jwt/token.handler';
import UniqueFieldConstraint from '../../Validator/Constraints/unique.field.constraint';
import PasswordValidationConstraint from '../../Validator/Constraints/password.validation.constraint';
import UrlSearchParam from '../../Helper/url.search.param';
import RequestPasswordMailSender from '../../Mailer/Methods/request.password.mail.sender';
import PasswordHandler from '../../Service/Handler/Password/password.handler';
import MailModule from '../Mail/mail.module';
import PasswordConfirmationMailSender from '../../Mailer/Methods/password.confirmation.mail.sender';
import ValidateResetLinkConstraint from '../../Validator/Constraints/validate.reset.link.constraint';
import Validator from '../../Validator/validator';
import IsSameAsPreviousPasswordConstraint from '../../Validator/Constraints/is.same.as.previous.password.constraint';

@Module({
  imports: [JwtModule.register({}), MailModule],
  controllers: [UserController],
  providers: [
    UserRepository,
    UserHandler,
    UniqueFieldConstraint,
    PasswordValidationConstraint,
    ValidateResetLinkConstraint,
    TokenHandler,
    UrlSearchParam,
    RequestPasswordMailSender,
    PasswordConfirmationMailSender,
    PasswordHandler,
    Validator,
    IsSameAsPreviousPasswordConstraint,
  ],
  exports: [UserRepository, RequestPasswordMailSender, PasswordConfirmationMailSender],
})

export default class UserModule {
}
