Intercambio ltd.
==================

This project is built on Nestjs

# Contents

* [Deploy Locally](#markdown-header-deploy-locally)
    * [Prerequisite](#markdown-header-prerequisite)
    * [Build app](#markdown-header-build-app)
    * [Optional - Create docker-compose.override.yml](#markdown-header-setup-locally-docker-compose-override)
    * [Run a project](#markdown-header-run-a-project)
    * [Check if it works](#markdown-header-check-if-it-works)
    * [Database installion](#markdown-header-database-installion)
    * [Obtain a JWT token](#setup-locally-obtain-a-jwt-token)
    * [Mailer](#markdown-header-mailer)
* [Code Quality](#markdown-header-code-quality)
    * [Static Analysis tools and linters](#markdown-header-static-analysis-tools-and-linters)
        * [Prerequisites](#markdown-header-analysis-prerequisites)
        * [Usage](#markdown-header-analysis-usage)
        * [Tests](#markdown-header-tests)
        * [Usage](#markdown-header-tests-usage)
* [Working with Git](#markdown-header-working-with-git)
    * [Requirements](#markdown-header-requirements)
    * [Why having an issue ID is important](#markdown-header-why-having-an-issue-id-is-important)
    * [Configure git username and email](#markdown-header-configure-git-username-and-email)
    * [Git hooks](#markdown-header-git-hooks)
    * [Git flow](#markdown-header-git-flow)
    * [Remove your remote branches](#markdown-header-remove-your-remote-branches)

# Deploy Locally <a id="markdown-header-deploy-locally"></a>

## Prerequisite <a id="markdown-header-prerequisite"></a>

Project uses Docker, before continue, make sure Docker is installed on you host machine.

Once docker is installed please implement all
[post install steps](https://docs.docker.com/install/linux/linux-postinstall/)

## Build app <a id="markdown-header-build-app"></a>

Run the following command on your host machine in root directory to build the projects:

```shell
make build

# Configure git prepush
make setup
```

This command will download, build all the needed images and run containers, including:

* Node
* Database
* Test Database - only for dev needs, used during tests running instead of the original database.
* SFTP Server - only for dev needs as an analogue for the prod SFTP servers on AWS
* Mailer - only for dev needs, SMTP server which catches any message sent to it to display in a web interface

Database will be created and populated with demo fixtures automatically.

## [Optional] Create docker-compose.override.yml <a name="markdown-header-setup-locally-docker-compose-override"></a>

If you want to specify ports, please create docker-compose.override.yml e.g:

```yaml
version: "3.9"

services:
  db:
    ports:
      -   target: 3306
          published: 5333
          protocol: tcp
```

## Run a project <a id="markdown-header-run-a-project"></a>
Run the following command on your host machine:

```shell
make run
```

The command will start all services.

## Check if it works <a id="markdown-header-check-if-it-works"></a>
* [http://localhost:3000](http://localhost:3000)

## Database installation <a id="markdown-header-database-installion"></a>
Within the docker configuration two databases are setup, for a development and tests. 

### Development Database
The seeders for the development will run upon running

```
make run
```

However if you would like to reinstall the database, run:

```
make db-reinstall
```

### Test Database
The seeders that the test database require are not the same as the development database. Thus, in order to prepare the test database for appropriate testing you must run:

```
make db-test-install
```


## Obtain a JWT token <a name="setup-locally-obtain-a-jwt-token"></a>

### Swagger - Development
After running <i>make run</i> open http://localhost:3000/ in any web browser, access the jwt section inside the module and supply a valid user email and password. The resulting status will be 201 and the response data will contain the user_id, expiration in seconds, token and refresh token.

# Docker troubleshooting <a id="markdown-header-docker-trubleshooting"></a>
At first check if Docker has been [installed](https://docs.docker.com/install/linux/docker-ce/ubuntu/) correctly,
and you have implemented all [post install steps](https://docs.docker.com/install/linux/linux-postinstall/).
And please make sure, that current user has been added into the 'docker' group
and port forwarding in your OS has been enabled (`$ sysctl net.ipv4.ip_forward`).

Please check if you have docker installed as a service and if it is running.

Didn't help? Have you tried turning it off and on again? Like these:

```
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d --force-recreate
```

To debug you may run shell from the container:

```shell
docker exec -it XXX sh
```

To get the list of images:

```shell
docker container ls [-a]
# or
docker ps [-a]
```

Both commands show all containers. Without '-a' key you may see only running containers.

To remove all unused images:

```shell
docker system prune
```

To display logs of container XXX:

```shell
docker logs XXX
```

TODO: add when Mailer will be implemented

## Mailer <a id="markdown-header-mailer"></a>

Locally we have a [mailer](https://mailcatcher.me/) container, a super simple SMTP server which catches any message sent to it to display in a web interface.

By default, Mailer Web interface can be accessed through [http://localhost:1080](http://localhost:1080).

# Code Quality <a id="markdown-header-code-quality"></a>

## Static Analysis tools and linters <a id="markdown-header-static-analysis-tools-and-linters"></a>

To run all code quality checkers and tests by one command, run

```bash
make analyse
```

To run all linters by one command, run

```bash
make lint-check
```

## Tests <a id="markdown-header-tests"></a>

### Usage <a id="markdown-header-tests-usage"></a>

First, you should create a test database with all tables (you can use this command to re-create test db as well):

```shell
make db-test-install
```

To run all tests, run

```shell
make tests
```


# Working with Git <a id="markdown-header-working-with-git"></a>

The project uses `git flow` branching model. If you are not familiar with it,
please read this article http://nvie.com/posts/a-successful-git-branching-model/

## Requirements <a id="markdown-header-requirements"></a>
* Feature branch MUST contain an issue ID form JIRA, e.g. `feature/EP-??`, `-x-y-z` is optional part.
* Bug fix branch MUST contain an issue ID from JIRA, e.g. `bugfix/EP-??` if it requires many changes
* Small bug fixes, related to one feature (NST-111), can be grouped into one branch: `bugfix/EP-??`.
  For each fixed bug add a separate commit with corresponded issue ID at the beginning of the message.

* Commit message MUST contain an issue ID at the beginning of the message, e.g.


* Commit message SHOULD have a detailed message about what was done.

How to write good commit messages?
Read this article http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html

## Why having an issue ID is important <a id="markdown-header-why-having-an-issue-id-is-important"></a>

Bitbucket has a deep integration with JIRA, and all issue IDs are clickable and are links to corresponded tasks in JIRA.
At the same time, there is a section in JIRA ticket that displays existing Branches and commits for this task.

## Configure git username and email <a id="markdown-header-configure-git-username-and-email"></a>
* `git config --global user.email "your.name@itransition.com"`
* `git config --global user.name "Surname, Name"`

## Git hooks <a id="markdown-header-git-hooks"></a>
`pre-push` hook will check that your code is not broken **before** it is pushed to the remote repository.

However, there are some cases where such checks should be skipped, e.g.:

* When you're rebasing your branch and want to push to origin
* When you remove your branch from the remote repository

In such cases, it's possible to turn off git hooks temporarily using `--no-verify` option.

* `git push origin HEAD --no-verify --force-with-lease` - pushes a current branch to origin without executing git hooks
* `git push origin --delete --no-verify feature/EP-XXX` - removes a remote branch without executing git hooks

## Git flow <a id="markdown-header-git-flow"></a>
When you have more than 1 commit in your feature branch, they SHOULD be
[squashed](https://stackoverflow.com/questions/5189560/squash-my-last-x-commits-together-using-git)
before merging to main locally.

The typical git workflow looks like:

```shell
# start a new feature branch from main
git checkout -b feature/EP-1

# commit your changes
git commit -m "EP-1 Detailed message"

# create pull request

# Before merging to main, rebase and squash all commits into one (should be done by default)
# except case when you have a reason to leave separate commits in the history
git checkout main
git pull --rebase
git checkout feature/EP-1
git rebase main -i

# push squashed branch to remote
git push origin --force-with-lease feature/EP-1

# merge with --no-ff in case you want to leave a merge commit and your reasonable commits in a history as a parallel branch
git checkout main
git merge feature/EP-1 --no-ff

git push origin main # at this moment, the status of PR will be automatically changes to "Merged"

# (!) and finally remove your branch
git push origin --delete feature/EP-1
git branch -d feature/EP-1
```

Option `--no-ff` creates additional merge commit during merging process.
Git history will have 2 new commits - your origin one and merge commit.

(!) Always rebase your branch on fresh `main` before merging your PR.

## Remove your remote branches <a id="markdown-header-remove-your-remote-branches"></a>
Old branches pollute the repository. Remove branches when they are merged to `main`.
