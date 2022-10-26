import {
  ConflictException,
  Injectable, InternalServerErrorException, NotFoundException,
} from '@nestjs/common';
import { isDateString, isIn } from 'class-validator';
import { LocalFilesystemAdapter, Filesystem } from '@filesystem/core';
import { stringify } from 'csv-stringify/sync';
import { EntityManager } from '@mikro-orm/mysql';
import User from '../../../Entity/User/user.entity';
import DealStatus from '../../../Entity/Deal/status.entity';
import ValidationException from '../../../Exception/validation.exception';
import config from '../../../Config/index';
import ApproveUserMailSender from '../../../Mailer/Methods/approve.user.mail.sender';
import DealDto from '../../../Dto/Deal/deal.dto';
import Deal from '../../../Entity/Deal/deal.entity';
import CsvFile from '../../../Entity/CSV/csv.file.entity';
import UserStatus from '../../../Entity/User/status.entity';

@Injectable()
export default class AdminHandler {
  constructor(
    private em: EntityManager,
    private mailer: ApproveUserMailSender,
  ) {
  }

  async changeStatus(status: string, id: number): Promise<{}> {
    const user: User | null = await this.em.getRepository(User).findOne({ id });

    if (user!) {
      const AllowedTransitions: [] | undefined = UserStatus.ALLOWED_TRANSITIONS[user.getStatus().getName()];

      if (!AllowedTransitions) {
        throw new ValidationException(
          [{
            title: 'status',
            detail: 'Invalid transition',
            violations: [
              'User declined!',
            ],
          }],
        );
      }

      if (
        user.getStatus().getName() in UserStatus.ALLOWED_TRANSITIONS
        && isIn(status, AllowedTransitions)
      ) {
        const statusFound = await this.em.getRepository(UserStatus).findOne({ name: status });

        if (!statusFound) {
          throw new InternalServerErrorException();
        }

        user.setStatus(statusFound);
        await this.em.getRepository(User).persistAndFlush(user);

        this.mailer.approveUserMailSender(user);

        return {};
      }
    }
    throw new ValidationException(
      [{
        title: 'status',
        detail: 'Invalid transition',
        violations: [
          'status has an invalid value or the transaction is invalid',
        ],
      }],
    );
  }

  async editDeal(dto: DealDto, deal: Deal) {
    deal.setName(dto.name);
    deal.setDealCondition(dto.dealCondition);
    deal.setDescription(dto.description);
    deal.setPrice(dto.price);
    this.em.getRepository(Deal).persistAndFlush(deal);

    return deal;
  }

  async approveDeal(deal: Deal) {
    const status = await this.em.getRepository(DealStatus).findOne({ name: DealStatus.APPROVED });

    if (!status) {
      throw new NotFoundException();
    }

    deal.setStatus(status);
    await this.em.getRepository(Deal).persistAndFlush(deal);
  }

  async generateCVS(query: any): Promise<any> {
    if (!config.environment) {
      throw new InternalServerErrorException();
    }
    const resultsMapped: any[] = [];
    const adapter = new LocalFilesystemAdapter('.');
    const filesystem = new Filesystem(adapter);
    const where: {} = {};
    const path: string = `uploads/${config.environment}/CSV/CompletedDealsReport-${Date.now()}.csv`;

    const completed : DealStatus = await this.em.getRepository(DealStatus)
      .findOneOrFail({ name: DealStatus.FINISHED });
    Object.assign(where, { status: completed });

    if (query.user) {
      Object.assign(where, { user: query.user });
    }

    if (query.from
      && query.to
      && isDateString(query.from)
      && isDateString(query.to)) {
      Object.assign(where, {
        $and: [
          { updated: { $gte: query.from } },
          { updated: { $lte: query.to } },
        ],
      });
    } else if (query.from && isDateString(query.from)) {
      Object.assign(where, { updated: { $gte: query.from } });
    } else if (query.to && isDateString(query.to)) {
      Object.assign(where, { updated: { $lte: query.to } });
    }

    const resultsFromQuery = await this.em.getRepository(Deal).find(where);
    // eslint-disable-next-line no-restricted-syntax
    for (const deal of resultsFromQuery) {
      // eslint-disable-next-line no-await-in-loop
      const dealFound: Deal = await this.em.getRepository(Deal).findOneOrFail({ id: deal.getId() });
      let buyer: User | undefined;

      if (dealFound.getBuyer()) {
        buyer = dealFound.getBuyer();
      }
      const date = new Date(dealFound.getUpdate());
      const element = {
        Id: dealFound.getId(),
        Name: dealFound.getName(),
        Description: dealFound.getDescription(),
        Condition: dealFound.getDealCondition(),
        Price: dealFound.getPrice(),
        Status: dealFound.getStatus().getName(),
        'Owner ID': dealFound.getUser().getId(),
        'Owner Email': dealFound.getUser().getEmail(),
        'Buyer ID': buyer ? buyer.getId() : 'Demo',
        'Buyer Email': buyer ? buyer.getEmail() : 'Demo',
        'Bought At': date.toDateString(),
      };
      resultsMapped.push(element);
    }

    const output = stringify(resultsMapped, {
      header: true,
    });

    if (await filesystem.fileExists(path)) {
      throw new ConflictException();
    }
    await filesystem.write(path, output);
    resultsMapped.unshift(path);
    const csv = new CsvFile(path);
    await this.em.getRepository(CsvFile).persistAndFlush(csv);

    return resultsMapped;
  }
}
