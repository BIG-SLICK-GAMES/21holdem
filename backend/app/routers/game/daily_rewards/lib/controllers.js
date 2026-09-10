const { User, Setting, Transaction } = require('../../../../models');
const { createDailyRewardService } = require('./service');
const service = createDailyRewardService({ User, Setting, Transaction });
module.exports = {
  async previewDailyRewards(req, res) {
    try { return res.reply(messages.success(), await service.preview()); }
    catch (error) { console.error(error); return res.reply(messages.server_error('daily rewards')); }
  },
  async getDailyRewards(req, res) {
    try { return res.reply(messages.success(), await service.get(req.user._id)); }
    catch (error) { console.error(error); return res.reply(messages.server_error('daily rewards')); }
  },
  async claimDailyReward(req, res) {
    try {
      const result = await service.claim(req.user._id);
      if (result.unavailable) return res.status(503).json({ message: 'Daily prizes are being restocked. Please try again soon.' });
      if (result.alreadyClaimed) return res.reply(messages.custom.daily_reward_already_claimed);
      return res.reply(messages.custom.daily_reward_claimed, result);
    } catch (error) { console.error(error); return res.reply(messages.server_error('daily rewards')); }
  },
};
