import {
  Injectable, UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EntityManager } from '@mikro-orm/mysql';
import { Loaded } from '@mikro-orm/core';
import User from '../../../Entity/User/user.entity';
import UserEditDto from '../../../Dto/User/user.edit.dto';
import UserStatus from '../../../Entity/User/status.entity';
import UserRegisterDto from '../../../Dto/User/user.register.dto';

@Injectable()
export default class UserHandler {
  constructor(private em: EntityManager) {}

  async registerUser(dto: UserRegisterDto): Promise<User> {
    const status: UserStatus | undefined = await this.em.getRepository(UserStatus).findOneOrFail(
      { name: UserStatus.PENDING },
    );

    const user = new User(
      dto.email,
      await bcrypt.hash(dto.password, 0),
      dto.firstName,
      dto.lastName,
      status,
    );
    await this.em.getRepository(User).persistAndFlush(user);

    return user;
  }

  async editUser(user: Loaded<User> | User, dto: UserEditDto): Promise<User> {
    user.setEmail(dto.email);
    user.setFirstName(dto.firstName);
    user.setLastName(dto.lastName);

    await this.em.persist(user);
    await this.em.flush();

    return user;
  }

  async deleteUser(user: User, password: string): Promise<User> {
    if (!await bcrypt.compare(password, user.getPassword())) {
      throw new UnauthorizedException();
    }
    await this.em.remove(user);
    await this.em.flush();

    return user;
  }
}
