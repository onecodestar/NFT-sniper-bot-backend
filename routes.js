const jwt = require('jsonwebtoken');
const multer = require('multer');
const Wallet = require('./models/wallet');
const config = require('./config');
const requireAuth = require('./middlewares/requireAuth');
const requireSniper = require('./middlewares/requireSniper');
const requireAdmin = require('./middlewares/requireAdmin');
const requirePresale = require('./middlewares/requirePresale');
const requireNFT = require('./middlewares/requireNFT');
const {
  authenticate,
  register,
  validateRegister,
  changePassword
} = require('./controllers/restController');
const nftSnipper = require('./controllers/nftSnipper');
// const pancakeSnipper = require('./controllers/pancakeSnipper');
// const uniswapSnipper = require('./controllers/uniswapSnipper');
// const presaleSnipper = require('./controllers/presaleSnipper');
// const swing = require('./controllers/swing');
const walletController = require('./controllers/walletController');
const authorizationController = require('./controllers/authorizationController');
const icyController = require('./controllers/icyController');
const settingController = require('./controllers/settingController');

const router = require('express').Router();
const path = require('path');

router.post('/authenticate', authenticate);
router.post('/register', validateRegister, register);
router.post('/change-password', requireAuth, changePassword);
//nft
router.post('/nft/addBot', [requireAuth, requireNFT], nftSnipper.addBot);
router.post('/nft/delBot', [requireAuth, requireNFT], nftSnipper.delBot);
router.post('/nft/readPlan', [requireAuth, requireNFT], nftSnipper.readPlan);
router.post('/nft/readLog', [requireAuth, requireNFT], nftSnipper.readLog);
router.post('/nft/readAllPlans', [requireAdmin], nftSnipper.readAllPlans);
router.post('/nft/readAllLogs', [requireAdmin], nftSnipper.readAllLogs);
router.post('/nft/getContractInfo', [], nftSnipper.getContractInfo); 
router.post('/nft/getbots', [], nftSnipper.getBots); //~~~~~~
//pancake
// router.post('/pan/addBot', [requireAuth, requireSniper], pancakeSnipper.addBot);
// router.post('/pan/delBot', [requireAuth], pancakeSnipper.delBot);
// router.post('/pan/readPlan', [requireAuth], pancakeSnipper.readPlan);
// router.post('/pan/letSell', [requireAuth, requireSniper], pancakeSnipper.letSell);
// router.post('/pan/letApprove', [requireAuth, requireSniper], pancakeSnipper.letApprove);
// router.post('/pan/letDel', [requireAuth, requireSniper], pancakeSnipper.letDel);
// //uniswap
// router.post('/uni/addBot', [requireAuth, requireSniper], uniswapSnipper.addBot);
// router.post('/uni/delBot', [requireAuth], uniswapSnipper.delBot);
// router.post('/uni/readPlan', [requireAuth], uniswapSnipper.readPlan);
// router.post('/uni/letSell', [requireAuth], uniswapSnipper.letSell);
// router.post('/uni/letApprove', [requireAuth], uniswapSnipper.letApprove);
// router.post('/uni/letDel', [requireAuth], uniswapSnipper.letDel);

// //presale
// router.post('/pre/add', [requireAuth, requirePresale], presaleSnipper.add);
// router.post('/pre/read', [requireAuth], presaleSnipper.read);
// router.post('/pre/del', [requireAuth, requirePresale], presaleSnipper.del);
// //swing
// router.post('/swing/add', [requireAuth], swing.add);
// router.post('/swing/read', [requireAuth], swing.read);
// router.post('/swing/del', [requireAuth], swing.del);
//wallets
router.post('/wallet/read', [requireAdmin], walletController.read);
router.post('/wallet/lock', [requireAdmin], walletController.lock);
router.post('/wallet/admin', [requireAdmin], walletController.admin);
//authorization
router.post('/authorization/read', [requireAdmin], authorizationController.read);
router.post('/authorization/add', [requireAdmin], authorizationController.add);
router.post('/authorization/delete', [requireAdmin], authorizationController.delete);
//setting
router.post('/setting/read', [], settingController.read);
router.post('/setting/update', [requireAdmin], settingController.update);
router.post('/setting/delete', [requireAdmin], settingController.delete);
//icy
router.post('/icy/getTrendingCollections', [requireAuth, requireNFT], icyController.getTrendingCollections);
router.post('/icy/getTop100Collections', [requireAuth, requireNFT], icyController.getTop100Collections);
router.post('/icy/getContractInfo', [requireAuth, requireNFT], icyController.getContractInfo);
router.post('/icy/searchContracts', [requireAuth, requireNFT], icyController.searchContracts);
router.post('/icy/getTrades', [requireAuth, requireNFT], icyController.getTrades);
router.post('/icy/getTokens', [requireAuth, requireNFT], icyController.getTokens);
router.post('/icy/getTraits', [requireAuth, requireNFT], icyController.getTraits);
router.post('/icy/getHolders', [requireAuth, requireNFT], icyController.getHolders);
router.post('/icy/getNerdBooks', [requireAuth, requireNFT], icyController.getNerdBooks);
router.post('/icy/getNerdTrades', [requireAuth, requireNFT], icyController.getNerdTrades);
router.post('/icy/getTopNFTs', [requireAuth, requireNFT], icyController.getTopNFTs);
router.post('/icy/getTopAccounts', [requireAuth, requireNFT], icyController.getTopAccounts);

module.exports = (app, io) => {
  app.use('/api', router);
  app.get('*', function (req, res) {
    // console.log(req);
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });

  app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
  });

  app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
      message: error.message
    });
  });

  const onConnection = (socket) => {
    // pancakeSnipper.setSocket(io, socket);
    // uniswapSnipper.setSocket(io, socket);
    // swing.setSocket(io, socket);
  };

  //socket middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      if (!socket.user) {
        const decodedToken = jwt.verify(token, config.jwt.secret, {
          algorithm: 'HS256',
          expiresIn: config.jwt.expiry
        });
        const user = await Wallet.findOne({ private: decodedToken.private });
        socket.user = user.toJSON();
      }
    } catch (error) {
      socket.emit('error');
    }
    next();
  });
  io.on('connection', onConnection);
};
