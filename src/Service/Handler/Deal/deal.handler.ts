import {
  Injectable, NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Loaded } from '@mikro-orm/core';
import DealDto from '../../../Dto/Deal/deal.dto';
import Deal from '../../../Entity/Deal/deal.entity';
import User, { CurrentUserInterface } from '../../../Entity/User/user.entity';
import UserRepository from '../../../Repository/User/user.repository';
import DealStatus from '../../../Entity/Deal/status.entity';

@Injectable()
export default class DealHandler {
  constructor(
    private em: EntityManager,
    private userRepository: UserRepository,
  ) {}

  async createDeal(dto: DealDto, user: CurrentUserInterface) {
    const userFound: Loaded<User> | null = await this.userRepository.getUserById(user.id);

    if (!userFound) {
      throw new NotFoundException();
    }
    const status: Loaded<DealStatus> | null = await this.em.getRepository(DealStatus).findOne(
      { name: DealStatus.DRAFT },
    );

    if (!status) {
      throw new NotFoundException();
    }

    const deal = new Deal(
      dto.name,
      dto.description,
      dto.dealCondition,
      dto.price,
      status,
      userFound,
    );
    await this.em.getRepository(Deal).persistAndFlush(deal);

    return deal;
  }

  async editDeal(dto: DealDto, user: CurrentUserInterface, deal: Deal): Promise<Deal> {
    if (deal.getUser().getId() !== user.id) {
      throw new UnauthorizedException();
    }

    deal.setName(dto.name);
    deal.setDealCondition(dto.dealCondition);
    deal.setDescription(dto.description);
    deal.setPrice(dto.price);
    await this.em.getRepository(Deal).persistAndFlush(deal);

    return deal;
  }

  async deleteDeal(user: CurrentUserInterface, deal: Deal) {
    if (deal.getUser().getId() !== user.id) {
      throw new UnauthorizedException();
    }

    await this.em.getRepository(Deal).removeAndFlush(deal);

    return true;
  }

  async getDealById(user: CurrentUserInterface, id: number) {
    const userFound: User = await this.em.getRepository(User).findOneOrFail({ id: user.id });
    const deal: Deal | null = await this.em.getRepository(Deal).findOne({ user: userFound, id });

    return deal;
  }

  async buyDeal(currentUser: CurrentUserInterface, deal: Deal) {
    const user: Loaded<User> | null = await this.userRepository.getUserById(currentUser.id);

    if (!user) {
      throw new NotFoundException();
    }
    deal.setBuyer(user);

    const finishedDealStatus: DealStatus = await this.em.getRepository(DealStatus).findOneOrFail(
      { name: DealStatus.FINISHED },
    );

    deal.setStatus(finishedDealStatus);

    return this.em.getRepository(Deal).persistAndFlush(deal);
  }
}
