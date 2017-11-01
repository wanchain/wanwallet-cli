var fs = require('fs');
var config = require('../../config');

var txt2json = require('../txt2json');
var checkOTAvalue = require('../checkOTAvalue');
var otaTransaction = require('../otaTransaction');
var wanchainLog = require('../wanchainLog');


function OTA2B(prompt, keythereum, keystoreStr) {
	let keystore = JSON.parse(keystoreStr)[1];
	console.log('you keystore: ', keystore);

	wanchainLog('Now to unlock your wallet, input your password', config.consoleColor.COLOR_FgGreen);

	let keyAObj = {version:keystore.version, crypto:keystore.crypto};
	let keyBObj = {version:keystore.version, crypto:keystore.crypto2};

	try {
		prompt.get(require('../schema/keyPassword'), function (err, result) {
			wanchainLog('waiting for unlock wallet....', config.consoleColor.COLOR_FgRed);

			let privKeyA = keythereum.recover(result.keyPassword, keyAObj);
			let privKeyB = keythereum.recover(result.keyPassword, keyBObj);
			let address = keystore.address;
			let waddress = keystore.waddress;

			wanchainLog('Your wallet has been unlocked. Would you want to send a transaction?', config.consoleColor.COLOR_FgGreen);

			prompt.get(require('../schema/isTransaction'), function (err, result) {
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

							if (otaData.length === 0) {
								wanchainLog('There is no  transaction input to OTA.', config.consoleColor.COLOR_FgGreen);
								return;
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
								prompt.get(require('../schema/privacyAddr'), function (err, result) {
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
								prompt.get(require('../schema/privacyAddr'), function (err, result) {
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

module.exports = OTA2B;