#!/usr/bin/env node

const Web3 = require('web3');
const fs = require("fs");
const prompt = require('prompt');
const colors = require("colors/safe");
const wanUtil = require('wanchain-util');
const path = require('path');
const solc = require('solc');


const wanchainLog = require('../utils/wanchainLog');
const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

web3.wan = new wanUtil.web3Wan(web3);

// Start the prompt
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green(">>");

wanchainLog("Input address", config.consoleColor.COLOR_FgGreen);
prompt.get(require('../utils/schema/balanceSchema'), function (err, result) {

	let TokenAddress = fs.readFileSync("ERC20.addr","utf8");
	let content = fs.readFileSync(path.join("../sol", "ERC20.sol"), 'utf8');
	let compiled = solc.compile(content, 1);
	let privacyContract = web3.eth.contract(JSON.parse(compiled.contracts[':ERC20'].interface));
	let TokenInstance = privacyContract.at(TokenAddress);

	let balance = TokenInstance.otabalanceOf(result.balance).toString();

	wanchainLog("Token balance of " + result.balance + " is " + balance, config.consoleColor.COLOR_FgGreen);

	try{
		let tokenStr = fs.readFileSync('./otaData/tokenData.txt', "utf8");
		let tokenData = tokenStr.split('\n');

		for (let i=0; i<tokenData.length -1; i++) {
			let tokenJson = JSON.parse(tokenData[i]);

			if (tokenJson.address === result.balance) {
				wanchainLog("Token ota balance of " + tokenJson.address + " is " + tokenJson.balance, config.consoleColor.COLOR_FgGreen);
			}
		}

	} catch (e) {
		wanchainLog("No token ota", config.consoleColor.COLOR_FgGreen);
	}

});
