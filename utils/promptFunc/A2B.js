const config = require('../../config');
const checkBalance = require('./checkBanlance');
const sendTransaction = require('../sendTransaction');

function A2B(prompt, web3, keythereum, Tx, keystoreStr, wanchainLog) {
	let keystore = JSON.parse(keystoreStr)[1];
	console.log('you keystore: ', keystore);

	wanchainLog('Pls input your password to unlock your wallet', config.consoleColor.COLOR_FgGreen);
	prompt.get(require('../schema/keyPassword'), function (err, result) {
		wanchainLog('Waiting for unlock wallet....', config.consoleColor.COLOR_FgRed);

		let keyAObj = {version:keystore.version, crypto:keystore.crypto};

		let privKeyA;
		let address;
		let weiToEth;
		try {
			privKeyA = keythereum.recover(result.keyPassword, keyAObj);
			address = keystore.address;
			weiToEth = checkBalance(web3, address);
		} catch (e) {
			wanchainLog('Password invalid', config.consoleColor.COLOR_FgRed);
			return;
		}

		if (weiToEth === '0') {
			wanchainLog('This address balance is 0 eth, pls recharge first.', config.consoleColor.COLOR_FgRed);
		} else {
			wanchainLog('Your wallet has been unlocked. Would you want to send a transaction? (y[Y]/n[N])', config.consoleColor.COLOR_FgGreen);
			prompt.get(require('../schema/ordinaryState'), function (err, result) {
				let theState = result.state.toLowerCase();
				switch (theState) {

					case 'y':
						wanchainLog('Input receiver\'s address', config.consoleColor.COLOR_FgGreen);

						prompt.get(require('../schema/ordinaryAddr'), function (err, result) {
                            let receiver = result.address;

							wanchainLog('Input value(eth): ', config.consoleColor.COLOR_FgGreen);
							prompt.get(require('../schema/ordinaryValue'), function (err, result) {
                                let strSendValueInWei = web3.toWei(result.value);
                                let bnSendValueInWei = new web3.BigNumber(strSendValueInWei);
                                let value = '0x' + bnSendValueInWei.toString(16);

								sendTransaction(web3, Tx, receiver, address, privKeyA, value, wanchainLog);
							});
						});
						break;

					case 'n':
						wanchainLog('Bye!', config.consoleColor.COLOR_FgGreen);
						break;
				}
			});
		}
	});
}

module.exports = A2B;