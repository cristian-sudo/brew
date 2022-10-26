import {
  Entity, OneToOne, PrimaryKey, Property,
} from '@mikro-orm/core';
import User from '../user.entity';

@Entity({ tableName: 'password_reset' })
export default class PasswordReset {
  @PrimaryKey()
  private id!: number;

  @Property()
  private resetLink: string;

  @Property()
  private timeStamp: string;

  @OneToOne(() => User)
  private readonly user: User;

  constructor(resetLink: string, timeStamp: string, user: User) {
    this.resetLink = resetLink;
    this.timeStamp = timeStamp;
    this.user = user;
  }

  getId(): number {
    return this.id;
  }

  getUser(): User {
    return this.user;
  }

  getTimeStamp(): string {
    return this.timeStamp;
  }

  refreshPasswordRequest(resetLink: string, timeStamp: string): void {
    this.resetLink = resetLink;
    this.timeStamp = timeStamp;
  }
}
