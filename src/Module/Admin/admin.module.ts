import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import UserRepository from '../../Repository/User/user.repository';
import AdminUserController from '../../Controller/Admin/admin.user.controller';
import AdminHandler from '../../Service/Handler/Admin/admin.handler';
import PasswordValidationConstraint from '../../Validator/Constraints/password.validation.constraint';
import AdminDealController from '../../Controller/Admin/admin.deal.controller';
import DealRepository from '../../Repository/Deal/deal.repository';
import ApproveUserMailSender from '../../Mailer/Methods/approve.user.mail.sender';
import EntityHasStatusValidationConstraint from '../../Validator/Constraints/entity.has.status.validation.constraint';

@Module({
  imports: [MikroOrmModule.forRoot()],
  controllers: [AdminUserController, AdminDealController],
  providers: [
    UserRepository,
    DealRepository,
    PasswordValidationConstraint,
    EntityHasStatusValidationConstraint,
    AdminHandler,
    DealRepository,
    ApproveUserMailSender,
  ],
  exports: [AdminHandler],
})

export default class AdminModule {}
