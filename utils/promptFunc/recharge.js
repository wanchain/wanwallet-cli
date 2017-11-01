var config = require('../../config');
var checkBalance = require('./checkBanlance');
var sendTransaction = require('../sendTransaction');

function recharge(prompt, web3, Tx, wanchainLog) {

	try {
		var privKeyA = "";
		var address = "";

		var weiToEth = checkBalance(web3, address);

		if (weiToEth === '0') {
			wanchainLog('the address balance is 0 eth, pls recharge first.', config.consoleColor.COLOR_FgRed);
		} else {
			wanchainLog('Perfect! Now your address had unlocked, would you want to send transaction? (y[Y]/n[N])', config.consoleColor.COLOR_FgGreen);

			prompt.get(require('../schema/isTransaction'), function (err, result) {
				var theState = result.state.toLowerCase();
				switch (theState) {
					case 'y':
						wanchainLog('input receiver address', config.consoleColor.COLOR_FgGreen);

						prompt.get(require('../schema/ordinaryAddr'), function (err, result) {
							var receiver = result.address;

							wanchainLog('input sender value(eth): ', config.consoleColor.COLOR_FgGreen);
							prompt.get(require('../schema/theValue'), function (err, result) {
								var strSendValueInWei = web3.toWei(result.value);
								var bnSendValueInWei = new web3.BigNumber(strSendValueInWei);
								var value = '0x' + bnSendValueInWei.toString(16);

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

}

module.exports = recharge;