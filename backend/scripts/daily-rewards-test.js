const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { createDailyRewardService, prizePool, dayWindow } = require('../app/routers/game/daily_rewards/lib/service');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const suffix = new mongoose.Types.ObjectId().toString();
  const User = mongoose.model(`reward_qa_user_${suffix}`, new mongoose.Schema({ nChips: Number, dLastRewardClaimDate: Date, oDailyReward: Object }));
  const Transaction = mongoose.model(`reward_qa_tx_${suffix}`, new mongoose.Schema({}, { strict: false }));
  let items = [{ sTitle: 'First', nChips: 100, nPrice: 1 }];
  let now = new Date('2026-09-11T23:59:59Z');
  const Setting = { findOne: () => ({ lean: async () => ({ aShop: items }) }) };
  const service = createDailyRewardService({ User, Setting, Transaction, clock: () => now, choose: (length) => length - 1 });
  try {
    assert.equal(prizePool([null, {nChips: -1, nPrice: 1}, {nChips: 1.5, nPrice: 1}]).length, 0);
    assert.equal(dayWindow(now).end.toISOString(), '2026-09-12T00:00:00.000Z');
    const user = await User.create({ nChips: 1000 });
    const results = await Promise.all(Array.from({ length: 20 }, () => service.claim(user._id)));
    assert.equal(results.filter((r) => r.reward === 100).length, 1, 'one winner across twenty concurrent claims');
    assert.equal((await User.findById(user._id)).nChips, 1100);
    assert.equal(await Transaction.countDocuments(), 1);
    assert.equal((await service.get(user._id)).prize.sTitle, 'First');
    assert.equal((await service.claim(user._id)).alreadyClaimed, true);
    now = new Date('2026-09-12T00:00:00Z');
    items.push({ sTitle: 'New shop package', nChips: 500, nPrice: 2 });
    assert.equal((await service.preview()).prizes.length, 2);
    const [next] = await Promise.all([service.claim(user._id), User.updateOne({ _id: user._id }, { $inc: { nChips: 77 } })]);
    assert.equal(next.prize.sTitle, 'New shop package');
    assert.equal((await User.findById(user._id)).nChips, 1677, 'concurrent balance change preserved');
    const legacy = await User.create({ nChips: 10, dLastRewardClaimDate: now });
    assert.equal((await service.claim(legacy._id)).alreadyClaimed, true, 'old calendar claims respected');
    now = new Date('2026-09-13T00:00:00Z');
    items = [];
    assert.equal((await service.claim(user._id)).unavailable, true);
    assert.equal((await User.findById(user._id)).nChips, 1677);
    items = [{ sTitle: 'Repair test', nChips: 50, nPrice: 1 }];
    const interrupted = createDailyRewardService({ User, Setting, Transaction: { updateOne: async () => { throw new Error('simulated ledger outage'); } }, clock: () => now, choose: () => 0 });
    const fresh = await User.create({ nChips: 0 });
    assert.equal((await interrupted.claim(fresh._id)).reward, 50);
    await service.get(fresh._id);
    await service.get(fresh._id);
    assert.equal(await Transaction.countDocuments({ iUserId: fresh._id }), 1, 'repair is idempotent');
    assert.equal((await User.findById(fresh._id)).nChips, 50);
    console.log('PASS: concurrent claims, balance increments, UTC rollover, live catalogue, old claims, empty shop, ledger repair');
  } finally {
    await User.collection.drop(); await Transaction.collection.drop(); await mongoose.disconnect();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
