const fs = require('fs');
const prompt = require('prompt');
const colors = require("colors/safe");
const wanUtil = require('wanchain-util');
const keythereum = require("keythereum");
const Tx = require('wanchain-util').ethereumTx;
const Web3 = require("web3");

const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

const wanchainLog = require('../utils/wanchainLog');
const A2B = require('../utils/promptFunc/A2B');

web3.wan = new wanUtil.web3Wan(web3);
// Start the prompt
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green(">>");

wanchainLog('Input your keystore file name: ', config.consoleColor.COLOR_FgGreen);
prompt.get(require('../utils/schema/ordinaryKeystore'), function (err, result) {
	try {
		let filename = "./keystore/" + result.ordinaryKeystore + ".json";
		let keystoreStr = fs.readFileSync(filename, "utf8");
		A2B(prompt, web3, keythereum, Tx, keystoreStr, wanchainLog);
	} catch (e) {
		wanchainLog('File name invalid (ignore file extension)', config.consoleColor.COLOR_FgRed);
	}
});



