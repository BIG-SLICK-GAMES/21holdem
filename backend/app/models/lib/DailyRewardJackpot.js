const mongoose = require('mongoose');

// One durable, globally shared gate, independent of player and ledger retention.
module.exports = mongoose.model('daily_reward_jackpot', new mongoose.Schema({
  _id: String,
  iClaimId: mongoose.Schema.Types.ObjectId,
  iUserId: mongoose.Schema.Types.ObjectId,
  dReservedAt: Date,
  dNextEligibleAt: Date,
  bPending: Boolean,
}));
