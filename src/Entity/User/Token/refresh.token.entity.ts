import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'refresh_token' })
export default class RefreshToken {
  @PrimaryKey()
  private id!: number;

  @Property()
  private identifier: string;

  @Property()
  private refreshToken: string;

  public constructor(identifier: string, refreshToken: string) {
    this.identifier = identifier;
    this.refreshToken = refreshToken;
  }

  getId(): number {
    return this.id;
  }

  getIdentifier(): string {
    return this.identifier;
  }

  setIdentifier(identifier: string): void {
    this.identifier = identifier;
  }

  getRefreshToken(): string {
    return this.refreshToken;
  }

  setRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken;
  }
}
