# Graceful Shutdown

## Summary
This is a decorator for an Express http server enabling its graceful shutdown.

Based on ideas from:

1) [express-graceful-shutdown middleware](https://github.com/serby/express-graceful-shutdown), which in turn used [this blog post](http://blog.argteam.com/coding/hardening-node-js-for-production-part-3-zero-downtime-deployments-with-nginx) for inspiration;

2) [http-shutdown module](https://github.com/thedillonb/http-shutdown)

## Installation

`npm install @azangru/with-express-graceful-shutdown --save`

## Usage

```javascript
const withGracefulShutdown = require('@azangru/with-express-graceful-shutdown');
const app = require('./app'); // a regular Express app
const logger = require('./logger') // a custom logger

const expressPort = 3000;
const forceTimout = 30 * 1000; // timeout after which the app should be shut down forcefully

const options = {
  logger,
  forceTimout
}

const server = app.listen(expressPort, () => {
  // your server is running
});

withGracefulShutdown(server, options);
```

## Options

- `logger`: a logger that provides `info`, `warn`, and `error` functions for recording graceful shutdown. Default: `console`.

- `forceTimeout`: number of milliseconds to wait for server.close() to complete before calling process.exit(1). Default: 60000.
