import 'dotenv/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import DealController from '../../Controller/Deal/deal.controller';
import TokenHandler from '../../Auth/Jwt/token.handler';
import DealRepository from '../../Repository/Deal/deal.repository';
import DealHandler from '../../Service/Handler/Deal/deal.handler';
import UserRepository from '../../Repository/User/user.repository';
import EntityHasStatusValidationConstraint from '../../Validator/Constraints/entity.has.status.validation.constraint';
import UrlSearchParam from '../../Helper/url.search.param';
import DealOnStatusUpdateSubscriber from '../../Subscriber/deal.on.status.update.subscriber';

@Module({

  imports: [JwtModule.register({})],

  controllers: [DealController],

  providers: [
    DealRepository,
    DealHandler,
    TokenHandler,
    UserRepository,
    EntityHasStatusValidationConstraint,
    UrlSearchParam,
    DealOnStatusUpdateSubscriber,
  ],
  exports: [],
})

export default class DealModule {
}
