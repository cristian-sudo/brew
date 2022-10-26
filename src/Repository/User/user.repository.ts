import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Loaded } from '@mikro-orm/core';
import User from '../../Entity/User/user.entity';

@Injectable()
export default class UserRepository {
  constructor(private em: EntityManager) {}

  async getUserById(id: number): Promise<Loaded<User> | null> {
    return this.em.getRepository(User).findOne(id);
  }

  async getUserByEmail(email: string): Promise<Loaded<User> | null> {
    return this.em.getRepository(User).findOne({ email });
  }
}
