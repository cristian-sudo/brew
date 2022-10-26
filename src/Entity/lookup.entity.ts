import { PrimaryKey, Property } from '@mikro-orm/core';

export default abstract class Lookup {
  @PrimaryKey()
  protected id!: number;

  @Property()
  protected name: string;

  public constructor(name:string) {
    this.name = name;
  }

  public getName():string {
    return this.name;
  }

  public getId():number {
    return this.id;
  }
}
