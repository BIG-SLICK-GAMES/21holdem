const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { createCosmeticService, catalog } = require('../app/routers/game/shop/lib/cosmetic-service');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const suffix = new mongoose.Types.ObjectId().toString();
  const User = mongoose.model(`cosmetic_qa_user_${suffix}`, new mongoose.Schema({ nChips: Number, aCosmeticPurchases: [Object], sTableTheme: String }));
  const Transaction = mongoose.model(`cosmetic_qa_tx_${suffix}`, new mongoose.Schema({}, { strict: false }));
  const service = createCosmeticService({ User, Transaction });
  try {
    assert.equal(catalog.length, 5);
    assert.ok(catalog.every(item => item.price === 500));
    const user = await User.create({ nChips: 1500 });
    await Promise.all(Array.from({ length: 20 }, () => service.buy(user._id, catalog[0].id)));
    assert.equal((await service.get(user._id)).chips, 1000);
    assert.equal((await service.get(user._id)).owned.length, 1);
    assert.equal(await Transaction.countDocuments({ iUserId: user._id }), 1);
    const tx = await Transaction.findOne({ iUserId: user._id }).lean();
    assert.equal(tx.nPreviousChips, 1500);
    assert.equal(tx.nNewChips, 1000);
    await assert.rejects(service.buy(user._id, 'invalid'), /Unknown/);
    await assert.rejects(service.equip(user._id, catalog[1].id), /Purchase/);
    assert.equal((await service.equip(user._id, catalog[0].id)).equipped, catalog[0].id);
    assert.equal((await service.equip(user._id, '')).equipped, '');
    const limited = await User.create({ nChips: 500 });
    const race = await Promise.allSettled([service.buy(limited._id, catalog[0].id), service.buy(limited._id, catalog[1].id)]);
    assert.equal(race.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal((await service.get(limited._id)).chips, 0);
    const interrupted = createCosmeticService({ User, Transaction: { updateOne: async () => { throw new Error('simulated ledger outage'); } } });
    await interrupted.buy(user._id, catalog[1].id);
    await service.get(user._id);
    await service.get(user._id);
    assert.equal(await Transaction.countDocuments({ iUserId: user._id }), 2);
    assert.equal((await service.get(user._id)).chips, 500);
    console.log('PASS: catalogue prices, concurrent purchase deduplication, balance snapshots, insufficient funds, ownership, equip/reset, ledger repair');
  } finally {
    await User.collection.drop(); await Transaction.collection.drop(); await mongoose.disconnect();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
