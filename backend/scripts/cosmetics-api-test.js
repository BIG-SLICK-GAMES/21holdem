const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const User = require('../app/models/lib/User');
const device = `cosmetic-api-qa-${new mongoose.Types.ObjectId()}`;
const base = process.env.QA_API_BASE || 'http://game-backend:4000';
(async () => {
  await mongoose.connect(process.env.MONGO_URI || process.env.DB_URL);
  let user;
  try {
    const login = await fetch(`${base}/api/v1/auth/guestLogin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sDeviceId: device }) }).then(r => r.json());
    user = await User.findOneAndUpdate({ sDeviceId: device }, { $set: { isEmailVerified: true, nChips: 2500 } }, { new: true });
    assert.ok(user, 'Temporary QA account created');
    const token = login.data.sToken;
    const api = async (path, body) => {
      const response = await fetch(`${base}/api/v1/${path}`, { method: body ? 'POST' : 'GET', headers: { Authorization: token, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
      const result = await response.json();
      assert.equal(response.status, 200, `${path}: ${result.message}`);
      return result.data;
    };
    const catalog = await api('shop/cosmetics');
    for (const item of catalog) {
      await api('shop/cosmetics/buy', { id: item.id });
      const equipped = await api('shop/cosmetics/equip', { id: item.id });
      assert.equal(equipped.equipped, item.id);
      assert.equal((await api('shop/cosmetics/inventory')).equipped, item.id);
      const profile = await api('profile');
      assert.equal(profile.sTableTheme, item.id, 'Real authenticated profile must expose saved equipped theme');
      console.log('PASS real buy -> equip -> inventory -> profile:', item.id);
    }
    await api('shop/cosmetics/equip', { id: '' });
    assert.equal((await api('profile')).sTableTheme, '');
  } finally {
    if (user) await mongoose.connection.collection('transactions').deleteMany({ iUserId: user._id });
    await User.deleteOne({ sDeviceId: device });
    await mongoose.disconnect();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
