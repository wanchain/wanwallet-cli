const fs = require('fs');
const prompt = require('prompt');
const colors = require("colors/safe");
const wanUtil = require('wanchain-util');
const Web3 = require("web3");

const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

const wanchainLog = require('../utils/wanchainLog');
const stampDataStateFunc = require('../utils/stampDataStateFunc');

web3.wan = new wanUtil.web3Wan(web3);
// Start the prompt
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green(">>");

wanchainLog("Input address", config.consoleColor.COLOR_FgGreen);
prompt.get(require('../utils/schema/ordinaryAddr'), function (err, result) {

	let address = result.address.slice(2);

	let stampDataTotal;
	try {
		let stampDataStr = fs.readFileSync("./otaData/stampData.txt","utf8");
		stampDataTotal = stampDataStr.split('\n');
	} catch (e) {
		wanchainLog('No ota data.', config.consoleColor.COLOR_FgRed);
		return;
	}


	let otaData = [];
	for (let i=0; i<stampDataTotal.length; i++) {
		if (stampDataTotal[i].length >0) {
			if(JSON.parse(stampDataTotal[i]).address === address) {
				otaData.push(stampDataTotal[i])
			}
		}
	}

	if (otaData.length === 0) {
		wanchainLog('No ota data.', config.consoleColor.COLOR_FgRed);
		return;
	}

	try {
		let stampDataStateStr = fs.readFileSync("./otaData/stampDataState.txt","utf8");
		let result = stampDataStateFunc(stampDataStateStr);
		let otaDictStr = result[0];
		let statTuple = result[1];

		for (let i = 0; i<otaData.length; i++) {
			const index = i +1;
			if (otaData[i].trim().length >0) {
				const otaDataJson = JSON.parse(otaData[i]);

				if (statTuple.indexOf(otaDataJson.stamp) === -1) {
					wanchainLog('Your stamp ' + index + ' >> '  + ' stamp: ' + otaDataJson.stamp + ' value: ' + otaDataJson.value + ' state: ' + otaDataJson.state, config.consoleColor.COLOR_FgGreen);
				} else {
					wanchainLog('Your stamp ' + index + ' >> '  + ' stamp: ' + otaDataJson.stamp + ' value: ' + otaDataJson.value + ' state: ' + otaDictStr[otaDataJson.stamp], config.consoleColor.COLOR_FgGreen);
				}
			}
		}
	} catch (e) {
		for (let i = 0; i<otaData.length; i++) {
			const index = i +1;
			if (otaData[i].trim().length >0) {
				const otaDataJson = JSON.parse(otaData[i]);

				wanchainLog('Your stamp ' + index + ' >> '  + ' stamp: ' + otaDataJson.stamp + ' value: ' + otaDataJson.value + ' state: ' + otaDataJson.state, config.consoleColor.COLOR_FgGreen);
			}
		}
	}
});
