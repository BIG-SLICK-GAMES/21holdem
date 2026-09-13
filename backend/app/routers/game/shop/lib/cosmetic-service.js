const mongoose = require('mongoose');
const catalog = require('./cosmetics.json');

function createCosmeticService({ User, Transaction }) {
  const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
  const findItem = id => catalog.find(item => item.id === id) || fail('Unknown table theme.');
  async function inventory(user) {
    if (!user) fail('Account not found.', 404);
    for (const purchase of user.aCosmeticPurchases || []) {
      try {
        await Transaction.updateOne({ _id: purchase.transactionId }, { $setOnInsert: {
          iUserId: user._id, nAmount: 500, nPreviousChips: purchase.previousChips,
          nNewChips: purchase.previousChips - 500, dExecuteDate: purchase.date,
          eType: 'debit', eMode: 'user', eStatus: 'Success',
          sDescription: `Table and room theme: ${purchase.id}`,
        } }, { upsert: true });
      } catch (error) { console.error('Cosmetic ledger repair pending:', error.message); }
    }
    return { owned: (user.aCosmeticPurchases || []).map(item => item.id), equipped: user.sTableTheme || '', chips: user.nChips };
  }
  return {
    get: async userId => inventory(await User.findById(userId).lean()),
    async buy(userId, id) {
      const item = findItem(id);
      const purchase = { id: item.id, transactionId: new mongoose.Types.ObjectId(), date: new Date() };
      const updated = await User.findOneAndUpdate({ _id: userId, nChips: { $gte: item.price }, 'aCosmeticPurchases.id': { $ne: item.id } }, [{ $set: {
        nChips: { $subtract: ['$nChips', item.price] },
        aCosmeticPurchases: { $concatArrays: [{ $ifNull: ['$aCosmeticPurchases', []] }, [{ ...purchase, previousChips: '$nChips' }]] },
      } }], { new: true }).lean();
      if (updated) return inventory(updated);
      const current = await User.findById(userId).lean();
      if (current?.aCosmeticPurchases?.some(entry => entry.id === id)) return inventory(current);
      fail('You need 500 chips to buy this theme.');
    },
    async equip(userId, id) {
      if (typeof id !== 'string') fail('Choose a table theme.');
      if (id) findItem(id);
      const filter = { _id: userId };
      if (id) filter['aCosmeticPurchases.id'] = id;
      const user = await User.findOneAndUpdate(filter, { $set: { sTableTheme: id } }, { new: true }).lean();
      if (!user) fail('Purchase this theme before using it.');
      return inventory(user);
    },
  };
}
module.exports = { createCosmeticService, catalog };
