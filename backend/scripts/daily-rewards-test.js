const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { createDailyRewardService, prizePool, dayWindow, nextAnnualDate } = require('../app/routers/game/daily_rewards/lib/service');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const suffix = new mongoose.Types.ObjectId().toString();
  const User = mongoose.model(`reward_qa_user_${suffix}`, new mongoose.Schema({ nChips: Number, dLastRewardClaimDate: Date, oDailyReward: Object }));
  const Transaction = mongoose.model(`reward_qa_tx_${suffix}`, new mongoose.Schema({}, { strict: false }));
  const Jackpot = mongoose.model(`reward_qa_jackpot_${suffix}`, new mongoose.Schema({ _id: String }, { strict: false }));
  let items = [{ sTitle: 'First', nChips: 100, nPrice: 1 }];
  let now = new Date('2026-09-11T23:59:59Z');
  const Setting = { findOne: () => ({ lean: async () => ({ aShop: items }) }) };
  const service = createDailyRewardService({ User, Setting, Transaction, Jackpot, clock: () => now, choose: (length) => length - 1 });
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
    assert.equal((await service.preview()).prizes.length, 1);
    const [next] = await Promise.all([service.claim(user._id), User.updateOne({ _id: user._id }, { $inc: { nChips: 77 } })]);
    assert.equal(next.prize.sTitle, 'First');
    assert.equal((await User.findById(user._id)).nChips, 1277, 'concurrent balance change preserved');
    const legacy = await User.create({ nChips: 10, dLastRewardClaimDate: now });
    assert.equal((await service.claim(legacy._id)).alreadyClaimed, true, 'old calendar claims respected');
    now = new Date('2026-09-13T00:00:00Z');
    items = [];
    assert.equal((await service.claim(user._id)).unavailable, true);
    assert.equal((await User.findById(user._id)).nChips, 1277);
    items = [{ sTitle: 'Repair test', nChips: 50, nPrice: 1 }];
    const interrupted = createDailyRewardService({ User, Setting, Transaction: { updateOne: async () => { throw new Error('simulated ledger outage'); } }, clock: () => now, choose: () => 0 });
    const fresh = await User.create({ nChips: 0 });
    assert.equal((await interrupted.claim(fresh._id)).reward, 50);
    await service.get(fresh._id);
    await service.get(fresh._id);
    assert.equal(await Transaction.countDocuments({ iUserId: fresh._id }), 1, 'repair is idempotent');
    assert.equal((await User.findById(fresh._id)).nChips, 50);
    items = [50000, 15000, 5000, 100000].map((nChips) => ({ sTitle: String(nChips), nChips, nPrice: 1 }));
    assert.deepEqual(prizePool(items).map((p) => p.nChips), [5000, 50000]);
    assert.deepEqual(prizePool([{ nChips: 50000, nPrice: 1 }]), []);
    assert.equal(nextAnnualDate(new Date('2028-02-29T12:00:00Z')).toISOString(), '2029-02-28T12:00:00.000Z');
    const lucky = createDailyRewardService({ User, Setting, Transaction, Jackpot, clock: () => now, choose: (range) => { assert.equal(range, 10000); return 0; } });
    const players = await User.create(Array.from({ length: 20 }, () => ({ nChips: 0 })));
    const awards = await Promise.all(players.map((p) => lucky.claim(p._id)));
    assert.equal(awards.filter((r) => r.reward === 50000).length, 1, 'one global jackpot across simultaneous players');
    assert.equal(awards.filter((r) => r.reward === 5000).length, 19);
    assert.equal(await Transaction.countDocuments({ nAmount: 50000 }), 1);
    now = new Date('2027-09-12T23:59:59.999Z');
    assert.equal((await lucky.claim(players[0]._id)).reward, 5000, 'locked until exact anniversary');
    now = new Date('2027-09-13T00:00:00Z');
    assert.equal((await lucky.claim(players[0]._id)).reward, 50000, 'eligible again at anniversary');
    assert.equal((await lucky.claim(players[0]._id)).alreadyClaimed, true);
    // Exhaust all 10,000 RNG buckets through the real selection path with an isolated fake gate/user.
    let bucket = 0;
    let attempts = 0;
    const fakeUser = { findById: () => ({ lean: async () => ({ _id: user._id }) }), findOneAndUpdate: (_filter, update) => ({ lean: async () => {
      const prize = update[0].$set.oDailyReward.$mergeObjects[0].$literal;
      return { _id: user._id, nChips: prize.nChips, dLastRewardClaimDate: now, oDailyReward: prize };
    } }) };
    const odds = createDailyRewardService({ User: fakeUser, Setting, Transaction: { updateOne: async () => {} },
      Jackpot: { findOneAndUpdate: () => { attempts += 1; return { lean: async () => ({}) }; }, updateOne: async () => {} },
      clock: () => now, choose: (range) => { assert.equal(range, 10000); return bucket; } });
    let small = 0;
    for (bucket = 0; bucket < 10000; bucket += 1) {
      if ((await odds.claim(user._id)).reward === 5000) small += 1;
    }
    assert.equal(small, 9999);
    assert.equal(attempts, 1);
    await Jackpot.deleteOne({ _id: 'daily-50000' });
    const losingRace = createDailyRewardService({
      User: { ...fakeUser, findOneAndUpdate: () => ({ lean: async () => null }) },
      Setting, Transaction, Jackpot, clock: () => now, choose: () => 0,
    });
    assert.equal((await losingRace.claim(user._id)).alreadyClaimed, true);
    assert.equal(await Jackpot.countDocuments(), 0, 'confirmed lost claim releases reservation');
    const uncertainCredit = createDailyRewardService({
      User: { ...fakeUser, findOneAndUpdate: () => ({ lean: async () => { throw new Error('unknown credit outcome'); } }) },
      Setting, Transaction, Jackpot, clock: () => now, choose: () => 0,
    });
    await assert.rejects(uncertainCredit.claim(user._id), /unknown credit outcome/);
    assert.equal((await Jackpot.findById('daily-50000').lean()).bPending, true);
    // An unresolved credit must hold the gate even beyond its original anniversary.
    now = new Date('2030-09-13T00:00:00Z');
    assert.equal((await lucky.claim(players[1]._id)).reward, 5000);
    console.log('PASS: daily concurrency, balances, rollover, catalogue, ledger repair, 9999/10000 odds, global jackpot concurrency, annual boundary, pending gate');
  } finally {
    await User.collection.drop(); await Transaction.collection.drop(); await Jackpot.collection.drop().catch(() => {}); await mongoose.disconnect();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
