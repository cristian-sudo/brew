import { Entity } from '@mikro-orm/core';
import Lookup from '../lookup.entity';

@Entity({ tableName: 'deal_status' })
export default class DealStatus extends Lookup {
  static readonly DRAFT = 'draft';

  static readonly PENDING = 'pending';

  static readonly APPROVED = 'approved';

  static readonly DECLINED = 'declined';

  static readonly LIVE = 'live';

  static readonly FINISHED = 'finished';

  static readonly ALL = [
    DealStatus.DRAFT,
    DealStatus.PENDING,
    DealStatus.APPROVED,
    DealStatus.LIVE,
    DealStatus.DECLINED,
    DealStatus.FINISHED,
  ];

  static readonly ALLOWED_TRANSITIONS = {
    [DealStatus.DRAFT]: [DealStatus.PENDING],
    [DealStatus.PENDING]: [DealStatus.LIVE, DealStatus.DECLINED],
    [DealStatus.APPROVED]: [DealStatus.LIVE],
  };
}
