#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Web3 = require("web3");
const solc = require('solc');
const keythereum = require("keythereum");

const wanUtil = require('wanchain-util');
const prompt = require('prompt');
const colors = require("colors/safe");

const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));
const wanchainLog = require('../utils/wanchainLog');
const stamp2json = require('../utils/stamp2json');
const tokenSend = require('../utils/tokenSend');

web3.wan = new wanUtil.web3Wan(web3);

// Start the prompt
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green(">>");


wanchainLog('Input your keystore file name: ', config.consoleColor.COLOR_FgGreen);
prompt.get(require('../utils/schema/ordinaryKeystore'), function (err, result) {

	let keystore;
	try {
		let filename = "./keystore/" + result.OrdinaryKeystore + ".json";
		let keystoreStr = fs.readFileSync(filename, "utf8");

		keystore = JSON.parse(keystoreStr)[1];
		keystore.address = keystore.address.slice(2);
		keystore.waddress = keystore.waddress.slice(2);
		console.log('Your keystore: ', keystore);
	} catch (e) {
		wanchainLog('File name invalid (ignore file extension)', config.consoleColor.COLOR_FgRed);
		return;
	}


	wanchainLog('Pls input your password to unlock your wallet', config.consoleColor.COLOR_FgGreen);
	prompt.get(require('../utils/schema/keyPassword'), function (err, result) {
		wanchainLog('Waiting for unlock wallet....', config.consoleColor.COLOR_FgRed);

		let content = fs.readFileSync(path.join("../sol", "ERC20.sol"), 'utf8');
		let compiled = solc.compile(content, 1);
		let privacyContract = web3.eth.contract(JSON.parse(compiled.contracts[':ERC20'].interface));
		let TokenAddress = fs.readFileSync("ERC20.addr","utf8");
		let TokenInstance = privacyContract.at(TokenAddress);

		let privKeyA;
		let privKeyB;
		let myAddr;
		try {
			let keyPassword = result.keyPassword;
			let keyAObj = {version:keystore.version, crypto:keystore.crypto};
			let keyBObj = {version:keystore.version, crypto:keystore.crypto2};
			privKeyA = keythereum.recover(keyPassword, keyAObj);
			privKeyB = keythereum.recover(keyPassword, keyBObj);
			myAddr = '0x'+keystore.address;
		} catch (e) {
			wanchainLog('Password invalid', config.consoleColor.COLOR_FgRed);
			return;
		}

		wanchainLog("Input receiver's waddress", config.consoleColor.COLOR_FgGreen);
		prompt.get(require('../utils/schema/privacyAddr'), function (err, result) {
			let token_to_waddr = result.waddress.slice(2);

			wanchainLog('Input value: ', config.consoleColor.COLOR_FgGreen);
			prompt.get(require('../utils/schema/tokenValue'), function (err, result) {
				let value = result.value;

				let stampData = [];
				try {
					let stampStr = fs.readFileSync('./otaData/stampData.txt', 'utf8');
					let stampTotal = stampStr.split('\n');

					for (let i=0; i<stampTotal.length; i++) {
						if (stampTotal[i].length >0) {
							if(JSON.parse(stampTotal[i]).address === keystore.address) {
								stampData.push(JSON.parse(stampTotal[i]));
							}
						}
					}
				} catch (e) {
					wanchainLog('No stamp data.', config.consoleColor.COLOR_FgRed);
					return;
				}

				let stampDataUndo;
				try{

					let stampDataStateStr = fs.readFileSync("./otaData/stampDataState.txt","utf8");
					let stampDataState = stampDataStateStr.split('\n');

					stampDataUndo = stamp2json(stampData, stampDataState)[0];
				} catch (e) {
					stampDataUndo = stampData;
				}

				if (stampDataUndo.length === 0) {
					wanchainLog('No stamp data.', config.consoleColor.COLOR_FgRed);
					return;
				}

				for (let i = 0; i<stampDataUndo.length; i++) {
					wanchainLog('address: 0x' + stampDataUndo[i].address + ' stamp: ' + stampDataUndo[i].stamp + ' value: ' + stampDataUndo[i].value + '\n', config.consoleColor.COLOR_FgYellow);
				}

				wanchainLog("Input stamp", config.consoleColor.COLOR_FgGreen);
				prompt.get(require('../utils/schema/privacyAddr'), function (err, result) {
					let stamp = result.waddress;

					tokenSend(TokenAddress, TokenInstance, stamp, value, token_to_waddr, keystore.address, privKeyA,privKeyB, myAddr);
				});
			});
		});
	});
});

