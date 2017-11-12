#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Web3 = require("web3");
const solc = require('solc');
const keythereum = require("keythereum");

const wanUtil = require('wanchain-util');
const ethUtil = wanUtil.ethereumUtil;
const prompt = require('prompt');
const colors = require("colors/safe");

const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));
const wanchainLog = require('../utils/wanchainLog');
const stamp2json = require('../utils/stamp2json');
const tokenOTAsend = require('../utils/tokenOTAsend');
const tokenTransfer = require('../utils/tokenTransferFunc');

web3.wan = new wanUtil.web3Wan(web3);

// Start the prompt
prompt.start();
prompt.message = colors.blue("wanWallet");
prompt.delimiter = colors.green(">>");

wanchainLog('Input your keystore file name: ', config.consoleColor.COLOR_FgGreen);
prompt.get(require('../utils/schema/ordinaryKeystore'), function (err, result) {
	let filename;
	let keystoreStr;
	try{
		filename = "./keystore/" + result.ordinaryKeystore + ".json";
		keystoreStr = fs.readFileSync(filename, "utf8");
	} catch (e) {
		wanchainLog('File name invalid (ignore file extension)', config.consoleColor.COLOR_FgRed);
		return;
	}

	let keystore = JSON.parse(keystoreStr)[1];
	keystore.address = keystore.address.slice(2);
	keystore.waddress = keystore.waddress.slice(2);
	console.log('you keystore: ', keystore);

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
			keystore.privKeyA = privKeyA;
			keystore.privKeyB = privKeyB;
			myAddr = '0x'+keystore.address;
		}
		catch (e) {
			wanchainLog('Password invalid', config.consoleColor.COLOR_FgRed);
			return;
		}

		let index = 0;
		let tokenStr;
		try{
			tokenStr = fs.readFileSync('./otaData/tokenData.txt', "utf8");
			tokenStr = tokenStr.split('\n');
		} catch (e) {
			wanchainLog('No token data', config.consoleColor.COLOR_FgRed);
			return;
		}

		let data={};
		try{
			let tokenOtaStr = fs.readFileSync('./otaData/tokenOTAdata.txt', "utf8");
			tokenOtaStr = tokenOtaStr.split('\n');
			data.token = tokenStr;
			data.ota = tokenOtaStr;
		} catch (e) {
			data.token = tokenStr;
		}
		let tokenData = tokenTransfer(data);

		for (let i=0; i<tokenData.length; i++) {
			let tokenDataJson = tokenData[i];
			let receiver = tokenDataJson.receiver;
			let otaAddr = tokenDataJson.otaAddr;
			let otaBalance = tokenDataJson.balance;

			if (receiver === myAddr) {
				index +=1;
				wanchainLog("ota address: " + otaAddr + " balance: " + otaBalance, config.consoleColor.COLOR_FgGreen);
			}
		}

		if (index === 0) {
			wanchainLog('No token ota address', config.consoleColor.COLOR_FgYellow);
			return;
		}

		wanchainLog('Input token ota address: ', config.consoleColor.COLOR_FgYellow);
		prompt.get(require('../utils/schema/balanceSchema'), function (err, result) {
			let token_to_ota_addr = result.balance;

			wanchainLog("Input receiver's waddress", config.consoleColor.COLOR_FgGreen);
			prompt.get(require('../utils/schema/privacyAddr'), function (err, result) {
				let token_to_waddr = result.waddress.slice(2);

				let stampStr;
				try {
					stampStr = fs.readFileSync('./otaData/stampData.txt', 'utf8');
				}
				catch (e) {
					wanchainLog('No stamp data.', config.consoleColor.COLOR_FgRed);
					return;
				}

				let stampTotal = stampStr.split('\n');
				let stampData = [];
				for (let i=0; i<stampTotal.length; i++) {
					if (stampTotal[i].length >0) {
						if(JSON.parse(stampTotal[i]).address === keystore.address) {
							stampData.push(stampTotal[i]);
						}
					}
				}

				if (stampData.length === 0) {
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

					let account2 = keystore;
					account2.address = '0x' + account2.address;

					let stamp = result.waddress;

					let token_to_ota3 =  ethUtil.generateOTAWaddress(token_to_waddr).toLowerCase();
					let token_to_ota_a3 = ethUtil.recoverPubkeyFromWaddress(token_to_ota3).A;
					let token_to_ota_addr3 = "0x"+ethUtil.sha3(token_to_ota_a3.slice(1)).slice(-20).toString('hex');

					let receiver_waddr = ethUtil.recoverPubkeyFromWaddress(token_to_waddr).A;
					let receiver_addr = "0x"+ethUtil.sha3(receiver_waddr.slice(1)).slice(-20).toString('hex');
					// console.log("token_to_ota_addr2:",  token_to_ota_addr3);
					// console.log("token_to_ota2:",token_to_ota3);

					let otaKey = {};

					// caculate the private key of ota addr.
					let privateKey = ethUtil.computeWaddrPrivateKey(TokenInstance.otaKey(token_to_ota_addr), account2.privKeyA, account2.privKeyB);
					otaKey.address =token_to_ota_addr;
					otaKey.privKeyA = privateKey;

					tokenOTAsend(TokenAddress, TokenInstance, token_to_ota_addr3, token_to_ota3, stamp, account2, otaKey, parseInt(otaBalance), myAddr, receiver_addr);
				});
			});
		});
	});
});
