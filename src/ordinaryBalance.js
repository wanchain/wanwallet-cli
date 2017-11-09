const prompt = require('prompt');
const colors = require("colors/safe");
const wanUtil = require('wanchain-util');
const Web3 = require("web3");

const config = require('../config');
const checkBanlance = require('../utils/promptFunc/checkBanlance');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

const wanchainLog = require('../utils/wanchainLog');

web3.wan = new wanUtil.web3Wan(web3);
// Start the prompt
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green(">>");

wanchainLog("Input address", config.consoleColor.COLOR_FgGreen);
prompt.get(require('../utils/schema/balanceSchema'), function (err, result) {
	let weiToEth;
	try{
		weiToEth = checkBanlance(web3, result.balance);
	} catch (e) {
		return;
	}
	wanchainLog(weiToEth.toString() + ' eth', config.consoleColor.COLOR_FgGreen);
});