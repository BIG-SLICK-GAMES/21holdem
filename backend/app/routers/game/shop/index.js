const router = require('express').Router();
const bodyParser = require('body-parser');
const controllers = require('./lib/controllers');
const commonMiddleware = require('../../middleware');

router.post('/stripe/webhook', bodyParser.raw({ type: 'application/json' }), controllers.stripeWebhook);

router.get('/', controllers.getShopList);

router.use(commonMiddleware.isAuthenticated);
router.post('/buy', controllers.buyItem);
router.get('/confirm', controllers.confirmPayment);

module.exports = router;
