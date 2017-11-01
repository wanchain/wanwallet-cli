const fs = require('fs');
const prompt = require('prompt');
const colors = require("colors/safe");
const wanUtil = require('wanchain-util');
const Web3 = require("web3");

const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

const wanchainLog = require('../utils/wanchainLog');
const otaDataStateFunc = require('../utils/otaDataStateFunc');

web3.wan = new wanUtil.web3Wan(web3);

// Start the prompt
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green("$");

wanchainLog("Input waddress", config.consoleColor.COLOR_FgGreen);
prompt.get(require('../utils/schema/privacyAddr'), function (err, result) {

	let waddress = result.waddress;

	try {
		let otaDataStr = fs.readFileSync("./otaData/otaData.txt","utf8");
		let otaDataTotal = otaDataStr.split('\n');

		let otaData = [];
		for (let i=0; i<otaDataTotal.length; i++) {
			if (otaDataTotal[i].length >0) {
				if(JSON.parse(otaDataTotal[i]).waddress === waddress) {
					otaData.push(otaDataTotal[i])
				}
			}
		}

		try {
			let otaDataStateStr = fs.readFileSync("./otaData/otaDataState.txt","utf8");

			let result = otaDataStateFunc(otaDataStateStr);
			let otaDictStr = result[0];
			let statTuple = result[1];

			if (otaData.length === 0) {
				wanchainLog('There is no  transaction input to OTA.', config.consoleColor.COLOR_FgRed);
				return;
			}


			for (let i = 0; i<otaData.length; i++) {
				const index = i +1;
				if (otaData[i].trim().length >0) {
					const otaDataJson = JSON.parse(otaData[i]);

					if (statTuple.indexOf(otaDataJson.ota) === -1) {
						wanchainLog('Your otaData ' + index + ' >> '  + ' ota: ' + otaDataJson.ota + ' value: ' + otaDataJson.value + ' state: ' + otaDataJson.state, config.consoleColor.COLOR_FgGreen);
					} else {
						wanchainLog('Your otaData ' + index + ' >> '  + ' ota: ' + otaDataJson.ota + ' value: ' + otaDataJson.value + ' state: ' + otaDictStr[otaDataJson.ota], config.consoleColor.COLOR_FgGreen);
					}
				}
			}
		} catch (e) {
			for (let i = 0; i<otaData.length; i++) {
				const index = i +1;
				if (otaData[i].trim().length >0) {
					const otaDataJson = JSON.parse(otaData[i]);

					wanchainLog('Your otaData ' + index + ' >> '  + ' ota: ' + otaDataJson.ota + ' value: ' + otaDataJson.value + ' state: ' + otaDataJson.state, config.consoleColor.COLOR_FgGreen);
				}
			}
		}
	} catch (e) {
		wanchainLog('There is no  transaction input to OTA.', config.consoleColor.COLOR_FgRed);
	}
});
