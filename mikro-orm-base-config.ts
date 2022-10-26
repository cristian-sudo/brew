import { Options } from '@mikro-orm/core';
import DealOnStatusUpdateSubscriber from './src/Subscriber/deal.on.status.update.subscriber';

const baseConfig: Options = {
  entities: ['dist/src/Entity'],
  entitiesTs: ['src/Entity'],
  dbName: process.env.DATABASE_NAME,
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  multipleStatements: true,
  migrations: {
    path: 'dist/migrations',
    pathTs: 'migrations',
  },
  seeder: {
    path: './dist/src/Seeders',
    pathTs: './src/Seeders',
    glob: '!(*.d).{js,ts}',
    defaultSeeder: 'DatabaseSeeder',
    fileName: (className: string) => className,
  },
  allowGlobalContext: true,
  subscribers: [new DealOnStatusUpdateSubscriber()],
};
export default baseConfig;
