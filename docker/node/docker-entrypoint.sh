#!/bin/sh
set -e

sh docker/scripts/jwt_keys_generator.sh

if [ "$NODE_ENV" = 'dev' ]; then
  yarn install # used specifically to install node_modules in the bind-mount on host machine during development

  yarn app:install

  yarn run start:dev
else
  yarn run build

  yarn app:install

  yarn run start
fi