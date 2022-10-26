import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { useContainer, ValidationError } from 'class-validator';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'supertest';
import { MailerService } from '@nestjs-modules/mailer';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';
import DealStatus from '../../../src/Entity/Deal/status.entity';
import User from '../../../src/Entity/User/user.entity';
import ValidationException from '../../../src/Exception/validation.exception';
import ValidationExceptionFilter from '../../../src/ExceptionFilter/validation-exception.filter';
import Deal from '../../../src/Entity/Deal/deal.entity';
import TestMailer from './test-mailer';
import config from '../../../mikro-orm.config';
import UserStatus from '../../../src/Entity/User/status.entity';

const ApiTestCase = {
  async setUp(nestApp: INestApplication, modules: any[]): Promise<[INestApplication, MikroORM, TestingModule]> {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: modules,
    }).overrideProvider(MailerService)
      .useClass(TestMailer)
      .compile();

    let app: INestApplication = nestApp;
    app = testingModule.createNestApplication();

    const orm: MikroORM<MySqlDriver> = await MikroORM.init<MySqlDriver>(config);
    // Pipes
    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: (errors: ValidationError[] = []) => {
          const messages = errors.map(
            (error) => ({
              title: error.property,
              detail: `${error.property} has the wrong value of [ ${error.value} ]`,
              violations: Object.values(error.constraints ? error.constraints : []),
            }),
          );

          return new ValidationException(messages);
        },
        transform: true,
      }),
    );

    app.useGlobalPipes(new ValidationPipe());

    // Global Filters
    app.useGlobalFilters(new ValidationExceptionFilter());

    // Class Validator DI
    modules.forEach((module) => useContainer(app.select(module), { fallbackOnErrors: true }));

    await app.init();

    return [app, orm, testingModule];
  },
  // Requests
  async jsonGetRequest(
    app: INestApplication,
    route: string,
    user: User | undefined = undefined,

  ): Promise<Response> {
    let token: string | undefined;

    if (user) {
      const response = await this.jsonPostRequest(app, '/api/token/get', {
        email: user.getEmail(),
        password: 'password',
      });
      token = response.body.access_token;
    }

    return request(app.getHttpServer())
      .get(route)
      .set(token ? {
        Authorization: `Bearer ${token}`,
      } : {});
  },

  async jsonPostRequest(
    app: INestApplication,
    route: string,
    data: object = {},
    user: User | undefined = undefined,
  ): Promise<Response> {
    let token: string | undefined;

    if (user) {
      const response = await this.jsonPostRequest(app, '/api/token/get', {
        email: user.getEmail(),
        password: 'password',
      });
      token = response.body.access_token;
    }

    return request(app.getHttpServer())
      .post(route)
      .set(token ? {
        Authorization: `Bearer ${token}`,
      } : {})
      .send(data);
  },

  async jsonPutRequest(
    app: INestApplication,
    route: string,
    data: object = {},
    user: User | undefined = undefined,
  ): Promise<Response> {
    let token: string | undefined;

    if (user) {
      const response = await this.jsonPostRequest(app, '/api/token/get', {
        email: user.getEmail(),
        password: 'password',
      });
      token = response.body.access_token;
    }

    return request(app.getHttpServer())
      .put(route)
      .set(token ? {
        Authorization: `Bearer ${token}`,
      } : {})
      .send(data);
  },

  // Methods
  async createApiUser(
    em: EntityManager,
    roles: string[] = [User.ROLE_USER],
    userStatus: string = UserStatus.APPROVED,
    email:string = 'admin@gmail.com',
  ): Promise<User> {
    const from: number = 1000;
    const to: number = 9000;

    const status: UserStatus | undefined = await em.getRepository(UserStatus).findOneOrFail({ name: userStatus });
    const password: string = await bcrypt.hash('password', 0);
    const unique: number = Math.floor(from + Math.random() * to);
    const user = new User(
      email === 'admin@gmail.com'
        ? unique + email
        : email,
      password,
      `Vito${unique}`,
      `Carbone${unique}`,
      status,
      roles,
    );
    await em.getRepository(User).persistAndFlush(user);

    return user;
  },

  async createToken(
    em: EntityManager,
    app: INestApplication,
    userRoles: string[] = [User.ROLE_USER],
    userStatus: string = UserStatus.APPROVED,
    email: string = 'testUser@example.com',
  ): Promise<[Response, User]> {
    const user = await this.createApiUser(em, userRoles, userStatus, email);
    const response = await this.jsonPostRequest(app, '/api/token/get', {
      email: user.getEmail(),
      password: 'password',
    });

    return [response, user];
  },

  async createApiDeal(
    em: EntityManager,
    user:User,
    status:string = DealStatus.PENDING,
    buyer: User | undefined = undefined,
  ): Promise<Deal> {
    const from: number = 1000;
    const to: number = 9000;
    const maxyear = 2022;
    const statusFound: DealStatus | undefined = await em.getRepository(DealStatus)
      .findOneOrFail({ name: status });
    const unique: number = Math.floor(from + Math.random() * to);
    const deal: Deal = new Deal(
      `dealName ${unique}`,
      `dealDescription ${unique}`,
      `dealCondition ${unique}`,
      unique,
      statusFound,
      user,
    );

    if (buyer) {
      deal.setBuyer(buyer);
    }
    const randomDate = new Date(
      new Date().getTime() + Math.random()
      * (new Date(maxyear, 1, 1).getTime() - new Date().getTime()),
    );
    deal.setUpdate(randomDate);
    await em.getRepository(Deal).persistAndFlush(deal);

    return deal;
  },
  sorted(arr:number[], desc:boolean):boolean {
    let secondIndex;
    for (let firstIndex = 0; firstIndex < arr.length; firstIndex++) {
      secondIndex = firstIndex + 1;

      if (desc ? arr[secondIndex] - arr[firstIndex] > 0 : arr[secondIndex] - arr[firstIndex] < 0) {
        return false;
      }
    }

    return true;
  },
  async requestPasswordChange(app: INestApplication, user: User | undefined): Promise<Response> {
    return this.jsonPostRequest(
      app,
      '/api/user/password/request',
      {},
      user,
    );
  },

  async createApiDealsPerStatus(
    em: EntityManager,
    many: number,
    user: User,
    buyer: User | undefined = undefined,
  ): Promise<Deal[]> {
    const deals: Deal[] = [];
    for (let i = 1; i <= DealStatus.ALL.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const statusFound: DealStatus | undefined = await em.getRepository(DealStatus)
        .findOneOrFail({ id: i });
      for (let j = 1; j <= many; j++) {
        // eslint-disable-next-line no-await-in-loop
        const deal: Deal = await ApiTestCase.createApiDeal(em, user, statusFound.getName(), buyer);
        deals.push(deal);
      }
    }

    return deals;
  },

  setSystemOneDayAhead() {
    const oneDayInMilliseconds: number = 86400001;
    const oneDayAhead = Date.now() + oneDayInMilliseconds;
    Date.now = jest.fn(() => oneDayAhead);
  },
};

export default ApiTestCase;
