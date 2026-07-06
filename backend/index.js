require('dotenv').config();
require('./globals');

const { mongodb, redis, queue } = require('./app/utils');
const router = require('./app/routers');
const socket = require('./app/sockets');
const _ = require('./globals/lib/helper');

const requiredEnv = ['PORT', 'MONGO_URI', 'REDIS_HOST', 'REDIS_PORT', 'APP_ENV', 'GAME_ID'];
const missingEnv = requiredEnv.filter(name => !process.env[name]);

if (missingEnv.length) {
  throw new Error(`Missing required environment variables: ${missingEnv.join(', ')}`);
}

(async () => {
  try {
    await mongodb.initialize();
    await redis.initialize();
    router.initialize();
    queue.initialize();
    socket.initialize(router.httpServer);
    require('./app/game/boardManager').flushStuckBoards().catch(error => {
      log.red(`flushStuckBoards background error: ${error.message || error}`);
    });
  } catch (err) {
    log.blue(':-(');
    log.red(`reason: ${err.message}, stack: ${err.stack}`);
    process.exit(1);
  }
})();

log.cyan(`APP_ENV ${process.env.APP_ENV}, GAME_ID ${process.env.GAME_ID}, PORT ${process.env.PORT}`);

log.cyan(`NODE_ENV ${process.env.NODE_ENV} 🌱,PORT ${process.env.PORT}`);

// log.magenta('Password:', _.encryptPassword('qweR123#'));
