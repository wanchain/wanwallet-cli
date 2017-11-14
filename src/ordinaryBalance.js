const prompt = require('prompt');
const optimist = require('optimist')
	.string('ordinaryAddr');
const colors = require("colors/safe");
const wanUtil = require('wanchain-util');
const Web3 = require("web3");

const config = require('../config');
const checkBalance = require('../utils/promptFunc/checkBalance');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

const wanchainLog = require('../utils/wanchainLog');

web3.wan = new wanUtil.web3Wan(web3);
// Start the prompt
prompt.override = optimist.argv;
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green(">>");
wanchainLog("Input address", config.consoleColor.COLOR_FgGreen);
prompt.get(require('../utils/schema/ordinaryAddr'), function (err, result) {
    let weiToEth;
	try{
		weiToEth = checkBalance(web3, result.ordinaryAddr);
	} catch (e) {
		return;
	}
	wanchainLog(weiToEth.toString() + ' eth', config.consoleColor.COLOR_FgGreen);
});