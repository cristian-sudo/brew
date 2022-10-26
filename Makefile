# Sometimes non-interactive mode should be enabled (e.g. pre-push hooks)
ifeq (true, $(non-i))
  	NODE=docker-compose exec -T node
else
	NODE=docker-compose exec node
endif
##############################################################
# Application	                                             #
##############################################################

app-install:
	$(NODE) yarn nestjs-command app:install

generate-completed-deals-csv:
	$(NODE) yarn nestjs-command app:generate:csv

db-reinstall:
	$(NODE) yarn mikro-orm migration:fresh --seed

db-test-install:
	$(NODE) yarn test:fresh
	$(NODE) yarn test:seed

##############################################################
# Docker compose                                             #
##############################################################

build:
	cp .env.dist .env
	cp tools/hooks/pre-push .git/hooks/pre-push
	docker-compose build

run:
	docker-compose up

down:
	docker-compose down -v --rmi=all --remove-orphans

##############################################################
# Test                                                       #
##############################################################

test:
	$(NODE) yarn test

test-cov:
	$(NODE) yarn test --coverage

##############################################################
# Configuration                                           #
##############################################################

node:
	$(NODE) sh

##############################################################
# Clear Password Table                                       #
##############################################################

clear-password-reset:
	$(NODE) yarn clear:password-reset

##############################################################
# static analytic tools                                           #
##############################################################

lint-check:
	yarn run lint

lint-fix:
	yarn run lint --fix

analyse: lint-check

##############################################################
# Prerequisites Setup                                        #
##############################################################

setup:
	cp tools/hooks/pre-push .git/hooks/pre-push
