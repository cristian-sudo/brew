ARG NODE_VERSION=17.6.0

FROM node:${NODE_VERSION}-alpine as base_node

WORKDIR /usr/src/app

COPY . ./

COPY docker/node/docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint; \
    apk update; \
    apk add openssl; \
    apk add acl

ENTRYPOINT ["docker-entrypoint"]
CMD ["node"]

FROM base_node as node_development

RUN set -eux; \
    yarn install; \
    yarn global add @nestjs/cli; \
    yarn global add typeorm@0.2; \
    yarn global add ts-node

FROM base_node as node_production

RUN set -eux; \
    yarn install --production