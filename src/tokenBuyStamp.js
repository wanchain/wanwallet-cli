
const fs = require('fs');
const keythereum = require("keythereum");

const prompt = require('prompt');
const colors = require("colors/safe");

const config = require('../config');

const wanchainLog = require('../utils/wanchainLog');
const buyStamp = require('../utils/buyStampFunc');

// Start the prompt
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green(">>");

wanchainLog('Input your keystore file name: ', config.consoleColor.COLOR_FgGreen);
prompt.get(require('../utils/schema/ordinaryKeystore'), function (err, result) {
	let keystore;
	try {
		let filename = "./keystore/" + result.ordinaryKeystore + ".json";
		let keystoreStr = fs.readFileSync(filename, "utf8");

		keystore = JSON.parse(keystoreStr)[1];
		keystore.address = keystore.address.slice(2);
		keystore.waddress = keystore.waddress.slice(2);
		console.log('Your keystore: ', keystore);
	} catch (e) {
		wanchainLog('File name invalid (ignore file extension)', config.consoleColor.COLOR_FgRed);
		return;
	}

	wanchainLog('Pls input your password to unlock your wallet', config.consoleColor.COLOR_FgGreen);
	prompt.get(require('../utils/schema/keyPassword'), function (err, result) {
		wanchainLog('Waiting for unlock wallet....', config.consoleColor.COLOR_FgRed);

		let keyAObj = {version:keystore.version, crypto:keystore.crypto};

		try {
			const privKeyA = keythereum.recover(result.keyPassword, keyAObj);
			const address = '0x' + keystore.address;
			const waddress = keystore.waddress;
			const value = 10000000000000000;

			buyStamp(privKeyA, address, waddress, value);

		} catch (e) {
			wanchainLog('Password invalid', config.consoleColor.COLOR_FgRed);
		}
	});
});
