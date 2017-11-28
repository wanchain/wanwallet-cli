const config = require('../../config');
const checkBalance = require('./checkBalance');
const isRecharge = require('./isRecharge');

function isKeystore(state, prompt, web3, wanchainLog) {
	if (state === 'y') {
		prompt.get(require('../schema/ordinaryAddr'), function (err, result) {
			let weiToEth = checkBalance(web3, result.ordinaryAddr);
			if (weiToEth === '0') {
				wanchainLog(weiToEth.toString() + ' eth', config.consoleColor.COLOR_FgGreen);
				wanchainLog('the address balance is 0 eth, do you want to recharge?', config.consoleColor.COLOR_FgGreen);
				wanchainLog('pls input: \n' + 'y[Y]\n' + 'n[N]', config.consoleColor.COLOR_FgGreen);

				prompt.get(require('./utils/schema/isTransaction'), function (err, result) {
					let theState = result.state.toLowerCase();
					switch (theState) {
						case 'y':
							isRecharge('y', prompt, web3, wanchainLog);
							break;
						case 'n':
							wanchainLog('Bye!', config.consoleColor.COLOR_FgGreen);
							break;
					}
				});

			} else {
				wanchainLog(
					`		
	3 (OTA Transaction)
	4 (Check the Ordinary Transaction balance)
	5 (Check OTA balance)`, config.consoleColor.COLOR_FgYellow);
			}
		});
	} else {
		console.log('+++++++++');
	}
}

module.exports = isKeystore;