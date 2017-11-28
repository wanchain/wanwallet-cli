const wanUtil = require('wanchain-util');

const fs = require('fs');
const ethUtil = require('ethereumjs-util');
const ethUtilCrypto = require('crypto');
const ethUtilScrypt = require('scryptsy');
const ethUtilUuid = require('uuid');


function createKeystore(password, fileName, wanchainLog) {
	let filepath = '../src/keystore/' + fileName + '.json';
	let result = [];

	try {
		fs.readFileSync(filepath, 'utf8');

		wanchainLog('Please check is the filename used.', '\x1b[31m');
		result = [false];
		return result;
	} catch (e) {
		wanchainLog('Please copy your file name, passord and addresses which would be used later', '\x1b[31m');
		let Crypto = [];
		let privKeys = [];

		for (let i=0; i<2; i++) {

			let salt = ethUtilCrypto.randomBytes(32);
			let iv = ethUtilCrypto.randomBytes(16);
			let derivedKey;
			let kdf = 'scrypt';
			let kdfparams = {
				dklen: 32,
				salt: salt.toString('hex')
			};

			// FIXME: support progress reporting callback
			kdfparams.n = 1024;
			kdfparams.r = 8;
			kdfparams.p = 1;
			derivedKey = ethUtilScrypt(new Buffer(password), salt, kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen);

			//privKey.push(derivedKey);

			let cipher = ethUtilCrypto.createCipheriv('aes-128-ctr', derivedKey.slice(0, 16), iv);
			if (!cipher) {
				throw new Error('Unsupported cipher')
			}

			let privkeyRandom = ethUtilCrypto.randomBytes(32);
			let privkey = Buffer(privkeyRandom, 'hex');
			privKeys.push(privkey);

			let ciphertext = Buffer.concat([cipher.update(privkey), cipher.final()]);

			let mac = wanUtil.ethereumUtil.sha3(Buffer.concat([derivedKey.slice(16, 32), new Buffer(ciphertext, 'hex')]));

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

		let waddress = wanUtil.ethereumUtil.generateWaddrFromPriv(privKeys[0], privKeys[1]);
		let address = '0x' + ethUtil.privateToAddress(privKeys[0]).toString('hex');

		let data = {
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

module.exports = createKeystore;
