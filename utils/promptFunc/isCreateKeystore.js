const config = require('../../config');

const createKeystore = require('../createKeystore');

function isCreateKeystore(prompt, wanchainLog) {
	prompt.get(require('../schema/ordinaryKeystore'), function (err, result) {
		let filename = result.ordinaryKeystore;
		prompt.get(require('../schema/keyPassword'), function (err, result) {
			let password = result.keyPassword;
			wanchainLog('Please keep your file name, password and Address in mind', config.consoleColor.COLOR_FgRed);
			createKeystore(password, filename, wanchainLog);
		});
	});
}

module.exports = isCreateKeystore;