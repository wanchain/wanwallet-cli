var config = require('../../config');
var checkBalance = require('./checkBanlance');
var isRecharge = require('./isRecharge');

var createKeystore = require('../createKeystore');

function isCreateKeystore(prompt, web3, wanchainLog) {
	prompt.get(require('../schema/mykeystore'), function (err, result) {
		var filename = result.OrdinaryKeystore;
		prompt.get(require('../schema/keyPassword'), function (err, result) {
			var password = result.keyPassword;
			wanchainLog('Please keep your file name, password and Address in mind', config.consoleColor.COLOR_FgRed);
			createKeystore(password, filename, wanchainLog);
		})
	});
}

module.exports = isCreateKeystore;