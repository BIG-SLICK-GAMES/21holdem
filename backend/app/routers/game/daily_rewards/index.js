const router = require('express').Router();
const controllers = require('./lib/controllers');
const commonMiddleware = require('../../middleware');

router.get('/preview', controllers.previewDailyRewards);

router.use(commonMiddleware.isTokenAuthenticated);

router.get('/', controllers.getDailyRewards);
router.post('/claim', controllers.claimDailyReward);

module.exports = router;
