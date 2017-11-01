const fs = require('fs');
const prompt = require('prompt');
const colors = require("colors/safe");
const wanUtil = require('wanchain-util');
const keythereum = require("keythereum");
const Tx = require('wanchain-util').ethereumTx;
const Web3 = require("web3");
const ethUtil = require('wanchain-util').ethereumUtil;

const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

const wanchainLog = require('../utils/wanchainLog');
const txt2json = require('../utils/txt2json');
const checkOTAvalue = require('../utils/checkOTAvalue');
const otaTransaction = require('../utils/otaRefund');

web3.wan = new wanUtil.web3Wan(web3);

// Start the prompt
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green("$");

wanchainLog('Input your keystore file name: ', config.consoleColor.COLOR_FgGreen);
prompt.get(require('../utils/schema/mykeystore'), function (err, result) {
	try {
		let filename = "./keystore/" + result.OrdinaryKeystore + ".json";
		let keystoreStr = fs.readFileSync(filename, "utf8");
		OTA2B(prompt, web3, keythereum, Tx, ethUtil, keystoreStr, wanchainLog);
	} catch (e) {
		wanchainLog('file name invalid (without file format)', config.consoleColor.COLOR_FgRed);
	}
});


function OTA2B(prompt, web3, keythereum, Tx, ethUtil, keystoreStr, wanchainLog) {
	let keystore = JSON.parse(keystoreStr)[1];
	console.log('you keystore: ', keystore);

	wanchainLog('Now to unlock your wallet, input your password', config.consoleColor.COLOR_FgGreen);

	let keyAObj = {version:keystore.version, crypto:keystore.crypto};
	let keyBObj = {version:keystore.version, crypto:keystore.crypto2};

	try {
		prompt.get(require('../utils/schema/keyPassword'), function (err, result) {
			wanchainLog('waiting for unlock wallet....', config.consoleColor.COLOR_FgRed);

			let privKeyA = keythereum.recover(result.keyPassword, keyAObj);
			let privKeyB = keythereum.recover(result.keyPassword, keyBObj);
			let address = keystore.address;
			let waddress = keystore.waddress;

			wanchainLog('Your wallet has been unlocked. Would you want to send a transaction?', config.consoleColor.COLOR_FgGreen);

			prompt.get(require('../utils/schema/isTransaction'), function (err, result) {
				var theState = result.state.toLowerCase();
				switch (theState) {
					case 'y':

						try {
							let otaDataStr = fs.readFileSync("./otaData/otaData.txt","utf8");
							let otaDataTotal = otaDataStr.split('\n');

							let otaData = [];
							for (let i=0; i<otaDataTotal.length; i++) {
								if (otaDataTotal[i].length >0) {
									if(JSON.parse(otaDataTotal[i]).waddress === waddress) {
										otaData.push(otaDataTotal[i])
									}
								}
							}

							try {
								let otaDataStateStr = fs.readFileSync("./otaData/otaDataState.txt","utf8");
								let otaDataState = otaDataStateStr.split('\n');

								let otaDataUndo = txt2json(otaData, otaDataState)[0];
								for (let i = 0; i<otaDataUndo.length; i++) {
									let index = i +1;
									wanchainLog(index + '. ' + 'ota: ' + otaDataUndo[i].ota + ' value: ' + otaDataUndo[i].value + '\n', config.consoleColor.COLOR_FgYellow);
								}

								wanchainLog('input ota ', config.consoleColor.COLOR_FgGreen);
								prompt.get(require('../utils/schema/privacyAddr'), function (err, result) {
									let ota = result.waddress;
									let checkState = checkOTAvalue(ota, otaDataUndo);
									if (checkState[0]) {
										let value = checkState[1];
										wanchainLog('You select ota: ' + ota + ' value: ' + value, config.consoleColor.COLOR_FgRed);
										otaTransaction(ota, parseInt(value), privKeyA, privKeyB, address.slice(2))
									} else {
										wanchainLog('Value is 0.', config.consoleColor.COLOR_FgRed);
									}
								});
							} catch (e) {
								let otaDataUndo = txt2json(otaData)[0];
								for (let i = 0; i<otaDataUndo.length; i++) {
									let index = i +1;
									wanchainLog(index + '. ' + 'ota: ' + otaDataUndo[i].ota + ' value: ' + otaDataUndo[i].value + '\n', config.consoleColor.COLOR_FgYellow);
								}

								wanchainLog('input ota ', config.consoleColor.COLOR_FgGreen);
								prompt.get(require('../utils/schema/privacyAddr'), function (err, result) {
									let ota = result.waddress;
									let checkState = checkOTAvalue(ota, otaDataUndo);
									if (checkState[0]) {
										let value = checkState[1];
										wanchainLog('You select ota: ' + ota + ' value: ' + value, config.consoleColor.COLOR_FgRed);
										otaTransaction(ota, parseInt(value), privKeyA, privKeyB, address.slice(2))
									} else {
										wanchainLog('Value is 0.', config.consoleColor.COLOR_FgRed);
									}
								});
							}

						} catch (e) {
							wanchainLog('Not have otaData.', config.consoleColor.COLOR_FgRed);
						}
						break;

					case 'n':
						wanchainLog('Bye!', config.consoleColor.COLOR_FgGreen);
						break;
				}
			});
		});
	} catch (e) {
		wanchainLog('password invalid', config.consoleColor.COLOR_FgRed);
	}
}