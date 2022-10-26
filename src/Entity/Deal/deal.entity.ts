import {
  Entity, ManyToOne, PrimaryKey, Property,
} from '@mikro-orm/core';
import DealStatus from './status.entity';
import User from '../User/user.entity';

@Entity({ tableName: 'deal' })
export default class Deal {
  static readonly STRING_MAX_LENGTH = 255;

  @PrimaryKey()
  private id!: number;

  @Property()
  private name: string;

  @Property()
  private description: string;

  @Property()
  private dealCondition: string;

  @Property()
  private price: number;

  @Property({
    name: 'updated_at',
    columnType: 'timestamp',
    getter: true,
  })
  private updated: Date;

  @ManyToOne(() => DealStatus, { eager: true })
  private status: DealStatus;

  @ManyToOne(() => User, { eager: true })
  private readonly user: User;

  @ManyToOne(() => User, { eager: true, nullable: true })
  private buyer!: User;

  public constructor(
    name: string,
    description: string,
    dealCondition: string,
    price: number,
    status: DealStatus,
    user: User,
    updated:Date = new Date(),
  ) {
    this.name = name;
    this.description = description;
    this.dealCondition = dealCondition;
    this.price = price;
    this.status = status;
    this.user = user;
    this.updated = updated;
  }

  setUpdate(date: Date) {
    this.updated = date;
  }

  getUpdate() {
    return this.updated;
  }

  getId(): number {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  setName(value: string) {
    this.name = value;
  }

  getDescription(): string {
    return this.description;
  }

  setDescription(value: string) {
    this.description = value;
  }

  getDealCondition(): string {
    return this.dealCondition;
  }

  setDealCondition(value: string) {
    this.dealCondition = value;
  }

  getPrice(): number {
    return this.price;
  }

  setPrice(value: number) {
    this.price = value;
  }

  getStatus(): DealStatus {
    return this.status;
  }

  setStatus(status: DealStatus) {
    this.status = status;
  }

  getUser(): User {
    return this.user;
  }

  setBuyer(user: User) {
    this.buyer = user;
  }

  getBuyer(): User | undefined {
    return this.buyer;
  }
}
