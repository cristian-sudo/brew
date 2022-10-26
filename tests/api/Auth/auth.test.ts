import { HttpStatus, INestApplication } from '@nestjs/common';
import { matchers } from 'jest-json-schema';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import ApiTestCase from '../../Setup/Api/api.test.case';
import JsonSchemaLoader from '../../../src/Schema/json-schema-loader';
import AuthModule from '../../../src/Module/Auth/auth.module';
import User from '../../../src/Entity/User/user.entity';
import UserStatus from '../../../src/Entity/User/status.entity';
import RefreshToken from '../../../src/Entity/User/Token/refresh.token.entity';
import AppModule from '../../../src/app.module';

expect.extend(matchers);

const getTokenRoute: string = '/api/token/get';
const refreshTokenRoute: string = '/api/token/refresh';

describe('Authentication', () => {
  let app: INestApplication;

  const schemaLoader: JsonSchemaLoader = new JsonSchemaLoader();
  let readTokenSchema: object;
  let validationSchema: object;
  let orm: MikroORM;
  let em: EntityManager;

  beforeAll(async () => {
    [app, orm] = await ApiTestCase.setUp(app, [AuthModule, AppModule]);
    em = orm.em;
    await em.getRepository(RefreshToken).nativeDelete({});
    await em.getRepository(User).nativeDelete({});
    readTokenSchema = await schemaLoader.getSchemaByName('Token', 'read.token');
    validationSchema = await schemaLoader.getSchemaByName('Validation', 'validation.error');
  });

  describe('Get Access Token', () => {
    test('it_fails_with_invalid_email', async () => {
      const response = await ApiTestCase.jsonPostRequest(app, getTokenRoute, {
        email: 'padrino@familia.it',
        password: 'crimePaysBills',
      });

      expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test('it_fails_with_invalid_password', async () => {
      const user = await ApiTestCase.createApiUser(em);
      const response = await ApiTestCase.jsonPostRequest(app, getTokenRoute, {
        email: user.getEmail(),
        password: 'crimePaysBills',
      });
      expect(response.body).toMatchSchema(validationSchema);
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test('it_returns_tokens_with_valid_user', async () => {
      const [response] = await ApiTestCase.createToken(em, app);

      expect(response.statusCode).toBe(HttpStatus.CREATED);
      expect(response.body).toMatchSchema(readTokenSchema);
    });

    test('it_fails_if_user_is_not_approved', async () => {
      const [response] = await ApiTestCase.createToken(em, app, [User.ROLE_USER], UserStatus.PENDING);
      expect(response.body.message).toBe('Your account has not been approved yet, '
            + 'please wait while our site admin reviews your application request.');
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });

    test('it_fails_if_user_is_declined', async () => {
      const [response] = await ApiTestCase.createToken(em, app, [User.ROLE_USER], UserStatus.DECLINED);
      expect(response.body.message).toBe('Your account has been declined, please contact the support.');
      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Get Refresh Token', () => {
    test('it_returns_refresh_tokens_with_valid_token', async () => {
      const [response, user] = await ApiTestCase.createToken(em, app, [User.ROLE_ADMIN]);

      const refreshTokenResponse = await ApiTestCase.jsonPostRequest(app, refreshTokenRoute, {
        email: user.getEmail(),
        refresh_token: response.body.refresh_token,
      });

      expect(refreshTokenResponse.statusCode).toBe(HttpStatus.CREATED);
      expect(refreshTokenResponse.body).toMatchSchema(readTokenSchema);
    });

    test('it_fails_with_invalid_refresh_token', async () => {
      const response = await ApiTestCase.jsonPostRequest(app, refreshTokenRoute, {
        user_id: 99999,
        refresh_token: 'La la la, I am not a token',
      });

      expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  afterEach(async () => {
    await em.getRepository(RefreshToken).nativeDelete({});
    await em.getRepository(User).nativeDelete({});
  });

  afterAll(async () => {
    await orm.close();
    await app.close();
  });
});
