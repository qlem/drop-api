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
$ prisma deploy
```

**Run**
```
$ npm start
```

**GraphQL Playground**
open a browser and go to http://localhost:4000

**Development**
 - use ES6 synthax (thank to Babel)
 - respect the ESLint and StandardJS rules (with WebStorm you can enable IDE [highlight](https://www.jetbrains.com/help/webstorm/eslint.html))
 - after each change to the data models (_datamodel.prisma_) be sure to run `$ prisma deploy`