var prompt = require('prompt');
var colors = require("colors/safe");
let wanUtil = require('wanchain-util');
const Web3 = require("web3");

var fs = require('fs');
var ethUtil = require('ethereumjs-util');
var ethUtilCrypto = require('crypto');
var ethUtilScrypt = require('scryptsy');
var ethUtilUuid = require('uuid');
var path = require('path');

var config = require('../config');

var web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));
var wanchainLog = require('../utils/wanchainLog');

web3.wan = new wanUtil.web3Wan(web3);
// Start the prompt
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green("$");

// var createKeystore = require('../createKeystore');

prompt.get(require('../utils/schema/mykeystore'), function (err, result) {
	var filename = result.OrdinaryKeystore;
	prompt.get(require('../utils/schema/keyPassword'), function (err, result) {
		var password = result.keyPassword;
		wanchainLog('Please copy your file name, passord and addresses which would be used later', config.consoleColor.COLOR_FgRed);
		createKeystore(password, filename, wanchainLog);
	})
});

function createKeystore(password, fileName, wanchainLog) {
	var filepath = __dirname + '/keystore/' + fileName + '.json';
	var result = [];

	try {
		fs.readFileSync(filepath, 'utf8');

		result = [false];
		return result;

	} catch (e) {
		var Crypto = [];
		var privKeys = [];

		for (var i=0; i<2; i++) {

			var salt = ethUtilCrypto.randomBytes(32);
			var iv = ethUtilCrypto.randomBytes(16);
			var derivedKey;
			var kdf = 'scrypt';
			var kdfparams = {
				dklen: 32,
				salt: salt.toString('hex')
			};

			// FIXME: support progress reporting callback
			kdfparams.n = 1024;
			kdfparams.r = 8;
			kdfparams.p = 1;
			derivedKey = ethUtilScrypt(new Buffer(password), salt, kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen);

			//privKey.push(derivedKey);

			var cipher = ethUtilCrypto.createCipheriv('aes-128-ctr', derivedKey.slice(0, 16), iv);
			if (!cipher) {
				throw new Error('Unsupported cipher')
			}

			var privkeyRandom = ethUtilCrypto.randomBytes(32);
			var privkey = Buffer(privkeyRandom, 'hex');
			privKeys.push(privkey);

			var ciphertext = Buffer.concat([cipher.update(privkey), cipher.final()]);

			var mac = wanUtil.ethereumUtil.sha3(Buffer.concat([derivedKey.slice(16, 32), new Buffer(ciphertext, 'hex')]));

			Crypto.push(
				{
					ciphertext: ciphertext.toString('hex'),
					cipherparams: { iv: iv.toString('hex') },
					cipher: 'aes-128-ctr',
					kdf: kdf,
					kdfparams: kdfparams,
					mac: mac.toString('hex')
				}
			)
		}

		var waddress = wanUtil.ethereumUtil.generateWaddrFromPriv(privKeys[0], privKeys[1]);
		var address = '0x' + ethUtil.privateToAddress(privKeys[0]).toString('hex');

		var data = {
			version: 3,
			id: ethUtilUuid.v4({
				random: ethUtilCrypto.randomBytes(16)
			}),
			address: address.toString('hex'),
			crypto: Crypto[0],
			crypto2: Crypto[1],
			waddress: waddress
		};

		result = [true, data];

		fs.writeFileSync(filepath, JSON.stringify(result));
		wanchainLog('\naddress: ' + data.address + '\nwaddress: ' + data.waddress + '\npassword: ' + password + '\nfilename: ' + fileName, '\x1b[32m');
		wanchainLog('the keystore file has been created successful!', '\x1b[33m');
		return result;
	}
}
