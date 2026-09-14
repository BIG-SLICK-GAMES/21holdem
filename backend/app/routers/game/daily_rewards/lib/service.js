const { randomInt } = require('crypto');
const { Types } = require('mongoose');

function dayWindow(now) {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  return { start, end: new Date(start.getTime() + 86400000) };
}

// Only the smallest pack and the 50,000-chip jackpot are daily prizes.
function prizePool(items) {
  const packs = (Array.isArray(items) ? items : []).filter((item) => item
    && Number.isSafeInteger(Number(item.nChips)) && Number(item.nChips) > 0
    && Number(item.nPrice) > 0).map((item) => ({
    sTitle: String(item.sTitle || 'Chip package'), nChips: Number(item.nChips),
    sShopItemId: String(item._id || item.sTitle || item.nPrice),
  }));
  packs.sort((a, b) => a.nChips - b.nChips);
  const smallest = packs[0];
  // Never allow the jackpot to become an unrestricted fallback if small packs disappear.
  if (!smallest || smallest.nChips >= 50000) return [];
  const jackpot = packs.find((item) => item.nChips === 50000);
  return jackpot ? [smallest, jackpot] : [smallest];
}

function nextAnnualDate(now) {
  const next = new Date(now);
  next.setUTCFullYear(next.getUTCFullYear() + 1);
  // Clamp February 29 to February 28 the following year.
  if (next.getUTCMonth() !== now.getUTCMonth()) next.setUTCDate(0);
  return next;
}

function createDailyRewardService({ User, Setting, Transaction, Jackpot, clock = () => new Date(), choose = randomInt }) {
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
      sOddsDescription: 'Smallest chip pack: at least 99.99%. 50,000 chips: 0.01% while eligible, limited to one award across all players per 12 months. Otherwise the smallest pack is guaranteed. An annual winner is not guaranteed.',
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
      const previous = await User.findById(id).lean();
      if (!previous || (previous.dLastRewardClaimDate && new Date(previous.dLastRewardClaimDate) >= start)) return { alreadyClaimed: true };
      await record(previous);
      const claimId = new Types.ObjectId();
      let reserved = false;
      if (prizes.length > 1 && choose(10000) === 0) {
        // The unique singleton ID prevents simultaneous winners across API processes.
        // On an ambiguous database failure keep the reservation: never risk a second payout.
        try {
          reserved = Boolean(await Jackpot.findOneAndUpdate({
            _id: 'daily-50000', bPending: { $ne: true }, dNextEligibleAt: { $lte: now },
          }, { $set: { iClaimId: claimId, iUserId: id, bPending: true, dReservedAt: now, dNextEligibleAt: nextAnnualDate(now) } },
          { upsert: true, new: true }).lean());
        } catch (error) { if (error.code !== 11000) throw error; }
      }
      const prize = { ...prizes[reserved ? 1 : 0], iTransactionId: claimId };
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
      if (!user) {
        // A confirmed lost daily-claim race credited nothing; release only our own gate.
        if (reserved) await Jackpot.deleteOne({ _id: 'daily-50000', iClaimId: claimId });
        return { alreadyClaimed: true };
      }
      // The credit already succeeded. Never report a failed claim for a ledger outage.
      if (reserved) {
        try {
          await Jackpot.updateOne({ _id: 'daily-50000', iClaimId: claimId }, {
            $set: { bPending: false, dNextEligibleAt: nextAnnualDate(clock()) },
          });
        } catch (error) { console.error('Daily jackpot gate needs reconciliation', error.message); }
      }
      try { await record(user); } catch (error) { console.error('Daily prize ledger repair pending', error.message); }
      return { ...status(user, prizes, now), reward: prize.nChips, nChips: user.nChips };
    },
  };
}
module.exports = { createDailyRewardService, dayWindow, prizePool, nextAnnualDate };
