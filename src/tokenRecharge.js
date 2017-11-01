#!/usr/bin/env node

const Web3 = require('web3');
const fs = require("fs");
const Tx = require('wanchain-util').ethereumTx;
const prompt = require('prompt');
const colors = require("colors/safe");
const wanUtil = require('wanchain-util');
const keythereum = require("keythereum");
const path = require('path');
const solc = require('solc');


const wanchainLog = require('../utils/wanchainLog');
const config = require('../config');

const web3 = new Web3(new Web3.providers.HttpProvider( config.host + ":8545"));

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
		console.log('you keystore: ', keystore);

		wanchainLog('Pls input your password to unlock your wallet', config.consoleColor.COLOR_FgGreen);
		prompt.get(require('../utils/schema/keyPassword'), function (err, result) {
			wanchainLog('waiting for unlock wallet....', config.consoleColor.COLOR_FgRed);

			let keyAObj = {version:keystore.version, crypto:keystore.crypto};

			try {
				const privKeyA = keythereum.recover(result.keyPassword, keyAObj);
				const address = keystore.address;
				const waddress = keystore.waddress;

			 	tokenInit(address, waddress, privKeyA);

			} catch (e) {
				wanchainLog('password invalid', config.consoleColor.COLOR_FgRed);
			}
		});
	} catch (e) {
		wanchainLog('file name invalid (without file format)', config.consoleColor.COLOR_FgRed);
	}
});

async function tokenInit(address, waddress, privKeyA) {
	let TokenAddress = fs.readFileSync("ERC20.addr","utf8");
	let content = fs.readFileSync(path.join("../sol", "ERC20.sol"), 'utf8');
	let compiled = solc.compile(content, 1);
	let privacyContract = web3.eth.contract(JSON.parse(compiled.contracts[':ERC20'].interface));
	let TokenInstance = privacyContract.at(TokenAddress);

	let mintdata = TokenInstance.initPrivacyAsset.getData(address, waddress.slice(2), "0xf4240");

	var serial = '0x' + web3.eth.getTransactionCount(address).toString(16);
	var rawTx = {
		Txtype: '0x00',
		nonce: serial,
		gasPrice: '0x6fc23ac00',
		gasLimit: '0xf4240',
		to: TokenAddress,
		value: '0x00',
		data: mintdata
	};
	// console.log("payload: " + rawTx.data.toString('hex'));

	var tx = new Tx(rawTx);
	tx.sign(privKeyA);
	var serializedTx = tx.serialize();
	let hash = web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'));
	// console.log("serializeTx:" + serializedTx.toString('hex'));
	console.log('tx hash:'+hash);
	wanchainLog('waiting for a moment...', config.consoleColor.COLOR_FgRed);

	let receipt = await getTransactionReceipt(hash);
	console.log(receipt);
	console.log("Token balance of ",address, " is ", TokenInstance.otabalanceOf(address).toString(), "key is ", TokenInstance.otaKey(address));
}

function getTransactionReceipt(txHash)
{
	return new Promise(function(success,fail){
		let filter = web3.eth.filter('latest');
		let blockAfter = 0;
		filter.watch(function(err,blockhash){
			if(err ){
				console.log("err:"+err);
				fail("err:"+err);
			}else{
				let receipt = web3.eth.getTransactionReceipt(txHash);
				blockAfter += 1;
				if(receipt){
					filter.stopWatching();
					success(receipt);
					return receipt;
				}else if(blockAfter > 6){
					fail("Get receipt timeout");
				}
			}
		});
	});
}
