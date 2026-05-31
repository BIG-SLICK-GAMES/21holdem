require('dotenv').config();
require('../../../globals');

const { mongodb } = require('..');
const systemBots = require('./system-bots');

(async () => {
  try {
    await mongodb.initialize();
    const bots = await systemBots.ensureSystemBotUsers();

    console.log(`Ensured ${bots.length} bot accounts.`);
    for (const bot of bots) {
      console.log(`${bot.sUserName} :: ${bot.oBotProfile?.sLabel || bot.oBotProfile?.sStyle || 'Balanced'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
