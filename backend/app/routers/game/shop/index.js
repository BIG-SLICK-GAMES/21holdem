const router = require('express').Router();
const bodyParser = require('body-parser');
const controllers = require('./lib/controllers');
const commonMiddleware = require('../../middleware');
const cosmetics = require('./lib/cosmetics');

router.post('/stripe/webhook', bodyParser.raw({ type: 'application/json' }), controllers.stripeWebhook);

router.get('/', controllers.getShopList);
router.get('/cosmetics', cosmetics.catalog);

router.use(commonMiddleware.isAuthenticated);
router.get('/cosmetics/inventory', cosmetics.inventory);
router.post('/cosmetics/buy', cosmetics.buy);
router.post('/cosmetics/equip', cosmetics.equip);
router.post('/buy', controllers.buyItem);
router.get('/confirm', controllers.confirmPayment);

module.exports = router;
