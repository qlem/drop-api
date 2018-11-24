# Drop's API
API built using GraphQL and Prisma.io

**Requirements**
 - docker installed and started
 - [docker-compose](https://docs.docker.com/compose/install/)
 - node
 - npm (installed with node)
 - [prisma cli](https://www.prisma.io/docs/prisma-cli-and-configuration/using-the-prisma-cli-alx4/)
```
$ npm install -g prisma
```

**Installation**
```
$ git clone ssh://git@phabricator.drop.run/source/api.git
$ cd api_drop
$ npm intall
$ cd prisma
$ docker-compose up -d
$ prisma deploy --env-file ../.env
```

**Run**
```
$ npm start
```

**GraphQL Playground**
 - API http://localhost:4000
 - Prisma service http://localhost:4467

The playground of the prisma service requires an authentication token to access its API:
```
$ prisma token --env-file ../.env
```
Then copy/paste the generated token into the HTTP HEADERS section of the playground like this
```
{
  "Authorization": "Bearer token"
}
```

**Development**
 - never work directly on `master` branch! (see [review and push workflow](https://phabricator.drop.run/w/review/))
 - for each new feature/tasks/change/fix whatever it is, you have to create a new branch from `master` and work on it!
 - use ES6 synthax (thank to Babel)
 - respect the ESLint and StandardJS rules (with WebStorm you can enable IDE [highlight](https://www.jetbrains.com/help/webstorm/eslint.html))
 - after each change to the data models (datamodel.prisma) be sure to run `$ prisma deploy --env-file ../.env` (in prisma/ directory)
 - API's queries, mutations and subscriptions are exposed in the playground (open the SCHEMA tab on the right)
 - API authentication

generate a valid token through mutations such as `login` or `signup` then copy/paste it into the HTTP HEADERS section of the playground like this
```
{
  "Authorization": "Bearer token"
}
```

**Update prisma container**

Because Prisma release frequently new updates we need to install these new updates to stay up to date and enjoy the new features.
Each time we update Prisma, the previous prisma docker container need do be deleted and the new one pulled and run.
First step stop the server if it's running (started by `npm start`)
```
$ docker ps -a
```
This command list all installed containers.
Look for a docker named drop-prisma (last column) and copy its container ID (first column)
```
$ docker stop container_ID
$ docker rm container_ID
$ cd path/to/api_drop/prisma
$ docker-compose up -d
```

note: the above steps does not impact the database and its data
