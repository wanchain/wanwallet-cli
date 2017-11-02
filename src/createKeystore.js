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
	var filename = result.OrdinaryKeystore;
	prompt.get(require('../utils/schema/keyPassword'), function (err, result) {
		var password = result.keyPassword;
		wanchainLog('Please copy your file name, passord and addresses which would be used later', config.consoleColor.COLOR_FgRed);
		createKeystore(password, filename, wanchainLog);
	})
});
