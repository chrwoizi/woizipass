# woizipass

A personal lightweight password manager.

The development progress is being documented on [Trello](https://trello.com/b/nlZMaXPm/woizipass).

![list of credentials](docs/woizipass.png 'list of credentials')

## Launch in development mode

- set the environment variable JWT_SECRET to a secret password of arbitrary length.
- npm run start:api
- npm run start:client
- navigate to [http://localhost:4200](http://localhost:4200)

## Deploy

- set the environment variable JWT_SECRET to a secret password of arbitrary length.
- deploy on docker (using the [Dockerfile](Dockerfile)).
