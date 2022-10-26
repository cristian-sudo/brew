import { HttpStatus, INestApplication } from '@nestjs/common';
import { matchers } from 'jest-json-schema';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import JsonSchemaLoader from '../../../src/Schema/json-schema-loader';
import ApiTestCase from '../../Setup/Api/api.test.case';
import AuthModule from '../../../src/Module/Auth/auth.module';
import UserModule from '../../../src/Module/User/user.module';
import Status from '../../../src/Entity/User/status.entity';
import { UserType } from '../../../src/Type/User/user.type';
import User from '../../../src/Entity/User/user.entity';
import { DealType } from '../../../src/Type/Deal/deal.type';
import UserApiTestCase from '../../Setup/Api/User/user.api.test.case';

expect.extend(matchers);

const getUsersRoute: string = '/api/user';
const createUserRoute: string = '/api/user/register';
const editUserRoute: string = '/api/user/edit';
const deleteUserRoute: string = '/api/user/delete';
const manyUsersPerStatus: number = 2;
const usersLimit: number = 3;

describe('User', () => {
  let app: INestApplication;
  let em: EntityManager;
  let orm: MikroORM;

  const schemaLoader: JsonSchemaLoader = new JsonSchemaLoader();
  let readUserSchema: object;
  let validationSchema: object;

  beforeAll(async () => {
    [app, orm] = await ApiTestCase.setUp(app, [UserModule, AuthModule]);
    em = orm.em;
    await em.getRepository(User).nativeDelete({});
    readUserSchema = await schemaLoader.getSchemaByName('User', 'read.user');
    validationSchema = await schemaLoader.getSchemaByName('Validation', 'validation.error');
  });

  describe('Getting User', () => {
    test('it_returns_users', async () => {
      const response = await ApiTestCase.jsonGetRequest(app, getUsersRoute);

      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    test('it_returns_user_with_valid_id', async () => {
      const user = await ApiTestCase.createApiUser(em);
      const response = await ApiTestCase.jsonGetRequest(app, `${getUsersRoute}/${user.getId()}`);

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toMatchSchema(readUserSchema);
    });

    test('it_fails_with_invalid_id', async () => {
      const response = await ApiTestCase.jsonGetRequest(app, `${getUsersRoute}/14124`);
      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('Creating User', () => {
    test('it_creates_user_with_valid_data', async () => {
      const response = await ApiTestCase.jsonPostRequest(
        app,
        createUserRoute,
        {
          email: 'padrino@familia.it',
          firstName: 'Vito',
          lastName: 'Corleone',
          password: 'crimePaysBills',
          confirmPassword: 'crimePaysBills',
        },
      );

      expect(response.statusCode).toBe(HttpStatus.CREATED);
      expect(response.body).toMatchSchema(readUserSchema);
    });

    test('it_fails_with_no_body', async () => {
      const response = await ApiTestCase.jsonPostRequest(app, createUserRoute, {});

      expect(response.body).toMatchSchema(validationSchema);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test('it_fails_if_email_exists', async () => {
      await ApiTestCase.createApiUser(
        em,
        [User.ROLE_USER],
        Status.APPROVED,
        'adminRandom@gmail.com',
      );
      const response = await ApiTestCase.jsonPostRequest(
        app,
        createUserRoute,
        {
          email: 'adminRandom@gmail.com',
          firstName: 'Vito',
          lastName: 'Corleone',
          password: 'crimePaysBills',
          confirmPassword: 'crimePaysBills',
        },
      );
      expect(response.body).toMatchSchema(validationSchema);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test('it_fails_with_no_email', async () => {
      await ApiTestCase.createApiUser(em);
      const response = await ApiTestCase.jsonPostRequest(
        app,
        createUserRoute,
        {
          email: 'admin',
          firstName: 'Vito',
          lastName: 'Corleone',
          password: 'crimePaysBills',
          confirmPassword: 'crimePaysBills',
        },
      );

      expect(response.body).toMatchSchema(validationSchema);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test('it_fails_with_no_password_match', async () => {
      const response = await ApiTestCase.jsonPostRequest(
        app,
        createUserRoute,
        {
          email: 'padrino@familia.it',
          firstName: 'Vito',
          lastName: 'Corleone',
          password: 'crimePaysBills',
          confirmPassword: 'password',
        },
      );

      expect(response.body).toMatchSchema(validationSchema);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Edit User', () => {
    test('it_edits_user_with_valid_data', async () => {
      const user = await ApiTestCase.createApiUser(em);

      const response = await ApiTestCase.jsonPutRequest(
        app,
        editUserRoute,
        {
          email: 'theWolf@gmail.com',
          firstName: 'Emilio',
          lastName: 'Barzini',
        },
        user,
      );

      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toMatchSchema(readUserSchema);
      expect(response.body.email === user.getEmail()).toBeFalsy();
      expect(response.body.firstName === user.getFirstName()).toBeFalsy();
      expect(response.body.lastName === user.getLastName()).toBeFalsy();
    });

    test('it_fails_with_no_body', async () => {
      const user = await ApiTestCase.createApiUser(em);

      const response = await ApiTestCase.jsonPutRequest(app, editUserRoute, {}, user);

      expect(response.body).toMatchSchema(validationSchema);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Delete User', () => {
    test('it_deletes_user_with_valid_body', async () => {
      const user = await ApiTestCase.createApiUser(em);

      const response = await ApiTestCase.jsonPostRequest(
        app,
        deleteUserRoute,
        {
          password: 'password',
        },
        user,
      );

      expect(response.statusCode).toBe(HttpStatus.NO_CONTENT);
    });

    test('it_fails_with_invalid_password', async () => {
      const user = await ApiTestCase.createApiUser(em);

      const response = await ApiTestCase.jsonPostRequest(
        app,
        deleteUserRoute,
        {
          password: 'deffo the wrong password',
        },
        user,
      );

      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Filter User', () => {
    test('it_filters_users_by_status', async () => {
      await UserApiTestCase.createApiUsersPerStatus(em, manyUsersPerStatus);

      const status:string = Status.APPROVED;
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getUsersRoute}?filter[status]=${status}`,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);

      const users: UserType[] = response.body;
      users.forEach((user) => {
        expect(user.status.name).toBe(status);
      });
    });
    test('it_returns_empty_response_filtering_users_by_status_with_invalid_status', async () => {
      await UserApiTestCase.createApiUsersPerStatus(em, manyUsersPerStatus);

      const status:string = 'not a status';
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getUsersRoute}?filter[status]=${status}`,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toEqual([]);
    });
    test('it_filters_deals_by_first_name', async () => {
      const users: User[] = await UserApiTestCase.createApiUsersPerStatus(em, manyUsersPerStatus);

      const firstName:string = users[0].getFirstName();
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getUsersRoute}?filter[firstName]=${firstName}`,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);

      const userResponse:UserType[] = response.body;
      userResponse.forEach((user) => {
        expect(user.firstName).toBe(firstName);
      });
    });
    test('it_returns_empty_response_filtering_users_by_first_name_with_invalid_first_name', async () => {
      await UserApiTestCase.createApiUsersPerStatus(em, manyUsersPerStatus);

      const firstName:string = 'not a first name';
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getUsersRoute}?filter[firstName]=${firstName}`,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toEqual([]);
    });
    test('it_filters_deals_by_last_name', async () => {
      const users: User[] = await UserApiTestCase.createApiUsersPerStatus(em, manyUsersPerStatus);

      const lastName:string = users[0].getLastName();
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getUsersRoute}?filter[lastName]=${lastName}`,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);

      const userResponse:UserType[] = response.body;
      userResponse.forEach((user) => {
        expect(user.lastName).toBe(lastName);
      });
    });
    test('it_returns_empty_response_filtering_users_by_last_name_with_invalid_last_name', async () => {
      await UserApiTestCase.createApiUsersPerStatus(em, manyUsersPerStatus);

      const lastName:string = 'not a first name';
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getUsersRoute}?filter[lastName]=${lastName}`,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toEqual([]);
    });
    test('it_filters_deals_by_user_role', async () => {
      await UserApiTestCase.createApiUsersPerStatus(em, manyUsersPerStatus);

      const userRole:string = User.ROLE_USER;
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getUsersRoute}?filter[roles]=${userRole}`,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);

      const userResponse:UserType[] = response.body;
      userResponse.forEach((user) => {
        expect(user.roles.includes(userRole)).toBe(true);
      });
    });
    test('it_filters_deals_by_admin_role', async () => {
      await UserApiTestCase.createApiUsersPerStatus(em, manyUsersPerStatus);

      const adminRole:string = User.ROLE_ADMIN;
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getUsersRoute}?filter[roles]=${adminRole}`,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);

      const userResponse:UserType[] = response.body;
      userResponse.forEach((user) => {
        expect(user.roles.includes(adminRole)).toBe(true);
      });
    });
    test('it_returns_empty_response_filtering_users_by_role_with_invalid_role', async () => {
      await UserApiTestCase.createApiUsersPerStatus(em, manyUsersPerStatus);

      const role:string = 'not a role';
      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getUsersRoute}?filter[roles]=${role}`,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toEqual([]);
    });
    test('it_orders_users_by_id_ASC', async () => {
      await UserApiTestCase.createApiUsersPerStatus(em, manyUsersPerStatus);

      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getUsersRoute}?sort[id]=ASC`,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);

      const usersAfter:UserType[] = response.body;
      const idS: number[] = [];
      usersAfter.forEach((user) => {
        idS.push(user.id);
      });
      const isSorted: boolean = ApiTestCase.sorted(idS, false);
      expect(isSorted).toBe(true);
    });
    test('it_orders_users_by_id_DESC', async () => {
      await UserApiTestCase.createApiUsersPerStatus(em, manyUsersPerStatus);

      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getUsersRoute}?sort[id]=DESC`,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);

      const usersAfter:UserType[] = response.body;
      const idS: number[] = [];
      usersAfter.forEach((user) => {
        idS.push(user.id);
      });
      const isSorted: boolean = ApiTestCase.sorted(idS, true);
      expect(isSorted).toBe(true);
    });
  });
  describe('Limit Users', () => {
    test('it_limit_user_response', async () => {
      await UserApiTestCase.createApiUsersPerStatus(em, manyUsersPerStatus);

      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getUsersRoute}?limit=${usersLimit}`,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);
      const usersAfter:DealType[] = response.body;
      expect(usersAfter.length).toBe(usersLimit);
    });
    test('it_limit_user_response_on_default_limit_when_invalid_limit_value', async () => {
      await UserApiTestCase.createApiUsersPerStatus(em, manyUsersPerStatus);

      const response = await ApiTestCase.jsonGetRequest(
        app,
        `${getUsersRoute}?limit=asaadd`,
      );
      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  afterEach(async () => {
    await em.getRepository(User).nativeDelete({});
  });

  afterAll(async () => {
    await orm.close();
    await app.close();
  });
});
