const http = require('http');
const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const createSocketServer = require('./config/socket');
const initSocket = require('./socket');

const server = http.createServer(app);
const io = createSocketServer(server);
initSocket(io);

// Controllers reach the socket instance via req.app.get('io')
app.set('io', io);

server.listen(env.PORT, () => {
  logger.info(`CMS backend listening on port ${env.PORT} [${env.NODE_ENV}]`);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});
