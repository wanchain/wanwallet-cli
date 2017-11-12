const prompt = require('prompt');
const optimist = require('optimist');
const colors = require("colors/safe");
const wanUtil = require('wanchain-util');
const Web3 = require("web3");
const createKeystore = require('../utils/createKeystore');
const config = require('../config');
const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));
const wanchainLog = require('../utils/wanchainLog');

web3.wan = new wanUtil.web3Wan(web3);

// Start the prompt
prompt.override = optimist.argv;
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green(">>");


prompt.get(require('../utils/schema/ordinaryKeystore'), function (err, result) {
	let filename;
	try {
		filename = result.OrdinaryKeystore;
	} catch (e) {
		return;
	}
	prompt.get(require('../utils/schema/keyPassword'), function (err, result) {
		let password = result.keyPassword;
		createKeystore(password, filename, wanchainLog);
	});
});
