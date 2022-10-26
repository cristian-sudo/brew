import { HttpStatus, INestApplication } from '@nestjs/common';
import { matchers } from 'jest-json-schema';
import supertest from 'supertest';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import UserModule from '../../../src/Module/User/user.module';
import User from '../../../src/Entity/User/user.entity';
import ApiTestCase from '../../Setup/Api/api.test.case';
import AuthModule from '../../../src/Module/Auth/auth.module';
import PasswordReset from '../../../src/Entity/User/Password/password.reset.entity';
import MailModule from '../../../src/Module/Mail/mail.module';
import JsonSchemaLoader from '../../../src/Schema/json-schema-loader';

expect.extend(matchers);

const resetPasswordRoute: string = '/api/user/password/reset';
const forgottenPasswordRoute: string = '/api/user/password/request-reset';

describe('User', () => {
  let app: INestApplication;
  let em: EntityManager;
  let orm: MikroORM;

  const schemaLoader: JsonSchemaLoader = new JsonSchemaLoader();
  let readTokenSchema: object;
  let validationSchema: object;

  beforeAll(async () => {
    [app, orm] = await ApiTestCase.setUp(app, [UserModule, AuthModule, MailModule]);
    em = orm.em;

    readTokenSchema = await schemaLoader.getSchemaByName('Token', 'read.token');
    validationSchema = await schemaLoader.getSchemaByName('Validation', 'validation.error');
  });

  describe('Request Reset Password', () => {
    test('it_sends_forgotten_password_reset', async () => {
      const user = await ApiTestCase.createApiUser(em);
      const response = await ApiTestCase.jsonPostRequest(app, forgottenPasswordRoute, {
        email: user.getEmail(),
      });

      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('Request change', () => {
    test('it_sends_password_change_request', async () => {
      const user = await ApiTestCase.createApiUser(em);

      const response = await ApiTestCase.requestPasswordChange(app, user);
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    test('it_generate_a_new_link_if_required', async () => {
      const user = await ApiTestCase.createApiUser(em);

      const oldToken: supertest.Response = await ApiTestCase.requestPasswordChange(app, user);
      const newToken: supertest.Response = await ApiTestCase.requestPasswordChange(app, user);

      expect(oldToken.statusCode).toBe(HttpStatus.OK);
      expect(newToken.statusCode).toBe(HttpStatus.OK);
      expect(oldToken.body.resetLink === newToken.body.resetLink).toBeFalsy();
    });

    test('it_updates_timestamp_if_after_a_day', async () => {
      const user = await ApiTestCase.createApiUser(em);

      await ApiTestCase.requestPasswordChange(app, user);
      ApiTestCase.setSystemOneDayAhead();
      const response = await ApiTestCase.requestPasswordChange(app, user);

      expect(response.statusCode).toBe(HttpStatus.OK);
    });
  });

  describe('Reset Password', () => {
    test('it_changes_the_password', async () => {
      const user = await ApiTestCase.createApiUser(em);
      const resetLink = await ApiTestCase.requestPasswordChange(app, user);
      const link: string = resetLink.body.resetLink;

      const response = await ApiTestCase.jsonPostRequest(
        app,
        `${resetPasswordRoute}?resetLink=${link}`,
        {
          password: 'newPassword',
          confirmPassword: 'newPassword',
        },
      );
      expect(response.statusCode).toBe(HttpStatus.OK);
      expect(response.body).toMatchSchema(readTokenSchema);
    });

    test('it_fails_with_no_or_invalid_link', async () => {
      const response = await ApiTestCase.jsonPostRequest(
        app,
        `${resetPasswordRoute}?resetLink=fsfsajfhsjkfhsidfys87dfyewhriw`,
        {
          password: 'password',
          confirmPassword: 'password',
        },
      );

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchSchema(validationSchema);
    });

    test('it_fails_and_deletes_token_if_longer_than_24_hours', async () => {
      const user = await ApiTestCase.createApiUser(em);
      const resetLink = await ApiTestCase.requestPasswordChange(app, user);
      const link: string = resetLink.body.resetLink;

      ApiTestCase.setSystemOneDayAhead();

      const response = await ApiTestCase.jsonPostRequest(
        app,
        `${resetPasswordRoute}?resetLink=${link}`,
        {
          password: 'newPassword',
          confirmPassword: 'newPassword',
        },
      );

      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchSchema(validationSchema);
    });

    test('it_fails_with_the_new_password_same_as_the_old_one', async () => {
      const user = await ApiTestCase.createApiUser(em);
      const resetLink = await ApiTestCase.requestPasswordChange(app, user);
      const link: string = resetLink.body.resetLink;

      const response = await ApiTestCase.jsonPostRequest(
        app,
        `${resetPasswordRoute}?resetLink=${link}`,
        {
          password: 'password',
          confirmPassword: 'password',
        },
      );
      expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchSchema(validationSchema);
    });
  });

  afterEach(async () => {
    await em.getRepository(PasswordReset).nativeDelete({});
    await em.getRepository(User).nativeDelete({});
  });

  afterAll(async () => {
    await orm.close();
    await app.close();
  });
});
