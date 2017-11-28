const config = require('../../config');
const checkBalance = require('./checkBalance');

function isRecharge(state, prompt, web3, wanchainLog) {
	if (state === 'y') {
		wanchainLog('you want to recharge', config.consoleColor.COLOR_FgGreen);
	} else {
		console.log('you not cant to recharge');
		return;
	}
}

module.exports = isRecharge;