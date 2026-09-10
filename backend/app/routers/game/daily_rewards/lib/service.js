const { randomInt } = require('crypto');
const { Types } = require('mongoose');

function dayWindow(now) {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  return { start, end: new Date(start.getTime() + 86400000) };
}

// Read the current chip-package catalogue so new shop packages join the pool automatically.
function prizePool(items) {
  return (Array.isArray(items) ? items : []).filter((item) => item
    && Number.isSafeInteger(Number(item.nChips)) && Number(item.nChips) > 0
    && Number(item.nPrice) > 0).map((item) => ({
    sTitle: String(item.sTitle || 'Chip package'), nChips: Number(item.nChips),
    sShopItemId: String(item._id || item.sTitle || item.nPrice),
  }));
}

function createDailyRewardService({ User, Setting, Transaction, clock = () => new Date(), choose = randomInt }) {
  async function pool() {
    const settings = await Setting.findOne({}, { aShop: 1 }).lean();
    return prizePool(settings?.aShop);
  }
  // A stable ID in the atomic claim snapshot permits idempotent ledger repair.
  async function record(user) {
    const prize = user?.oDailyReward;
    if (!prize?.iTransactionId) return;
    await Transaction.updateOne({ _id: prize.iTransactionId }, { $setOnInsert: {
      iUserId: user._id, nAmount: prize.nChips, nPreviousChips: prize.nPreviousChips,
      nNewChips: prize.nNewChips, dExecuteDate: user.dLastRewardClaimDate,
      eType: 'credit', eMode: 'DR', eStatus: 'Success',
      sDescription: `Daily shop prize: ${prize.sTitle}`,
    } }, { upsert: true });
  }
  function status(user, prizes, now) {
    const { start, end } = dayWindow(now);
    const claimed = Boolean(user?.dLastRewardClaimDate && new Date(user.dLastRewardClaimDate) >= start);
    const prize = claimed && user?.oDailyReward;
    return { prizes, bTodayRewardClaimed: claimed,
      prize: prize ? { sTitle: prize.sTitle, nChips: prize.nChips } : null,
      dServerNow: now, dNextClaimAt: end, dClaimWindowEndsAt: end };
  }
  return {
    async preview() { return status(null, await pool(), clock()); },
    async get(id) {
      const user = await User.findById(id).lean();
      try { await record(user); } catch (error) { console.error('Daily prize ledger repair pending', error.message); }
      return status(user, await pool(), clock());
    },
    async claim(id) {
      const prizes = await pool();
      if (!prizes.length) return { unavailable: true };
      const now = clock();
      const { start } = dayWindow(now);
      // Do not replace yesterday's durable snapshot until its ledger entry is written.
      await record(await User.findById(id).lean());
      const prize = { ...prizes[choose(prizes.length)], iTransactionId: new Types.ObjectId() };
      const user = await User.findOneAndUpdate({ _id: id, $or: [
        { dLastRewardClaimDate: { $lt: start } }, { dLastRewardClaimDate: null },
      ] }, [{ $set: {
        nChips: { $add: [{ $ifNull: ['$nChips', 0] }, prize.nChips] },
        dLastRewardClaimDate: now,
        oDailyReward: { $mergeObjects: [{ $literal: prize }, {
          nPreviousChips: { $ifNull: ['$nChips', 0] },
          nNewChips: { $add: [{ $ifNull: ['$nChips', 0] }, prize.nChips] },
        }] },
      } }], { new: true }).lean();
      if (!user) return { alreadyClaimed: true };
      // The credit already succeeded. Never report a failed claim for a ledger outage.
      try { await record(user); } catch (error) { console.error('Daily prize ledger repair pending', error.message); }
      return { ...status(user, prizes, now), reward: prize.nChips, nChips: user.nChips };
    },
  };
}
module.exports = { createDailyRewardService, dayWindow, prizePool };
