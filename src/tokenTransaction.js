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
prompt.delimiter = colors.green("$");


wanchainLog('Input your keystore file name: ', config.consoleColor.COLOR_FgGreen);
prompt.get(require('../utils/schema/mykeystore'), function (err, result) {
	try {
		let filename = "./keystore/" + result.OrdinaryKeystore + ".json";
		let keystoreStr = fs.readFileSync(filename, "utf8");

		let keystore = JSON.parse(keystoreStr)[1];
		keystore.address = keystore.address.slice(2);
		keystore.waddress = keystore.waddress.slice(2);
		console.log('you keystore: ', keystore);

		wanchainLog('Pls input your password to unlock your wallet', config.consoleColor.COLOR_FgGreen);
		prompt.get(require('../utils/schema/keyPassword'), function (err, result) {
			wanchainLog('waiting for unlock wallet....', config.consoleColor.COLOR_FgRed);

			let content = fs.readFileSync(path.join("../sol", "ERC20.sol"), 'utf8');
			let compiled = solc.compile(content, 1);
			let privacyContract = web3.eth.contract(JSON.parse(compiled.contracts[':ERC20'].interface));
			let TokenAddress = fs.readFileSync("ERC20.addr","utf8");
			let TokenInstance = privacyContract.at(TokenAddress);


			try {

				let keyPassword = result.keyPassword;
				let keyAObj = {version:keystore.version, crypto:keystore.crypto};
				let keyBObj = {version:keystore.version, crypto:keystore.crypto2};
				let privKeyA = keythereum.recover(keyPassword, keyAObj);
				let privKeyB = keythereum.recover(keyPassword, keyBObj);
				let myAddr = '0x'+keystore.address;


				wanchainLog("Input waddress", config.consoleColor.COLOR_FgGreen);
				prompt.get(require('../utils/schema/privacyAddr'), function (err, result) {
					let token_to_waddr = result.waddress.slice(2);

					wanchainLog('Input value: ', config.consoleColor.COLOR_FgGreen);
					prompt.get(require('../utils/schema/theValue'), function (err, result) {
						const value = result.value;

						try {
							let stampStr = fs.readFileSync('./otaData/stampData.txt', 'utf8');
							let stampTotal = stampStr.split('\n');

							try{
								let stampData = [];
								for (let i=0; i<stampTotal.length; i++) {
									if (stampTotal[i].length >0) {
										if(JSON.parse(stampTotal[i]).address === keystore.address) {
											stampData.push(stampTotal[i])
										}
									}
								}

								let stampDataStateStr = fs.readFileSync("./otaData/stampDataState.txt","utf8");
								let stampDataState = stampDataStateStr.split('\n');

								let stampDataUndo = stamp2json(stampData, stampDataState)[0];

								for (let i = 0; i<stampDataUndo.length; i++) {
									wanchainLog('address: 0x' + stampDataUndo[i].address + ' stamp: ' + stampDataUndo[i].stamp + ' value: ' + stampDataUndo[i].value + '\n', config.consoleColor.COLOR_FgYellow);
								}

								wanchainLog("Input stamp", config.consoleColor.COLOR_FgGreen);
								prompt.get(require('../utils/schema/privacyAddr'), function (err, result) {
									let stamp = result.waddress;

									tokenSend(TokenAddress, TokenInstance, stamp, value, token_to_waddr, keystore.address, privKeyA,privKeyB, myAddr);
								})

							} catch (e) {
								let stampData = [];
								for (let i=0; i<stampTotal.length; i++) {
									if (stampTotal[i].length >0) {
										if(JSON.parse(stampTotal[i]).address === keystore.address) {
											stampData.push(JSON.parse(stampTotal[i]));
										}
									}
								}

								for (let i=0; i<stampData.length; i++) {
									wanchainLog('address: 0x' + stampData[i].address + ' stamp: ' + stampData[i].stamp + ' value: ' + stampData[i].value + '\n', config.consoleColor.COLOR_FgYellow);
								}

								wanchainLog("Input stamp", config.consoleColor.COLOR_FgGreen);
								prompt.get(require('../utils/schema/privacyAddr'), function (err, result) {
									let stamp = result.waddress;

									tokenSend(TokenAddress, TokenInstance, stamp, value, token_to_waddr, keystore.address, privKeyA,privKeyB, myAddr);

								})
							}

						} catch (e) {
							wanchainLog('have not stampData.', config.consoleColor.COLOR_FgRed);
						}
					})
				})

			} catch (e) {
				wanchainLog('password invalid', config.consoleColor.COLOR_FgRed);
			}
		});
	} catch (e) {
		wanchainLog('file name invalid (without file format)', config.consoleColor.COLOR_FgRed);
	}
});

