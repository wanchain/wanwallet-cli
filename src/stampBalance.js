const fs = require('fs');
const prompt = require('prompt');
const colors = require("colors/safe");
const wanUtil = require('wanchain-util');
const Web3 = require("web3");

const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

const wanchainLog = require('../utils/wanchainLog');

web3.wan = new wanUtil.web3Wan(web3);
// Start the prompt
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green("$");

wanchainLog("Input address", config.consoleColor.COLOR_FgGreen);
prompt.get(require('../utils/schema/ordinaryAddr'), function (err, result) {

	let address = result.address.slice(2);

	let stampDataStr = fs.readFileSync("./otaData/stampData.txt","utf8");
	let stampDataTotal = stampDataStr.split('\n');

	let otaData = [];
	for (let i=0; i<stampDataTotal.length; i++) {
		if (stampDataTotal[i].length >0) {
			if(JSON.parse(stampDataTotal[i]).address === address) {
				otaData.push(stampDataTotal[i])
			}
		}
	}


	try {
		try {
			let stampDataStateStr = fs.readFileSync("./otaData/stampDataState.txt","utf8");
			let stampDataState = stampDataStateStr.split('\n');

			const statTuple = [];

			const otaDict = [];
			for (let i =0; i<stampDataState.length; i++) {
				if(stampDataState[i].trim().length >0) {
					const otaState = stampDataState[i].split('{')[1].split(':')[0].split('"')[1];
					statTuple.push(otaState);
					otaDict.push(stampDataState[i].split('{')[1].split('}')[0]);
				}
			}

			let otaDictStr = '{';
			for (let i =0; i< otaDict.length; i++) {
				otaDictStr += otaDict[i];
				if (i !== otaDict.length -1) {
					otaDictStr += ',';
				}
			}

			otaDictStr += '}';

			otaDictStr = JSON.parse(otaDictStr);

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
	} catch (e) {
		wanchainLog('Not have otaData.', config.consoleColor.COLOR_FgRed);
	}
});
