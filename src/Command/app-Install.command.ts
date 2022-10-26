import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';

const { exec } = require('child_process');

@Injectable()
export default class AppInstallCommand {
  constructor(private readonly em: EntityManager) {
  }

  @Command({
    command: 'app:install',
    describe: 'install the application',
  })
  async create() {
    const connection = await this.em.getConnection();
    await connection.execute('CREATE DATABASE IF NOT EXISTS intercambio');

    const results = await connection.execute(`
      SELECT COUNT(*) as 'tables'
      FROM INFORMATION_SCHEMA.TABLES
      WHERE (TABLE_SCHEMA = 'intercambio')
      `);

    // eslint-disable-next-line no-console
    if (results[0].tables > 0) { // not empty
      exec(
        'yarn mikro-orm migration:up  ',
        (error?:any, stdout?: any, stderr?: any) => {
          if (error) {
            // eslint-disable-next-line no-console
            console.log(`error: ${error.message}`);
          }

          if (stderr) {
            // eslint-disable-next-line no-console
            console.log(`stderr: ${stderr}`);
          }
          // eslint-disable-next-line no-console
          console.log(`stdout: ${stdout}`);
        },
      );
    } else { // db empty
      exec(
        'yarn db:seed',
        (error?:any, stdout?: any, stderr?: any) => {
          if (error) {
            // eslint-disable-next-line no-console
            console.log(`error: ${error.message}`);
          }

          if (stderr) {
            // eslint-disable-next-line no-console
            console.log(`stderr: ${stderr}`);
          }
          // eslint-disable-next-line no-console
          console.log(`stdout: ${stdout}`);
        },
      );
    }
  }
}
