import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'csv' })
export default class CsvFile {
  @PrimaryKey()
  private id!: number;

  @Property()
  private path: string;

  @Property()
  private readonly timeStamp: Date;

  constructor(path: string) {
    this.path = path;
    this.timeStamp = new Date();
  }

  getId(): number {
    return this.id;
  }

  setPath(path: string) {
    this.path = path;
  }

  getPath():string {
    return this.path;
  }

  getTimeStamp(): Date {
    return this.timeStamp;
  }
}
