# API Drop
API built using GraphQL and Prisma.io

##### Requirements

 - docker installed and started
 - [docker-compose](https://docs.docker.com/compose/install/)
 - node
 - npm (installed with node)
 - [prisma cli](https://www.prisma.io/docs/prisma-cli-and-configuration/using-the-prisma-cli-alx4/)
```
$ npm install -g prisma
```

##### Installation
```
$ git clone ssh://git@phabricator.drop.run/source/api_drop.git
$ cd drop_api
$ npm intall
$ cd prisma
$ docker-compose up -d
$ prisma deploy
```

##### Run
```
$ npm start
```

##### GraphQL Playground
open a browser and go to http://localhost:4000
