import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/mysql';
import { Loaded } from '@mikro-orm/core';
import UserStatus from '../../../Entity/User/status.entity';
import User from '../../../Entity/User/user.entity';

export default class AdminDemoSeed extends Seeder {
  public password: string = 'password';

  public async run(em: EntityManager): Promise<void> {
    const status:Loaded<UserStatus> | null = await em.getRepository(UserStatus)
      .findOne({ name: UserStatus.APPROVED });

    if (!status) {
      throw new InternalServerErrorException();
    }

    const password = await bcrypt.hash(this.password, 0);

    const admin = new User(
      'admin@gmail.com',
      password,
      'Admin',
      'The Greatest',
      status,
      ['ROLE_ADMIN'],
    );
    await em.persist(admin);
    await em.flush();
  }
}
