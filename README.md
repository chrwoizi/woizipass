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

## Chrome extension

- Open the extension manager in Chrome
- Enable developer mode
- Click on "Load unpacked extension"
- Select /chrome from this repository
- Pin the extension in the extension bar next to the url bar
- Right click the extension icon and select Options
- Set the woizipass url (e.g. https://woizipass.com)
- Click the extension icon on any web page to show your woizipass credentials for that page
  - For example, on https://kabel.vodafone.de/any-page all credentials with provider name kabel.vodafone.de, vodafone.de, or vodafone will be shown.
