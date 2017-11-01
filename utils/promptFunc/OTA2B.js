var fs = require('fs');
var config = require('../../config');

var txt2json = require('../txt2json');
var checkOTAvalue = require('../checkOTAvalue');
var otaTransaction = require('../otaTransaction');

function OTA2B(prompt, web3, keythereum, Tx, ethUtil, keystoreStr, wanchainLog) {
	let keystore = JSON.parse(keystoreStr)[1];
	console.log('you keystore: ', keystore);

	wanchainLog('Now to unlock your wallet, input your password', config.consoleColor.COLOR_FgGreen);

	let keyAObj = {version:keystore.version, crypto:keystore.crypto};
	let keyBObj = {version:keystore.version, crypto:keystore.crypto2};

	try {
		prompt.get(require('../schema/keyPassword'), function (err, result) {
			wanchainLog('waiting for unlock wallet....', config.consoleColor.COLOR_FgRed);

			var privKeyA = keythereum.recover(result.keyPassword, keyAObj);
			var privKeyB = keythereum.recover(result.keyPassword, keyBObj);
			let address = keystore.address;

			wanchainLog('Perfect! Now your address had unlocked, would you want to send transaction? (y[Y]/n[N])', config.consoleColor.COLOR_FgGreen);

			prompt.get(require('../schema/isTransaction'), function (err, result) {
				var theState = result.state.toLowerCase();
				switch (theState) {
					case 'y':

						try {
							let otaDataStr = fs.readFileSync("./utils/otaData/otaData.txt","utf8");
							let otaData = otaDataStr.split('\n');

							try {
								let otaDataStateStr = fs.readFileSync("./utils/otaData/otaDataState.txt","utf8");
								let otaDataState = otaDataStateStr.split('\n');

								var otaDataUndo = txt2json(otaData, otaDataState)[0];
								for (var i = 0; i<otaDataUndo.length; i++) {
									var index = i +1;
									wanchainLog(index + '. ' + 'ota: ' + otaDataUndo[i].ota + ' value: ' + otaDataUndo[i].value + '\n', config.consoleColor.COLOR_FgYellow);
								}

								wanchainLog('input ota ', config.consoleColor.COLOR_FgGreen);
								prompt.get(require('../schema/privacyAddr'), function (err, result) {
									var ota = result.waddress;
									var checkState = checkOTAvalue(ota, otaDataUndo);
									if (checkState[0]) {
										var value = checkState[1];
										wanchainLog('You select ota: ' + ota + ' value: ' + value, config.consoleColor.COLOR_FgRed);
										otaTransaction(web3,ethUtil, Tx, ota, value, privKeyA, privKeyB, address);
									} else {
										wanchainLog('Value is 0.', config.consoleColor.COLOR_FgRed);
									}
								});
							} catch (e) {
								var otaDataUndo = txt2json(otaData)[0];
								for (var i = 0; i<otaDataUndo.length; i++) {
									var index = i +1;
									wanchainLog(index + '. ' + 'ota: ' + otaDataUndo[i].ota + ' value: ' + otaDataUndo[i].value + '\n', config.consoleColor.COLOR_FgYellow);
								}

								wanchainLog('input ota ', config.consoleColor.COLOR_FgGreen);
								prompt.get(require('../schema/privacyAddr'), function (err, result) {
									var ota = result.waddress;
									var checkState = checkOTAvalue(ota, otaDataUndo);
									if (checkState[0]) {
										var value = checkState[1];
										wanchainLog('You select ota: ' + ota + ' value: ' + value, config.consoleColor.COLOR_FgRed);
										otaTransaction(web3,ethUtil, Tx, ota, value, privKeyA, privKeyB, address);
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