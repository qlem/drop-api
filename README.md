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
 - Prisma service http://localhost:4466
   requires a token:
   `$ prisma token --env-file ../.env`
   Then copy/paste the generated token in the HTTP HEADERS section of the playground
   ```
   {
     "Authorization": "Bearer __token__"
   }
   ```

**Development**
 - use ES6 synthax (thank to Babel)
 - respect the ESLint and StandardJS rules (with WebStorm you can enable IDE [highlight](https://www.jetbrains.com/help/webstorm/eslint.html))
 - after each change to the data models (datamodel.prisma) be sure to run `$ prisma deploy --env-file ../.env` (in prisma/ directory)