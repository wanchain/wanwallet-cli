var config = require('../../config');
var checkBalance = require('./checkBanlance');
var sendTransaction = require('../sendTransaction');

function A2B(prompt, web3, keythereum, Tx, keystoreStr, wanchainLog) {
	let keystore = JSON.parse(keystoreStr)[1];
	console.log('you keystore: ', keystore);

	wanchainLog('Pls input your password to unlock your wallet', config.consoleColor.COLOR_FgGreen);
	prompt.get(require('../schema/keyPassword'), function (err, result) {
		wanchainLog('waiting for unlock wallet....', config.consoleColor.COLOR_FgRed);

		let keyAObj = {version:keystore.version, crypto:keystore.crypto};

		try {
			const privKeyA = keythereum.recover(result.keyPassword, keyAObj);
			const address = keystore.address;

			const weiToEth = checkBalance(web3, address);

			if (weiToEth === '0') {
				wanchainLog('the address balance is 0 eth, pls recharge first.', config.consoleColor.COLOR_FgRed);
			} else {
				wanchainLog('Your wallet has been unlocked. Would you want to send a transaction? (y[Y]/n[N])', config.consoleColor.COLOR_FgGreen);

				prompt.get(require('../schema/isTransaction'), function (err, result) {
					const theState = result.state.toLowerCase();
					switch (theState) {
						case 'y':
							wanchainLog('Input receiver\'s address', config.consoleColor.COLOR_FgGreen);

							prompt.get(require('../schema/ordinaryAddr'), function (err, result) {
								const receiver = result.address;

								wanchainLog('Input value(eth): ', config.consoleColor.COLOR_FgGreen);
								prompt.get(require('../schema/theValue'), function (err, result) {
									const strSendValueInWei = web3.toWei(result.value);
									const bnSendValueInWei = new web3.BigNumber(strSendValueInWei);
									const value = '0x' + bnSendValueInWei.toString(16);

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
		} catch (e) {
			wanchainLog('password invalid', config.consoleColor.COLOR_FgRed);
		}
	});
}

module.exports = A2B;