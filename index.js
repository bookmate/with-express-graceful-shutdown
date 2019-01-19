function withGracefulShutdown(server, options = {}) {
  const {
    logger = console,
    forceTimeout = 60 * 1000 // time in milliseconds allowed for the app to shut down gracefully
  } = options;

  let isShuttingDown = false;

  const connections = {};
  let connectionCounter = 0;

  function destroy(socket, force) {
    if (force || (socket._isIdle && isShuttingDown)) {
      socket.destroy();
      delete connections[socket._connectionId];
    }
  }

  server.on('request', function(req, res) {
    req.socket._isIdle = false;

    res.on('finish', function() {
      req.socket._isIdle = true;
      destroy(req.socket);
    });
  });

  server.on('connection', function(socket) {
    const id = connectionCounter++;
    socket._isIdle = true;
    socket._connectionId = id;
    connections[id] = socket;

    socket.on('close', function() {
      delete connections[id];
    });
  });

  function shutdown(force, cb) {
    isShuttingDown = true;
    server.close(function(err) {
      if (cb) {
        process.nextTick(function() { cb(err); });
      }
    });

    Object.keys(connections).forEach(function(key) {
      destroy(connections[key], force);
    });
  }

  server.shutdown = function(cb) {
    shutdown(false, cb);
  };

  server.forceShutdown = function(cb) {
    shutdown(true, cb);
  };


  process.on('SIGTERM', gracefulExit); // listen for TERM signal (e.g. kill)
  process.on ('SIGINT', gracefulExit); // listen for INT signal (e.g. Ctrl-C)

  function gracefulExit() {

    // Don't bother with graceful shutdown in development to speed up round trip
    if (process.env.NODE_ENV === 'development') return process.exit(1);

    if (isShuttingDown) return;

    isShuttingDown = true;
    logger.warn('Received kill signal (SIGTERM), shutting down');

    setTimeout(function () {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, forceTimeout);

    server.shutdown(function () {
      logger.info('Closed out remaining connections.');
      process.exit();
    });

  }

}

module.exports = withGracefulShutdown;
