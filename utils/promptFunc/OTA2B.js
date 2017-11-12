const fs = require('fs');
const config = require('../../config');

const txt2json = require('../txt2json');
const checkOTAvalue = require('../checkOTAvalue');
const otaTransaction = require('../otaTransaction');
const wanchainLog = require('../wanchainLog');


function OTA2B(prompt, keythereum, keystoreStr) {
	let keystore = JSON.parse(keystoreStr)[1];
	console.log('you keystore: ', keystore);

	wanchainLog('Now to unlock your wallet, input your password', config.consoleColor.COLOR_FgGreen);
	prompt.get(require('../schema/keyPassword'), function (err, result) {
		wanchainLog('Waiting for unlock wallet....', config.consoleColor.COLOR_FgRed);
		let keyAObj = {version:keystore.version, crypto:keystore.crypto};
		let keyBObj = {version:keystore.version, crypto:keystore.crypto2};

		let privKeyA;
		let privKeyB;
		let address;
		let waddress;

		try {
			privKeyA = keythereum.recover(result.keyPassword, keyAObj);
			privKeyB = keythereum.recover(result.keyPassword, keyBObj);
			address = keystore.address;
			waddress = keystore.waddress;
		} catch (e) {
			wanchainLog('Password invalid', config.consoleColor.COLOR_FgRed);
			return;
		}

		wanchainLog('Your wallet has been unlocked. Would you want to send a transaction? (y[Y]/n[N])', config.consoleColor.COLOR_FgGreen);
		prompt.get(require('../schema/ordinaryState'), function (err, result) {
			let theState = result.state.toLowerCase();
			switch (theState) {
				case 'y':

					let otaData = [];
					try {
						let otaDataStr = fs.readFileSync("./otaData/otaData.txt","utf8");
						let otaDataTotal = otaDataStr.split('\n');

						for (let i=0; i<otaDataTotal.length; i++) {
							if (otaDataTotal[i].length >0) {
								if(JSON.parse(otaDataTotal[i]).waddress === waddress) {
									otaData.push(otaDataTotal[i]);
								}
							}
						}
					} catch (e) {
						wanchainLog('Not have otaData.', config.consoleColor.COLOR_FgRed);
						return;
					}

					if (otaData.length === 0) {
						wanchainLog('There is no transaction input to OTA.', config.consoleColor.COLOR_FgGreen);
						return;
					}

					let otaDataUndo;
					try {
						let otaDataStateStr = fs.readFileSync("./otaData/otaDataState.txt","utf8");
						let otaDataState = otaDataStateStr.split('\n');
						otaDataUndo = txt2json(otaData, otaDataState)[0];
					} catch (e) {
						otaDataUndo = txt2json(otaData)[0];
					}

					if (otaDataUndo.length === 0) {
						wanchainLog('There is no  transaction input to OTA.', config.consoleColor.COLOR_FgGreen);
						return;
					} else {
						for (let i = 0; i<otaDataUndo.length; i++) {
							let index = i +1;
							wanchainLog(index + '. ' + 'ota: ' + otaDataUndo[i].ota + ' value: ' + otaDataUndo[i].value + '\n', config.consoleColor.COLOR_FgYellow);
						}
					}

					wanchainLog('Input ota ', config.consoleColor.COLOR_FgGreen);
					prompt.get(require('../schema/privacyAddr'), function (err, result) {
						let ota = result.waddress;
						let checkState = checkOTAvalue(ota, otaDataUndo);
						if (checkState[0]) {
							let value = checkState[1];
							wanchainLog('You select ota: ' + ota + ' value: ' + value, config.consoleColor.COLOR_FgRed);
							otaTransaction(ota, parseInt(value), privKeyA, privKeyB, address.slice(2));
						} else {
							wanchainLog('Value is 0.', config.consoleColor.COLOR_FgRed);
						}
					});

					break;

				case 'n':
					wanchainLog('Bye!', config.consoleColor.COLOR_FgGreen);
					break;
			}
		});
	});

}

module.exports = OTA2B;