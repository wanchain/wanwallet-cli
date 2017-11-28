const exec = require('child_process').exec;
const prompt = require('prompt');
const optimist = require('optimist')
    .string('ordinaryAddr');
const colors = require("colors/safe");
const wanUtil = require('wanchain-util');
const Web3 = require("web3");

const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

web3.wan = new wanUtil.web3Wan(web3);
const wanchainLog = require('../utils/wanchainLog');

// Start the prompt
prompt.start();
prompt.override = optimist.argv;
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green(">>");

wanchainLog("Input address", config.consoleColor.COLOR_FgGreen);
prompt.get(require('../utils/schema/ordinaryAddr'), function (err, result) {
	let cmdStr;
	try{
		cmdStr = 'curl -d "userAddr=' + result.ordinaryAddr + '" ' + config.host + ':3000/faucet';
	} catch (e) {
		return;
	}

	exec(cmdStr, function(err,stdout,stderr){

		if(err) {
			wanchainLog('Get recharge error: '+stderr, config.consoleColor.COLOR_FgRed);

		} else {
			wanchainLog('Recharge successful！ '+stdout, config.consoleColor.COLOR_FgGreen);

		}

	});
});
