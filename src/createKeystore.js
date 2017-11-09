var prompt = require('prompt');
var colors = require("colors/safe");
let wanUtil = require('wanchain-util');
const Web3 = require("web3");

var createKeystore = require('../utils/createKeystore');

var config = require('../config');

var web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));
var wanchainLog = require('../utils/wanchainLog');

web3.wan = new wanUtil.web3Wan(web3);

// Start the prompt
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green(">>");


prompt.get(require('../utils/schema/mykeystore'), function (err, result) {
	let filename;
	try {
		filename = result.OrdinaryKeystore;
	} catch (e) {
		return;
	}
	prompt.get(require('../utils/schema/keyPassword'), function (err, result) {
		var password = result.keyPassword;
		createKeystore(password, filename, wanchainLog);
	})
});
