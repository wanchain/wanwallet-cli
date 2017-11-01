var config = require('../../config');
var checkBalance = require('./checkBanlance');
var preScTransfer = require('../preScTransfer');

function A2OTA(prompt, web3, keythereum, Tx, ethUtil, keystoreStr, wanchainLog) {
	let keystore = JSON.parse(keystoreStr)[1];
	console.log('you keystore: ', keystore);

	wanchainLog('Now to unlock your wallet, input your password', config.consoleColor.COLOR_FgGreen);
	prompt.get(require('../schema/keyPassword'), function (err, result) {
		wanchainLog('waiting for unlock wallet....', config.consoleColor.COLOR_FgRed);

		let keyAObj = {version:keystore.version, crypto:keystore.crypto};

		try {
			var privKeyA = keythereum.recover(result.keyPassword, keyAObj);
			var address = keystore.address;

			var weiToEth = checkBalance(web3, address);

			if (weiToEth === '0') {
				wanchainLog('the address balance is 0 eth, pls recharge first.', config.consoleColor.COLOR_FgRed);
			} else {
				wanchainLog('Perfect! Now your address had unlocked, would you want to send transaction? (y[Y]/n[N])', config.consoleColor.COLOR_FgGreen);

				prompt.get(require('../schema/isTransaction'), function (err, result) {
					var theState = result.state.toLowerCase();
					switch (theState) {
						case 'y':
							wanchainLog('input receiver waddress', config.consoleColor.COLOR_FgGreen);

							prompt.get(require('../schema/privacyAddr'), function (err, result) {
								var to_waddress = result.waddress;

								var contractInstanceAddress = config.contractInstanceAddress;

								wanchainLog('input sender value(eth): ', config.consoleColor.COLOR_FgGreen);
								prompt.get(require('../schema/theValue'), function (err, result) {
									var strSendValueInWei = web3.toWei(result.value);
									var bnSendValueInWei = new web3.BigNumber(strSendValueInWei);
									var value = '0x' + bnSendValueInWei.toString(16);

									preScTransfer(web3, Tx, ethUtil, privKeyA,address, to_waddress, contractInstanceAddress, value, result.value, wanchainLog);
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

module.exports = A2OTA;