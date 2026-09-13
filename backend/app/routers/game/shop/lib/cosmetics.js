const { User, Transaction } = require('../../../../models');
const { createCosmeticService, catalog } = require('./cosmetic-service');
const service = createCosmeticService({ User, Transaction });
const handle = action => async (req, res) => {
  try { res.json({ data: await action(req) }); }
  catch (error) {
    if (!error.status) console.error('Cosmetic shop:', error);
    res.status(error.status || 500).json({ message: error.status ? error.message : 'The shop is unavailable. Please try again.' });
  }
};
exports.catalog = handle(() => catalog);
exports.inventory = handle(req => service.get(req.user._id));
exports.buy = handle(req => service.buy(req.user._id, req.body.id));
exports.equip = handle(req => service.equip(req.user._id, req.body.id));
