import { Entity } from '@mikro-orm/core';
import Lookup from '../lookup.entity';

@Entity({ tableName: 'user_status' })
export default class UserStatus extends Lookup {
  static readonly PENDING = 'pending';

  static readonly APPROVED = 'approved';

  static readonly DECLINED = 'declined';

  static readonly ALL = [UserStatus.PENDING, UserStatus.APPROVED, UserStatus.DECLINED];

  static readonly ALLOWED_TRANSITIONS: any = {
    [UserStatus.PENDING]: [UserStatus.APPROVED, UserStatus.DECLINED],
    [UserStatus.APPROVED]: [UserStatus.DECLINED],
  };
}
