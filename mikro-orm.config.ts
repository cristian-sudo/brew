import baseConfig from './mikro-orm-base-config';
import Config from './src/Config';
import DealOnStatusUpdateSubscriber from './src/Subscriber/deal.on.status.update.subscriber';

const configs = {
  dev: baseConfig,
  test: {
    ...baseConfig,
    host: 'db_test',
    dbName: 'intercambio',
    user: 'user',
    password: 'pass',
    port: 3306,
    subscribers: [new DealOnStatusUpdateSubscriber()],
  },
};
// @ts-ignore
export default configs[Config.environment];
