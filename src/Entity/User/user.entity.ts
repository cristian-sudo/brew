import {
  Entity, ManyToOne, PrimaryKey, Property,
} from '@mikro-orm/core';
import UserStatus from './status.entity';

@Entity({ tableName: 'user' })
export default class User {
  static readonly ROLE_USER = 'ROLE_USER';

  static readonly ROLE_ADMIN = 'ROLE_ADMIN';

  static readonly STRING_MAX_LENGTH = 255;

  static readonly PASSWORD_MIN_LENGTH = 6;

  @PrimaryKey()
  private id!: number;

  @Property({ unique: true })
  private email: string;

  @Property({ hidden: true })
  private password: string;

  @Property()
  private firstName: string;

  @Property()
  private lastName: string;

  @ManyToOne(() => UserStatus, { eager: true })
  private status: UserStatus;

  @Property()
  private readonly roles: string[];

  public constructor(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    status: UserStatus,
    roles: string[] = [User.ROLE_USER],
  ) {
    this.email = email;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.status = status;
    this.roles = roles;
  }

  getId(): number {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  setEmail(value: string): void {
    this.email = value;
  }

  getPassword(): string {
    return this.password;
  }

  setPassword(value: string): void {
    this.password = value;
  }

  getFirstName(): string {
    return this.firstName;
  }

  setFirstName(value: string): void {
    this.firstName = value;
  }

  getLastName(): string {
    return this.lastName;
  }

  setLastName(value: string): void {
    this.lastName = value;
  }

  /* getFullName(): string {
    return sprintf('%1s %2s', this.getFirstName(), this.getLastName());
  } */

  getRoles(): string[] {
    return this.roles;
  }

  addRole(value: string): void {
    if (!this.roles.includes(value)) {
      const index = this.roles.indexOf(value);
      this.roles.splice(index, 0, value);
    }
  }

  removeRole(value: string): void {
    if (this.roles.includes(value)) {
      const index = this.roles.indexOf(value);
      this.roles.splice(index, 1);
    }
  }

  getUserIdentifier(): string {
    return this.getEmail();
  }

  getStatus():UserStatus {
    return this.status;
  }

  setStatus(status:UserStatus): void {
    this.status = status;
  }

  isApproved(): boolean {
    return this.getStatus().getName() === UserStatus.APPROVED;
  }

  isAdmin(): boolean {
    return this.getRoles().includes(User.ROLE_ADMIN);
  }

  isDeclined(): boolean {
    return this.getStatus().getName() === UserStatus.DECLINED;
  }

  isPending(): boolean {
    return this.getStatus().getName() === UserStatus.PENDING;
  }
}

export interface CurrentUserInterface {
  id: number;
  email: string;
  roles: string[];
}
