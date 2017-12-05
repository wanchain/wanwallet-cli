const {defineSupportCode} = require('cucumber');

function CustomWorld() {
    const wanUtil = require('wanchain-util');
    const Web3 = require("web3");
    const checkBalance = require('../../utils/promptFunc/checkBalance');
    this.config = require('../../config');
    const web3 = new Web3(new Web3.providers.HttpProvider( this.config.host + ":8545"));

    this.setAddress = function(newaddress) {
        this.address = newaddress;
    };

    this.getBalance = function() {
        return checkBalance(web3, this.address);
    };

    this.getNewAddress = function() {
        const ethUtil = require('ethereumjs-util');
        const ethUtilCrypto = require('crypto');
        const ethUtilScrypt = require('scryptsy');

        let password = '1234ab';
        let privKeys = [];
        for (let i=0; i<2; i++) {

            let salt = ethUtilCrypto.randomBytes(32);
            let iv = ethUtilCrypto.randomBytes(16);
            let derivedKey;
            let kdfparams = {
                dklen: 32,
                salt: salt.toString('hex')
            };

            // FIXME: support progress reporting callback
            kdfparams.n = 1024;
            kdfparams.r = 8;
            kdfparams.p = 1;
            derivedKey = ethUtilScrypt(new Buffer(password), salt, kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen);

            let cipher = ethUtilCrypto.createCipheriv('aes-128-ctr', derivedKey.slice(0, 16), iv);
            if (!cipher) {
                throw new Error('Unsupported cipher');
            }

            let privkeyRandom = ethUtilCrypto.randomBytes(32);
            let privkey = Buffer(privkeyRandom, 'hex');
            privKeys.push(privkey);
        }

        this.waddress = wanUtil.ethereumUtil.generateWaddrFromPriv(privKeys[0], privKeys[1]);
        this.address = '0x' + ethUtil.privateToAddress(privKeys[0]).toString('hex');
    };

    this.waitForTx = function(txHash) {
        let filter = web3.eth.filter('latest');
        let blockAfter = 0;
        filter.watch(function (err, blockhash) {
            if (err) {
                filter.stopWatching();
                console.log("err:" + err);
            } else {
                let receipt = web3.eth.getTransactionReceipt(txHash);
                blockAfter += 1;
                if (receipt) {
                    filter.stopWatching();
                    console.log("Confirmed");
                } else if (blockAfter > 6) {
                    filter.stopWatching();
                    console.log("Failed");
                }
            }
        });
    };
}

defineSupportCode(function({setWorldConstructor}) {
    setWorldConstructor(CustomWorld);
});
