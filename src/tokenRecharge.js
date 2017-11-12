#!/usr/bin/env node

const fs = require("fs");
const prompt = require('prompt');
const colors = require("colors/safe");
const keythereum = require("keythereum");


const wanchainLog = require('../utils/wanchainLog');
const tokenInit = require('../utils/tokenInitFunc');

const config = require('../config');

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
			let privKeyA = keythereum.recover(result.keyPassword, keyAObj);
			let address = keystore.address;
			let waddress = keystore.waddress;

			tokenInit(address, waddress, privKeyA);

		} catch (e) {
			wanchainLog('Password invalid', config.consoleColor.COLOR_FgRed);
		}
	});
});

